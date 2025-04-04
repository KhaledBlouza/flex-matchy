// backend/routes/gymSubscriptionRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const gymSubscriptionController = require('../controllers/gymSubscriptionController');

// Routes publiques
router.get('/gym/:gymId/plans', gymSubscriptionController.getGymSubscriptionPlans);

// Routes protégées
router.use(authController.protect);

// Routes pour les clients
router.post(
  '/subscribe',
  authController.restrictTo('client'),
  gymSubscriptionController.subscribeToGym
);

router.get(
  '/my-memberships',
  authController.restrictTo('client'),
  gymSubscriptionController.getMyGymMemberships
);

router.patch(
  '/cancel/:membershipId',
  authController.restrictTo('client'),
  gymSubscriptionController.cancelGymMembership
);

// Routes pour les salles de sport
router.post(
  '/plans',
  authController.restrictTo('gymOwner'),
  gymSubscriptionController.createGymSubscriptionPlan

);

router.patch(
  '/plans/:planId',
  authController.restrictTo('gymOwner'),
  gymSubscriptionController.updateSubscriptionPlan
);

router.delete(
  '/plans/:planId',
  authController.restrictTo('gymOwner'),
  gymSubscriptionController.deleteSubscriptionPlan
);

router.get(
  '/members',
  authController.restrictTo('gymOwner'),
  gymSubscriptionController.getGymMembers
);

router.patch(
  '/members/:membershipId/validate',
  authController.restrictTo('gymOwner'),
  gymSubscriptionController.validateVisit
);

// Routes administratives
router.use(authController.restrictTo('admin'));

router.route('/all-memberships')
  .get(gymSubscriptionController.getAllGymMemberships);

module.exports = router;