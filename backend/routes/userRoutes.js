// backend/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Routes publiques
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Routes protégées (nécessitent une authentification)
router.use(authController.protect);

// Routes pour l'utilisateur connecté
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);
router.get('/myBookings', require('../controllers/bookingController').getMyBookings);
router.get('/myNotifications', require('../controllers/notificationController').getMyNotifications);
router.get('/myConversations', require('../controllers/conversationController').getMyConversations);
router.get('/mySubscription', require('../controllers/subscriptionController').getMySubscription);

// Routes pour les favoris (clients uniquement)
router.post('/favorites', authController.restrictTo('client'), userController.addToFavorites);
router.delete('/favorites/:entityType/:entityId', authController.restrictTo('client'), userController.removeFromFavorites);

// Routes pour les réservations en tant que fournisseur
router.get(
  '/provider-bookings',
  authController.restrictTo('coach', 'healthSpecialist', 'gymOwner', 'sportFieldOwner'),
  require('../controllers/bookingController').getProviderBookings
);

// Recherche d'utilisateurs par rôle
router.get('/role/:role', userController.getUsersByRole);

// Routes pour rechercher des utilisateurs pour le chat
router.get('/search-for-chat', userController.searchUsersForChat);

// Routes administratives (nécessitent le rôle admin)
router.use(authController.restrictTo('admin'));

router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;