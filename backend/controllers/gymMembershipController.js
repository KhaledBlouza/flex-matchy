// backend/controllers/gymMembershipController.js

const GymMembership = require('../models/gymMembershipModel');
const SubscriptionPlan = require('../models/gymSubscriptionPlanModel');
const Client = require('../models/clientModel');
const Gym = require('../models/gymModel');
const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Créer une session de paiement d'abonnement à une salle de sport
exports.createGymMembershipPayment = catchAsync(async (req, res, next) => {
  const { gymId, planId } = req.body;
  
  if (!gymId || !planId) {
    return next(new AppError('ID de salle et ID de plan requis', 400));
  }
  
  // Vérifier si la salle et le plan existent
  const gym = await Gym.findById(gymId);
  if (!gym) {
    return next(new AppError('Salle de sport non trouvée', 404));
  }
  
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) {
    return next(new AppError('Plan d\'abonnement non trouvé', 404));
  }
  
  // Créer un abonnement temporaire
  const membership = await GymMembership.create({
    client: req.user.id,
    gym: gymId,
    plan: planId,
    startDate: Date.now(),
    endDate: new Date(Date.now() + (plan.duration * 30 * 24 * 60 * 60 * 1000)), // durée en mois
    isActive: false,
    paymentDetails: {
      amount: plan.price,
      date: Date.now(),
      method: req.body.paymentMethod || 'creditCard'
    }
  });
  
  // Si paiement en espèces, terminer ici
  if (req.body.paymentMethod === 'cash') {
    // Notifier la salle de sport
    await Notification.create({
      recipient: gymId,
      sender: req.user.id,
      type: 'other',
      title: 'Nouvelle demande d\'abonnement',
      content: `${req.user.firstName} ${req.user.lastName} souhaite s'abonner au plan "${plan.name}". Paiement en espèces à valider.`,
      relatedTo: {
        model: 'GymMembership',
        id: membership._id
      }
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        membership
      }
    });
  }
  
  // Créer une session Stripe pour le paiement en ligne
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/gym-membership/success?membership=${membership._id}`,
    cancel_url: `${req.protocol}://${req.get('host')}/gym-membership/cancel?membership=${membership._id}`,
    customer_email: req.user.email,
    client_reference_id: membership._id.toString(),
    line_items: [
      {
        price_data: {
          currency: 'tnd',
          product_data: {
            name: `Abonnement ${plan.name} - ${gym.name}`,
            description: `Abonnement ${plan.duration} mois à ${gym.name}`
          },
          unit_amount: plan.price * 100 // en centimes
        },
        quantity: 1
      }
    ]
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      session,
      membership
    }
  });
});

// Valider un abonnement (pour les paiements en espèces)
exports.validateMembership = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const membership = await GymMembership.findById(id);
  
  if (!membership) {
    return next(new AppError('Abonnement non trouvé', 404));
  }
  
  // Vérifier que l'utilisateur est bien le propriétaire de la salle
  if (membership.gym.toString() !== req.user.id) {
    return next(new AppError('Vous n\'êtes pas autorisé à valider cet abonnement', 403));
  }
  
  // Activer l'abonnement
  membership.isActive = true;
  await membership.save();
  
  // Ajouter le client à la liste des membres de la salle
  await Gym.findByIdAndUpdate(
    membership.gym,
    { $addToSet: { members: membership.client } }
  );
  
  // Notifier le client
  await Notification.create({
    recipient: membership.client,
    sender: req.user.id,
    type: 'other',
    title: 'Abonnement validé',
    content: `Votre abonnement à ${req.user.name} a été validé et est maintenant actif.`,
    relatedTo: {
      model: 'GymMembership',
      id: membership._id
    }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      membership
    }
  });
});

// Webhook pour les paiements d'abonnement aux salles
exports.webhookGymMembership = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_GYM_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  
  if (event.type === 'checkout.session.completed') {
    await handleGymMembershipSuccess(event.data.object);
  }
  
  res.status(200).json({ received: true });
});

// Gérer le succès du paiement d'abonnement
const handleGymMembershipSuccess = async session => {
  const membershipId = session.client_reference_id;
  const membership = await GymMembership.findById(membershipId);
  
  if (!membership) return;
  
  // Activer l'abonnement
  membership.isActive = true;
  membership.paymentDetails.transactionId = session.payment_intent;
  await membership.save();
  
  // Ajouter le client à la liste des membres de la salle
  await Gym.findByIdAndUpdate(
    membership.gym,
    { $addToSet: { members: membership.client } }
  );
  
  // Ajouter la salle aux favoris du client
  await Client.findByIdAndUpdate(
    membership.client,
    { $addToSet: { favoriteGyms: membership.gym } }
  );
  
  // Notifier le client et la salle
  const gym = await Gym.findById(membership.gym);
  const client = await Client.findById(membership.client);
  
  await Notification.create({
    recipient: membership.client,
    sender: membership.gym,
    type: 'other',
    title: 'Abonnement activé',
    content: `Votre abonnement à ${gym.name} a été activé.`,
    relatedTo: {
      model: 'GymMembership',
      id: membership._id
    }
  });
  
  await Notification.create({
    recipient: membership.gym,
    sender: membership.client,
    type: 'other',
    title: 'Nouveau membre',
    content: `${client.firstName} ${client.lastName} a souscrit à un abonnement.`,
    relatedTo: {
      model: 'GymMembership',
      id: membership._id
    }
  });
};