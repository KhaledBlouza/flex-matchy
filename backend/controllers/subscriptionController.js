// backend/controllers/subscriptionController.js
const stripe = require('../utils/stripe');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');
const Coach = require('../models/coachModel');
const HealthSpecialist = require('../models/healthSpecialistModel');
const Gym = require('../models/gymModel');
const SportField = require('../models/sportFieldModel');
const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// Obtenir les plans d'abonnement disponibles
exports.getSubscriptionPlans = (req, res) => {
  // Plans d'abonnement fixes
  const plans = [
    {
      id: 'coach',
      name: 'Abonnement Coach',
      description: 'Idéal pour les coachs sportifs indépendants',
      price: 50, // TND
      duration: 1, // mois
      features: [
        'Profil personnalisé',
        'Gestion des réservations',
        'Publication de posts et d\'événements',
        'Messagerie instantanée',
        'Statistiques d\'utilisation',
        'Support client prioritaire'
      ]
    },
    {
      id: 'healthSpecialist',
      name: 'Abonnement Spécialiste de santé',
      description: 'Pour les professionnels de la santé et du bien-être',
      price: 50, // TND
      duration: 1, // mois
      features: [
        'Profil professionnel',
        'Gestion des rendez-vous',
        'Publication d\'articles spécialisés',
        'Messagerie avec les clients',
        'Statistiques d\'activité',
        'Support client prioritaire'
      ]
    },
    {
      id: 'gym',
      name: 'Abonnement Salle de sport',
      description: 'Solution complète pour les salles de sport',
      price: 100, // TND
      duration: 1, // mois
      features: [
        'Profil d\'établissement',
        'Gestion des abonnements',
        'Publication d\'offres et d\'événements',
        'Recrutement de coachs',
        'Statistiques avancées',
        'Support client dédié'
      ]
    },
    {
      id: 'sportField',
      name: 'Abonnement Terrain de sport',
      description: 'Pour la gestion de terrains et installations sportives',
      price: 80, // TND
      duration: 1, // mois
      features: [
        'Système de réservation',
        'Gestion des créneaux',
        'Statistiques d\'occupation',
        'Visibilité optimisée',
        'Messagerie avec les clients',
        'Support client dédié'
      ]
    }
  ];
  
  res.status(200).json({
    status: 'success',
    data: {
      plans
    }
  });
};

// Créer une session de paiement d'abonnement
exports.createSubscriptionSession = catchAsync(async (req, res, next) => {
  const { plan } = req.body;
  
  if (!plan) {
    return next(new AppError('Plan d\'abonnement requis', 400));
  }
  
  // Vérifier si le plan est valide
  const validPlans = ['coach', 'healthSpecialist', 'gym', 'sportField'];
  if (!validPlans.includes(plan)) {
    return next(new AppError('Plan d\'abonnement non valide', 400));
  }
  
  // Vérifier si l'utilisateur a le rôle correspondant
  const userRole = req.user.role;
  const roleMap = {
    coach: 'coach',
    healthSpecialist: 'healthSpecialist',
    gymOwner: 'gym',
    sportFieldOwner: 'sportField'
  };
  
  if (roleMap[userRole] !== plan) {
    return next(new AppError(`Ce plan est réservé aux ${plan}s`, 403));
  }
  
  // Obtenir le prix du plan
  let price;
  switch (plan) {
    case 'coach':
    case 'healthSpecialist':
      price = 50;
      break;
    case 'gym':
      price = 100;
      break;
    case 'sportField':
      price = 80;
      break;
  }
  
  // Créer un abonnement temporaire
  const subscription = await Subscription.create({
    user: req.user.id,
    plan,
    price,
    startDate: Date.now(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
    isActive: false,
    autoRenewal: req.body.autoRenewal || false
  });
  
  // Créer une session de paiement Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/subscriptions/success?subscription=${subscription._id}`,
    cancel_url: `${req.protocol}://${req.get('host')}/subscriptions/cancel?subscription=${subscription._id}`,
    customer_email: req.user.email,
    client_reference_id: subscription._id.toString(),
    line_items: [
      {
        price_data: {
          currency: 'tnd',
          product_data: {
            name: `Abonnement ${plan}`,
            description: `Abonnement mensuel à FlexMatch pour ${plan}`
          },
          unit_amount: price * 100 // Stripe utilise les centimes
        },
        quantity: 1
      }
    ],
    metadata: {
      plan,
      subscriptionId: subscription._id.toString()
    }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      session,
      subscription
    }
  });
});

// Webhook Stripe pour les abonnements
exports.webhookSubscription = catchAsync(async (req, res, next) => {
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
    await handleSubscriptionSuccess(event.data.object);
  }
  
  res.status(200).json({ received: true });
});

// Gérer le succès du paiement d'abonnement
const handleSubscriptionSuccess = async session => {
  const subscriptionId = session.client_reference_id;
  const subscription = await Subscription.findById(subscriptionId);
  
  if (!subscription) return;
  
  // Mettre à jour le statut de l'abonnement
  subscription.isActive = true;
  subscription.paymentHistory.push({
    amount: subscription.price,
    date: Date.now(),
    transactionId: session.payment_intent,
    method: 'creditCard'
  });
  await subscription.save();
  
  // Mettre à jour le statut d'abonnement de l'utilisateur
  const user = await User.findById(subscription.user);
  
  // Associer l'abonnement à l'utilisateur
  await User.findByIdAndUpdate(
    subscription.user,
    { subscription: subscription._id }
  );
  
  // Mettre à jour le statut d'abonnement dans le modèle spécifique
  switch (user.role) {
    case 'coach':
      await Coach.findByIdAndUpdate(user.id, {
        'subscriptionStatus.isActive': true,
        'subscriptionStatus.expiresAt': subscription.endDate
      });
      break;
    case 'healthSpecialist':
      await HealthSpecialist.findByIdAndUpdate(user.id, {
        'subscriptionStatus.isActive': true,
        'subscriptionStatus.expiresAt': subscription.endDate
      });
      break;
    case 'gymOwner':
      await Gym.findByIdAndUpdate(user.id, {
        'subscriptionStatus.isActive': true,
        'subscriptionStatus.expiresAt': subscription.endDate
      });
      break;
    case 'sportFieldOwner':
      await SportField.findByIdAndUpdate(user.id, {
        'subscriptionStatus.isActive': true,
        'subscriptionStatus.expiresAt': subscription.endDate
      });
      break;
  }
  
  // Envoyer une notification à l'utilisateur
  await Notification.create({
    recipient: user._id,
    type: 'other',
    title: 'Abonnement activé',
    content: `Votre abonnement ${subscription.plan} a été activé jusqu'au ${new Date(subscription.endDate).toLocaleDateString()}.`,
    relatedTo: {
      model: 'Subscription',
      id: subscription._id
    }
  });
};

// Route pour valider le succès de l'abonnement
exports.subscriptionSuccess = catchAsync(async (req, res, next) => {
  const { subscription: subscriptionId } = req.query;
  
  if (!subscriptionId) {
    return next(new AppError('ID d\'abonnement non fourni', 400));
  }
  
  const subscription = await Subscription.findById(subscriptionId);
  
  if (!subscription) {
    return next(new AppError('Abonnement non trouvé', 404));
  }
  
  if (!subscription.isActive) {
    subscription.isActive = true;
    await subscription.save();
    
    // Mettre à jour le statut d'abonnement de l'utilisateur comme ci-dessus
    // (dupliquer le code pour gérer les cas où le webhook n'est pas déclenché)
    const user = await User.findById(subscription.user);
    
    // Associer l'abonnement à l'utilisateur
    await User.findByIdAndUpdate(
      subscription.user,
      { subscription: subscription._id }
    );
    
    // Mettre à jour le statut d'abonnement dans le modèle spécifique
    switch (user.role) {
      case 'coach':
        await Coach.findByIdAndUpdate(user.id, {
          'subscriptionStatus.isActive': true,
          'subscriptionStatus.expiresAt': subscription.endDate
        });
        break;
      case 'healthSpecialist':
        await HealthSpecialist.findByIdAndUpdate(user.id, {
          'subscriptionStatus.isActive': true,
          'subscriptionStatus.expiresAt': subscription.endDate
        });
        break;
      case 'gymOwner':
        await Gym.findByIdAndUpdate(user.id, {
          'subscriptionStatus.isActive': true,
          'subscriptionStatus.expiresAt': subscription.endDate
        });
        break;
      case 'sportFieldOwner':
        await SportField.findByIdAndUpdate(user.id, {
          'subscriptionStatus.isActive': true,
          'subscriptionStatus.expiresAt': subscription.endDate
        });
        break;
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

// Annuler un abonnement
exports.cancelSubscription = catchAsync(async (req, res, next) => {
  const { subscription: subscriptionId } = req.query;
  
  if (!subscriptionId) {
    return next(new AppError('ID d\'abonnement non fourni', 400));
  }
  
  const subscription = await Subscription.findById(subscriptionId);
  
  if (!subscription) {
    return next(new AppError('Abonnement non trouvé', 404));
  }
  
  await Subscription.findByIdAndDelete(subscriptionId);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Renouveler un abonnement
exports.renewSubscription = catchAsync(async (req, res, next) => {
  const { months } = req.body;
  
  if (!months || months < 1) {
    return next(new AppError('Nombre de mois invalide', 400));
  }
  
  // Trouver l'abonnement actuel de l'utilisateur
  const subscription = await Subscription.findOne({ user: req.user.id });
  
  if (!subscription) {
    return next(new AppError('Aucun abonnement trouvé', 404));
  }
  
  // Calculer le montant à payer
  const amount = subscription.price * months;
  
  // Créer une session de paiement Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/subscriptions/renew-success?subscription=${subscription._id}&months=${months}`,
    cancel_url: `${req.protocol}://${req.get('host')}/subscriptions/profile`,
    customer_email: req.user.email,
    client_reference_id: subscription._id.toString(),
    line_items: [
      {
        price_data: {
          currency: 'tnd',
          product_data: {
            name: `Renouvellement ${subscription.plan}`,
            description: `Renouvellement d'abonnement FlexMatch pour ${months} mois`
          },
          unit_amount: amount * 100 // Stripe utilise les centimes
        },
        quantity: 1
      }
    ],
    metadata: {
      plan: subscription.plan,
      subscriptionId: subscription._id.toString(),
      months
    }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      session
    }
  });
});

// Confirmer le renouvellement d'abonnement
exports.confirmRenewal = catchAsync(async (req, res, next) => {
  const { subscription: subscriptionId, months } = req.query;
  
  if (!subscriptionId || !months) {
    return next(new AppError('Paramètres manquants', 400));
  }
  
  const subscription = await Subscription.findById(subscriptionId);
  
  if (!subscription) {
    return next(new AppError('Abonnement non trouvé', 404));
  }
  
  // Renouveler l'abonnement
  await subscription.renew(parseInt(months));
  
  // Mettre à jour le statut d'abonnement dans le modèle spécifique
  const user = await User.findById(subscription.user);
  
  switch (user.role) {
    case 'coach':
      await Coach.findByIdAndUpdate(user.id, {
        'subscriptionStatus.isActive': true,
        'subscriptionStatus.expiresAt': subscription.endDate
      });
      break;
    case 'healthSpecialist':
      await HealthSpecialist.findByIdAndUpdate(user.id, {
        'subscriptionStatus.isActive': true,
        'subscriptionStatus.expiresAt': subscription.endDate
      });
      break;
    case 'gymOwner':
      await Gym.findByIdAndUpdate(user.id, {
        'subscriptionStatus.isActive': true,
        'subscriptionStatus.expiresAt': subscription.endDate
      });
      break;
    case 'sportFieldOwner':
      await SportField.findByIdAndUpdate(user.id, {
        'subscriptionStatus.isActive': true,
        'subscriptionStatus.expiresAt': subscription.endDate
      });
      break;
  }
  
  // Envoyer une notification à l'utilisateur
  await Notification.create({
    recipient: user._id,
    type: 'other',
    title: 'Abonnement renouvelé',
    content: `Votre abonnement ${subscription.plan} a été renouvelé jusqu'au ${new Date(subscription.endDate).toLocaleDateString()}.`,
    relatedTo: {
      model: 'Subscription',
      id: subscription._id
    }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

// Obtenir l'abonnement de l'utilisateur connecté
exports.getMySubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOne({ user: req.user.id });
  
  if (!subscription) {
    return next(new AppError('Aucun abonnement trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

// Vérifier le statut d'abonnement de l'utilisateur
exports.checkSubscriptionStatus = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOne({ user: req.user.id });
  
  if (!subscription) {
    return res.status(200).json({
      status: 'success',
      data: {
        isActive: false,
        subscription: null
      }
    });
  }
  
  const isActive = subscription.isActive && subscription.endDate > Date.now();
  
  res.status(200).json({
    status: 'success',
    data: {
      isActive,
      subscription
    }
  });
});

// Routes CRUD standard
exports.getAllSubscriptions = factory.getAll(Subscription);
exports.getSubscription = factory.getOne(Subscription);
exports.updateSubscription = factory.updateOne(Subscription);
exports.deleteSubscription = factory.deleteOne(Subscription);
exports.createSubscription = factory.createOne(Subscription);
