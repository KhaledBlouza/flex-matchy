// backend/routes/reviewRoutes.js
const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Routes publiques
router.get('/', reviewController.getAllReviews);
router.get('/provider/:providerId/:providerModel', reviewController.getProviderReviews);

// Routes protégées
router.use(authController.protect);

// Routes pour les clients
router.post(
  '/',
  authController.restrictTo('client'),
  reviewController.checkBookingEligibility,
  reviewController.createReview
);

// Routes pour les auteurs des avis
router.route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('client'), reviewController.updateReview)
  .delete(authController.restrictTo('client', 'admin'), reviewController.deleteReview);

module.exports = router;