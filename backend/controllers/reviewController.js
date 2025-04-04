// backend/controllers/reviewController.js

const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const Service = require('../models/serviceModel');
const SportField = require('../models/sportFieldModel');
const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');



// Vérifier si la réservation est éligible pour un avis
exports.checkBookingEligibility = catchAsync(async (req, res, next) => {
  const { bookingId } = req.body;
  
  if (!bookingId) {
    return next(new AppError('ID de réservation requis', 400));
  }
  
  // Vérifier si la réservation existe et appartient à l'utilisateur
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    return next(new AppError('Réservation non trouvée', 404));
  }
  
  if (booking.user.toString() !== req.user.id) {
    return next(new AppError('Cette réservation ne vous appartient pas', 403));
  }
  
  // Vérifier si la réservation est complétée
  if (booking.status !== 'completed') {
    return next(new AppError('Vous ne pouvez donner un avis que pour une réservation terminée', 400));
  }
  
  // Vérifier si un avis a déjà été donné pour cette réservation
  const existingReview = await Review.findOne({ booking: bookingId });
  
  if (existingReview) {
    return next(new AppError('Vous avez déjà donné un avis pour cette réservation', 400));
  }
  
  // Ajouter des informations à la demande
  req.booking = booking;
  
  next();
});

// Créer un avis
exports.createReview = catchAsync(async (req, res, next) => {
  const { rating, comment, bookingId } = req.body;
  
  if (!rating || !comment || !bookingId) {
    return next(new AppError('Tous les champs sont requis', 400));
  }
  
  // Cette information vient du middleware checkBookingEligibility
  const booking = req.booking;
  
  // Déterminer le fournisseur et le modèle de fournisseur
  let provider, providerModel, serviceOrField;
  
  if (booking.service) {
    serviceOrField = await Service.findById(booking.service);
    provider = serviceOrField.provider;
    providerModel = serviceOrField.providerModel;
  } else if (booking.sportField) {
    serviceOrField = await SportField.findById(booking.sportField);
    provider = serviceOrField._id;
    providerModel = 'SportField';
  }
  
  // Créer l'avis
  const newReview = await Review.create({
    user: req.user.id,
    booking: bookingId,
    service: booking.service,
    sportField: booking.sportField,
    provider,
    providerModel,
    rating,
    comment
  });
  
  // Notifier le fournisseur
  await Notification.create({
    recipient: provider,
    sender: req.user.id,
    type: 'newReview',
    title: 'Nouvel avis',
    content: `${req.user.firstName} ${req.user.lastName} a laissé un avis de ${rating} étoiles.`,
    relatedTo: {
      model: 'Review',
      id: newReview._id
    }
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});

// Obtenir les avis pour un fournisseur
exports.getProviderReviews = catchAsync(async (req, res, next) => {
  const { providerId, providerModel } = req.params;
  
  if (!providerId || !providerModel) {
    return next(new AppError('ID du fournisseur et modèle du fournisseur requis', 400));
  }
  
  // Vérifier si le modèle de fournisseur est valide
  if (!['Coach', 'HealthSpecialist', 'Gym', 'SportField'].includes(providerModel)) {
    return next(new AppError('Modèle de fournisseur non valide', 400));
  }
  
  const reviews = await Review.find({
    provider: providerId,
    providerModel
  }).sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Routes CRUD standard pour les avis
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);