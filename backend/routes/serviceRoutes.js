// backend/routes/serviceRoutes.js
const express = require('express');
const serviceController = require('../controllers/serviceController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Rediriger les routes imbriquées
router.use('/:serviceId/reviews', reviewRouter);

// Routes publiques
router.get('/', serviceController.getAllServices);
router.get('/search', serviceController.searchServices);
router.get('/provider/:providerId', serviceController.getServicesByProvider);
router.get('/check-availability', serviceController.checkAvailability);
router.get('/:id', serviceController.getService);

// Routes protégées
router.use(authController.protect);

router.post(
  '/',
  authController.restrictTo('coach', 'healthSpecialist', 'gymOwner'),
  serviceController.uploadServiceImages,
  serviceController.resizeServiceImages,
  serviceController.createService
);

router.patch(
  '/:id',
  serviceController.checkServiceOwner,
  serviceController.uploadServiceImages,
  serviceController.resizeServiceImages,
  serviceController.updateService
);

router.delete(
  '/:id',
  serviceController.checkServiceOwner,
  serviceController.deleteService
);

module.exports = router;