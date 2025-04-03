// backend/routes/bookingRoutes.js
const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

// Routes Webhook Stripe (pas de protection)
router.post('/webhook-checkout', bookingController.webhookCheckout);

// Routes de succès et d'annulation après paiement
router.get('/success', bookingController.bookingSuccess);
router.get('/cancel', bookingController.bookingCancel);

// Routes protégées
router.use(authController.protect);

// Routes pour tous les utilisateurs authentifiés
router.post('/payment-session', bookingController.createPaymentSession);
router.get('/my-bookings', bookingController.getMyBookings);

// Routes pour les clients
router.patch(
  '/:id/cancel',
  authController.restrictTo('client', 'admin'),
  bookingController.cancelBooking
);

// Routes pour les fournisseurs
router.patch(
  '/:id/complete',
  authController.restrictTo('coach', 'healthSpecialist', 'gymOwner', 'sportFieldOwner', 'admin'),
  bookingController.completeBooking
);

router.get(
  '/provider-bookings',
  authController.restrictTo('coach', 'healthSpecialist', 'gymOwner', 'sportFieldOwner'),
  bookingController.getProviderBookings
);

// Routes administratives
router.use(authController.restrictTo('admin'));

router.route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router.route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;