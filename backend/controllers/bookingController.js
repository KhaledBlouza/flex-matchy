// backend/controllers/bookingController.js
const stripe = require('../utils/stripe');
const Booking = require('../models/bookingModel');
const Service = require('../models/serviceModel');
const SportField = require('../models/sportFieldModel');
const User = require('../models/userModel');
const Client = require('../models/clientModel');
const Coach = require('../models/coachModel');
const HealthSpecialist = require('../models/healthSpecialistModel');
const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// Créer une session de paiement Stripe
exports.createPaymentSession = catchAsync(async (req, res, next) => {
  // 1) Obtenir le service ou terrain réservé
  const { serviceId, sportFieldId, date, startTime, endTime, participants } = req.body;
  
  if (!date || !startTime || !endTime) {
    return next(new AppError('Veuillez fournir date, startTime et endTime', 400));
  }
  
  if (!serviceId && !sportFieldId) {
    return next(new AppError('Veuillez fournir serviceId ou sportFieldId', 400));
  }
  
  let bookingData = {
    user: req.user.id,
    date: new Date(date),
    startTime,
    endTime,
    participants: participants || 1,
    status: 'pending'
  };
  
  let productName, productPrice, provider;
  
  if (serviceId) {
    const service = await Service.findById(serviceId).populate({
      path: 'provider',
      select: 'firstName lastName name email'
    });
    
    if (!service) {
      return next(new AppError('Service non trouvé', 404));
    }
    
    bookingData.service = serviceId;
    productName = service.title;
    productPrice = service.price;
    provider = service.provider;
    
    // Vérifier la disponibilité du service
    // Convertir la date en jour de la semaine
    const dayIndex = new Date(date).getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayString = days[dayIndex];
    
    // Vérifier si le service est disponible ce jour-là
    const dayAvailability = service.availability.find(avail => avail.day === dayString);
    
    if (!dayAvailability) {
      return next(new AppError('Le service n\'est pas disponible ce jour', 400));
    }
    
    // Vérifier si l'heure demandée est disponible
    const slotAvailable = dayAvailability.slots.some(slot => {
      return slot.startTime === startTime && !slot.isBooked;
    });
    
    if (!slotAvailable) {
      return next(new AppError('Le créneau n\'est pas disponible', 400));
    }
  } else {
    const sportField = await SportField.findById(sportFieldId);
    
    if (!sportField) {
      return next(new AppError('Terrain non trouvé', 404));
    }
    
    bookingData.sportField = sportFieldId;
    productName = `Réservation de ${sportField.name} - ${sportField.sportType}`;
    
    // Calculer le prix en fonction du temps de réservation
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);
    
    const durationHours = (endHour - startHour) + (endMinute - startMinute) / 60;
    productPrice = sportField.hourlyRate * durationHours;
    provider = sportField;
    
    // Vérifier la disponibilité du terrain
    const dayIndex = new Date(date).getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayString = days[dayIndex];
    
    // Vérifier si le terrain est disponible ce jour-là
    const dayAvailability = sportField.availability.find(avail => avail.day === dayString);
    
    if (!dayAvailability) {
      return next(new AppError('Le terrain n\'est pas disponible ce jour', 400));
    }
    
    // Vérifier si les créneaux demandés sont disponibles
    const slotsAvailable = dayAvailability.slots.every(slot => {
      // Vérifier si le créneau est inclus dans la plage horaire demandée
      const slotStart = slot.startTime;
      const slotEnd = slot.endTime;
      
      // Si le créneau est inclus dans la réservation et est déjà réservé, retourner false
      if (
        ((slotStart >= startTime && slotStart < endTime) || 
         (slotEnd > startTime && slotEnd <= endTime) ||
         (slotStart <= startTime && slotEnd >= endTime)) &&
        slot.isBooked
      ) {
        return false;
      }
      return true;
    });
    
    if (!slotsAvailable) {
      return next(new AppError('Un ou plusieurs créneaux ne sont pas disponibles', 400));
    }
  }
  
  // Ajouter le montant au booking
  bookingData.payment = {
    amount: productPrice,
    method: req.body.paymentMethod || 'online',
    status: 'pending'
  };
  
  // 2) Créer la réservation temporaire
  const booking = await Booking.create(bookingData);
  
  // 3) Si le paiement est en espèces, terminer ici
  if (req.body.paymentMethod === 'cash') {
    // Mettre à jour le statut de la réservation
    booking.status = 'confirmed';
    booking.payment.status = 'pending'; // Le paiement sera effectué en personne
    await booking.save();
    
    // Mettre à jour la disponibilité du service ou du terrain
    if (serviceId) {
      await updateServiceAvailability(serviceId, date, startTime);
    } else {
      await updateFieldAvailability(sportFieldId, date, startTime, endTime, booking._id);
    }
    
    // Créer une notification pour le fournisseur
    await createBookingNotification(booking, provider, req.user);
    
    // Ajouter la réservation à la liste des réservations du client
    await Client.findByIdAndUpdate(
      req.user.id,
      { $push: { bookings: booking._id } }
    );
    
    return res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  }
  
  // 4) Créer la session de paiement Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/bookings/success?booking=${booking._id}`,
    cancel_url: `${req.protocol}://${req.get('host')}/bookings/cancel?booking=${booking._id}`,
    customer_email: req.user.email,
    client_reference_id: booking._id.toString(),
    line_items: [
      {
        price_data: {
          currency: 'tnd',
          product_data: {
            name: productName,
            description: `Réservation pour le ${new Date(date).toLocaleDateString()} à ${startTime}`
          },
          unit_amount: Math.round(productPrice * 100) // Stripe utilise les centimes
        },
        quantity: 1
      }
    ]
  });
  
  // 5) Envoyer la session au client
  res.status(200).json({
    status: 'success',
    data: {
      session,
      booking
    }
  });
});

// Fonction utilitaire pour mettre à jour la disponibilité d'un service
const updateServiceAvailability = async (serviceId, date, startTime) => {
  const service = await Service.findById(serviceId);
  
  // Convertir la date en jour de la semaine
  const dayIndex = new Date(date).getDay();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayString = days[dayIndex];
  
  // Trouver et mettre à jour le créneau correspondant
  const dayAvailabilityIndex = service.availability.findIndex(avail => avail.day === dayString);
  
  if (dayAvailabilityIndex !== -1) {
    const slotIndex = service.availability[dayAvailabilityIndex].slots.findIndex(
      slot => slot.startTime === startTime
    );
    
    if (slotIndex !== -1) {
      service.availability[dayAvailabilityIndex].slots[slotIndex].isBooked = true;
      await service.save();
    }
  }
};

// Fonction utilitaire pour mettre à jour la disponibilité d'un terrain
const updateFieldAvailability = async (fieldId, date, startTime, endTime, bookingId) => {
  const sportField = await SportField.findById(fieldId);
  
  // Convertir la date en jour de la semaine
  const dayIndex = new Date(date).getDay();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayString = days[dayIndex];
  
  // Trouver et mettre à jour les créneaux correspondants
  const dayAvailabilityIndex = sportField.availability.findIndex(avail => avail.day === dayString);
  
  if (dayAvailabilityIndex !== -1) {
    sportField.availability[dayAvailabilityIndex].slots.forEach((slot, index) => {
      if (
        (slot.startTime >= startTime && slot.startTime < endTime) || 
        (slot.endTime > startTime && slot.endTime <= endTime) ||
        (slot.startTime <= startTime && slot.endTime >= endTime)
      ) {
        sportField.availability[dayAvailabilityIndex].slots[index].isBooked = true;
        sportField.availability[dayAvailabilityIndex].slots[index].booking = bookingId;
      }
    });
    
    await sportField.save();
  }
};

// Fonction utilitaire pour créer une notification de réservation
const createBookingNotification = async (booking, provider, user) => {
  await Notification.create({
    recipient: provider._id,
    sender: user._id,
    type: 'bookingConfirmed',
    title: 'Nouvelle réservation',
    content: `Vous avez une nouvelle réservation de ${user.firstName} ${user.lastName} pour le ${new Date(booking.date).toLocaleDateString()} à ${booking.startTime}`,
    relatedTo: {
      model: 'Booking',
      id: booking._id
    }
  });
};

// Webhook pour Stripe
exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  
  if (event.type === 'checkout.session.completed') {
    await handleBookingSuccess(event.data.object);
  }
  
  res.status(200).json({ received: true });
});

// Gérer le succès du paiement
const handleBookingSuccess = async session => {
  const bookingId = session.client_reference_id;
  const booking = await Booking.findById(bookingId);
  
  if (!booking) return;
  
  // Mettre à jour le statut de la réservation et du paiement
  booking.status = 'confirmed';
  booking.payment.status = 'completed';
  booking.payment.transactionId = session.payment_intent;
  await booking.save();
  
  // Mettre à jour la disponibilité du service ou du terrain
  if (booking.service) {
    await updateServiceAvailability(booking.service, booking.date, booking.startTime);
    
    // Ajouter le client à la liste des clients du coach/spécialiste
    const service = await Service.findById(booking.service);
    if (service.providerModel === 'Coach') {
      await Coach.findByIdAndUpdate(
        service.provider,
        { $addToSet: { clients: booking.user } }
      );
    } else if (service.providerModel === 'HealthSpecialist') {
      await HealthSpecialist.findByIdAndUpdate(
        service.provider,
        { $addToSet: { clients: booking.user } }
      );
    }
  } else if (booking.sportField) {
    await updateFieldAvailability(booking.sportField, booking.date, booking.startTime, booking.endTime, booking._id);
  }
  
  // Ajouter la réservation à la liste des réservations du client
  await Client.findByIdAndUpdate(
    booking.user,
    { $push: { bookings: booking._id } }
  );
  
  // Créer une notification pour le client
  await Notification.create({
    recipient: booking.user,
    type: 'bookingConfirmed',
    title: 'Réservation confirmée',
    content: `Votre réservation pour le ${new Date(booking.date).toLocaleDateString()} à ${booking.startTime} a été confirmée!`,
    relatedTo: {
      model: 'Booking',
      id: booking._id
    }
  });
  
  // Créer une notification pour le fournisseur
  const user = await User.findById(booking.user);
  let provider;
  
  if (booking.service) {
    const service = await Service.findById(booking.service);
    provider = await User.findById(service.provider);
  } else if (booking.sportField) {
    provider = await SportField.findById(booking.sportField);
  }
  
  if (provider) {
    await createBookingNotification(booking, provider, user);
  }
};

// Route pour valider le succès de la réservation (après redirection de Stripe)
exports.bookingSuccess = catchAsync(async (req, res, next) => {
  const { booking: bookingId } = req.query;
  
  if (!bookingId) {
    return next(new AppError('ID de réservation non fourni', 400));
  }
  
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    return next(new AppError('Réservation non trouvée', 404));
  }
  
  if (booking.status === 'pending') {
    booking.status = 'confirmed';
    booking.payment.status = 'completed';
    await booking.save();
    
    // Mettre à jour la disponibilité
    if (booking.service) {
      await updateServiceAvailability(booking.service, booking.date, booking.startTime);
    } else if (booking.sportField) {
      await updateFieldAvailability(booking.sportField, booking.date, booking.startTime, booking.endTime, booking._id);
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// Route pour gérer l'annulation de la réservation
exports.bookingCancel = catchAsync(async (req, res, next) => {
  const { booking: bookingId } = req.query;
  
  if (!bookingId) {
    return next(new AppError('ID de réservation non fourni', 400));
  }
  
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    return next(new AppError('Réservation non trouvée', 404));
  }
  
  if (booking.status === 'pending') {
    booking.status = 'cancelled';
    await booking.save();
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// Annuler une réservation
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const booking = await Booking.findById(id);
  
  if (!booking) {
    return next(new AppError('Réservation non trouvée', 404));
  }
  
  // Vérifier que l'utilisateur est autorisé à annuler la réservation
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'êtes pas autorisé à annuler cette réservation', 403));
  }
  
  // Vérifier que la réservation n'est pas déjà terminée ou annulée
  if (['completed', 'cancelled'].includes(booking.status)) {
    return next(new AppError(`La réservation est déjà ${booking.status === 'completed' ? 'terminée' : 'annulée'}`, 400));
  }
  
  // Annuler la réservation
  booking.status = 'cancelled';
  await booking.save();
  
  // Libérer le créneau
  if (booking.service) {
    // Libérer le créneau du service
    const service = await Service.findById(booking.service);
    
    const dayIndex = new Date(booking.date).getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayString = days[dayIndex];
    
    const dayAvailabilityIndex = service.availability.findIndex(avail => avail.day === dayString);
    
    if (dayAvailabilityIndex !== -1) {
      const slotIndex = service.availability[dayAvailabilityIndex].slots.findIndex(
        slot => slot.startTime === booking.startTime
      );
      
      if (slotIndex !== -1) {
        service.availability[dayAvailabilityIndex].slots[slotIndex].isBooked = false;
        await service.save();
      }
    }
    
    // Notifier le fournisseur
    const provider = await User.findById(service.provider);
    
    await Notification.create({
      recipient: provider._id,
      sender: req.user._id,
      type: 'bookingCancelled',
      title: 'Réservation annulée',
      content: `La réservation de ${req.user.firstName} ${req.user.lastName} pour le ${new Date(booking.date).toLocaleDateString()} à ${booking.startTime} a été annulée.`,
      relatedTo: {
        model: 'Booking',
        id: booking._id
      }
    });
  } else if (booking.sportField) {
    // Libérer les créneaux du terrain
    const sportField = await SportField.findById(booking.sportField);
    
    const dayIndex = new Date(booking.date).getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayString = days[dayIndex];
    
    const dayAvailabilityIndex = sportField.availability.findIndex(avail => avail.day === dayString);
    
    if (dayAvailabilityIndex !== -1) {
      sportField.availability[dayAvailabilityIndex].slots.forEach((slot, index) => {
        if (
          (slot.startTime >= booking.startTime && slot.startTime < booking.endTime) || 
          (slot.endTime > booking.startTime && slot.endTime <= booking.endTime) ||
          (slot.startTime <= booking.startTime && slot.endTime >= booking.endTime)
        ) {
          sportField.availability[dayAvailabilityIndex].slots[index].isBooked = false;
          sportField.availability[dayAvailabilityIndex].slots[index].booking = undefined;
        }
      });
      
      await sportField.save();
    }
    
    // Notifier le propriétaire du terrain
    await Notification.create({
      recipient: sportField._id,
      sender: req.user._id,
      type: 'bookingCancelled',
      title: 'Réservation annulée',
      content: `La réservation de ${req.user.firstName} ${req.user.lastName} pour le ${new Date(booking.date).toLocaleDateString()} à ${booking.startTime} a été annulée.`,
      relatedTo: {
        model: 'Booking',
        id: booking._id
      }
    });
  }
  
  // Si le paiement a été effectué en ligne, initier un remboursement
  if (booking.payment.method === 'online' && booking.payment.status === 'completed' && booking.payment.transactionId) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: booking.payment.transactionId,
        reason: 'requested_by_customer'
      });
      
      booking.payment.status = 'refunded';
      await booking.save();
    } catch (err) {
      console.log('Erreur lors du remboursement:', err);
      // Continuer même en cas d'erreur de remboursement
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// Marquer une réservation comme terminée
exports.completeBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const booking = await Booking.findById(id);
  
  if (!booking) {
    return next(new AppError('Réservation non trouvée', 404));
  }
  
  // Vérifier que l'utilisateur est le fournisseur du service ou du terrain
  let isProvider = false;
  
  if (booking.service) {
    const service = await Service.findById(booking.service);
    isProvider = service.provider.toString() === req.user.id;
  } else if (booking.sportField) {
    const sportField = await SportField.findById(booking.sportField);
    isProvider = sportField._id.toString() === req.user.id;
  }
  
  if (!isProvider && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'êtes pas autorisé à marquer cette réservation comme terminée', 403));
  }
  
  // Vérifier que la réservation n'est pas déjà terminée ou annulée
  if (['completed', 'cancelled'].includes(booking.status)) {
    return next(new AppError(`La réservation est déjà ${booking.status === 'completed' ? 'terminée' : 'annulée'}`, 400));
  }
  
  // Marquer la réservation comme terminée
  booking.status = 'completed';
  await booking.save();
  
  // Notifier le client
  await Notification.create({
    recipient: booking.user,
    sender: req.user._id,
    type: 'reminderSession',
    title: 'Séance terminée',
    content: `Votre séance du ${new Date(booking.date).toLocaleDateString()} à ${booking.startTime} a été marquée comme terminée. N'hésitez pas à laisser un avis!`,
    relatedTo: {
      model: 'Booking',
      id: booking._id
    }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// Obtenir les réservations de l'utilisateur connecté
exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate({
      path: 'service',
      select: 'title price duration provider providerModel'
    })
    .populate({
      path: 'sportField',
      select: 'name sportType hourlyRate'
    });
  
  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

// Obtenir les réservations en tant que fournisseur
exports.getProviderBookings = catchAsync(async (req, res, next) => {
  let bookings = [];
  
  if (['coach', 'healthSpecialist'].includes(req.user.role)) {
    // Obtenir les services fournis par l'utilisateur
    const servicesProvider = await Service.find({ provider: req.user.id });
    const serviceIds = servicesProvider.map(service => service._id);
    
    // Obtenir les réservations pour ces services
    bookings = await Booking.find({ service: { $in: serviceIds } })
      .populate({
        path: 'service',
        select: 'title price duration'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email phoneNumber photo'
      });
  } else if (req.user.role === 'sportFieldOwner') {
    // Obtenir les réservations pour le terrain
    bookings = await Booking.find({ sportField: req.user.id })
      .populate({
        path: 'sportField',
        select: 'name sportType hourlyRate'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email phoneNumber photo'
      });
  } else if (req.user.role === 'gymOwner') {
    // Obtenir les services fournis par la salle
    const servicesGym = await Service.find({ provider: req.user.id });
    const serviceIds = servicesGym.map(service => service._id);
    
    // Obtenir les réservations pour ces services
    bookings = await Booking.find({ service: { $in: serviceIds } })
      .populate({
        path: 'service',
        select: 'title price duration'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email phoneNumber photo'
      });
  }
  
  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

// Routes CRUD standard
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);