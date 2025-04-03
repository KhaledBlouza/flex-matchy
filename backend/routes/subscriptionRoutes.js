// backend/routes/subscriptionRoutes.js
const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const authController = require('../controllers/authController');

const router = express.Router();

// Routes Webhook Stripe (pas de protection)
router.post('/webhook-subscription', subscriptionController.webhookSubscription);

// Routes publiques
router.get('/plans', subscriptionController.getSubscriptionPlans);

// Routes de succès et d'annulation après paiement
router.get('/success', subscriptionController.subscriptionSuccess);
router.get('/cancel', subscriptionController.cancelSubscription);
router.get('/renew-success', subscriptionController.confirmRenewal);

// Routes protégées
router.use(authController.protect);

// Routes pour tous les utilisateurs authentifiés
router.post(
  '/payment-session',
  authController.restrictTo('coach', 'healthSpecialist', 'gymOwner', 'sportFieldOwner'),
  subscriptionController.createSubscriptionSession
);

router.post(
  '/renew',
  authController.restrictTo('coach', 'healthSpecialist', 'gymOwner', 'sportFieldOwner'),
  subscriptionController.renewSubscription
);

router.get('/my-subscription', subscriptionController.getMySubscription);
router.get('/check-status', subscriptionController.checkSubscriptionStatus);

// Routes administratives
router.use(authController.restrictTo('admin'));

router.route('/')
  .get(subscriptionController.getAllSubscriptions)
  .post(subscriptionController.createSubscription);

router.route('/:id')
  .get(subscriptionController.getSubscription)
  .patch(subscriptionController.updateSubscription)
  .delete(subscriptionController.deleteSubscription);

module.exports = router;