// backend/routes/conversationRoutes.js
const express = require('express');
const conversationController = require('../controllers/conversationController');
const authController = require('../controllers/authController');

const router = express.Router();

// Toutes les routes sont protégées
router.use(authController.protect);

// Routes pour les conversations
router.post('/', conversationController.createConversation);
router.get('/', conversationController.getMyConversations);
router.get('/:id', conversationController.getConversation);
router.post('/:id/message', conversationController.addMessage);
router.patch('/:id/read', conversationController.markMessagesAsRead);
router.delete('/:id', conversationController.deleteConversation);

// Recherche d'utilisateurs pour démarrer une conversation
router.get('/search-users', conversationController.searchUsersForChat);

module.exports = router;