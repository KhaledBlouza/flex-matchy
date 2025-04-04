// backend/controllers/gymSubscriptionController.js

const GymSubscriptionPlan = require('../models/gymSubscriptionPlanModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

// CRUD standard pour les plans d'abonnement (salles de sport)
exports.getAllGymSubscriptions = factory.getAll(GymSubscriptionPlan);
exports.getGymSubscription = factory.getOne(GymSubscriptionPlan);
exports.createGymSubscription = factory.createOne(GymSubscriptionPlan);
exports.updateGymSubscription = factory.updateOne(GymSubscriptionPlan);
exports.deleteGymSubscription = factory.deleteOne(GymSubscriptionPlan);

// Obtenir tous les plans actifs d’une salle de sport
exports.getGymSubscriptionPlans = catchAsync(async (req, res, next) => {
  const plans = await GymSubscriptionPlan.find({
    gym: req.params.gymId,
    isActive: true
  });

  res.status(200).json({
    status: 'success',
    results: plans.length,
    data: { plans }
  });
});

// Créer un nouveau plan pour une salle de sport
exports.createGymSubscriptionPlan = catchAsync(async (req, res, next) => {
  const newPlan = await GymSubscriptionPlan.create({
    ...req.body,
    gym: req.params.gymId || req.body.gym
  });

  res.status(201).json({
    status: 'success',
    data: { plan: newPlan }
  });
});

// Simuler l’abonnement à un plan par un client
exports.subscribeToGym = catchAsync(async (req, res, next) => {
  const planId = req.body.plan; // ID du plan d’abonnement
  const userId = req.user.id;

  // Utilisation du modèle GymMembership (assure-toi que le fichier existe)
  const GymMembership = require('../models/gymMembershipModel');

  const newMembership = await GymMembership.create({
    client: userId, // dans le modèle, le champ est "client"
    plan: planId,
    subscribedAt: Date.now(),
    // Pour l'exemple, fixer la date de fin à 30 jours après la souscription
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  res.status(201).json({
    status: 'success',
    data: { membership: newMembership }
  });
});

// DUMMY : Obtenir les abonnements (gym memberships) du client
exports.getMyGymMemberships = catchAsync(async (req, res, next) => {
  // Ici, implémentez la logique réelle selon votre modèle GymMembership.
  res.status(200).json({
    status: 'success',
    data: { memberships: [] }
  });
});

// DUMMY : Annuler un abonnement (gym membership) pour le client
exports.cancelGymMembership = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Gym membership cancelled (dummy response)'
  });
});

// DUMMY : Obtenir les membres d'une salle de sport pour le propriétaire
exports.getGymMembers = catchAsync(async (req, res, next) => {
  // Implémentez la logique réelle en recherchant dans le modèle GymMembership
  res.status(200).json({
    status: 'success',
    data: { members: [] }
  });
});

// DUMMY : Valider une visite pour un membre (par le propriétaire)
exports.validateVisit = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Visit validated (dummy response)'
  });
});

// DUMMY : Obtenir tous les abonnements (gym memberships) pour l'administrateur
exports.getAllGymMemberships = catchAsync(async (req, res, next) => {
  // Implémentez la logique réelle pour lister tous les GymMemberships
  res.status(200).json({
    status: 'success',
    data: { memberships: [] }
  });
});
