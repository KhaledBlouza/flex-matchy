// backend/utils/socketManager.js

const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Stockage des utilisateurs connectés: { userId: socketId }
let onlineUsers = {};

const initializeSocketServer = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      // Récupérer le token du client
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentification requise'));
      }
      
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Récupérer l'utilisateur
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Utilisateur non trouvé'));
      }
      
      // Ajouter l'utilisateur à l'objet socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentification invalide'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Nouvel utilisateur connecté:', socket.user._id);
    
    // Enregistrer l'utilisateur connecté
    onlineUsers[socket.user._id] = socket.id;
    
    // Envoyer la liste des utilisateurs en ligne
    io.emit('userList', Object.keys(onlineUsers));
    
    // Écouter les déconnexions
    socket.on('disconnect', () => {
      console.log('Utilisateur déconnecté:', socket.user._id);
      delete onlineUsers[socket.user._id];
      io.emit('userList', Object.keys(onlineUsers));
    });
    
    // Écouter les nouveaux messages
    socket.on('sendMessage', async (data) => {
      try {
        const { recipientId, text } = data;
        
        // Vérifier si le destinataire est en ligne
        if (onlineUsers[recipientId]) {
          // Envoyer le message au destinataire
          io.to(onlineUsers[recipientId]).emit('newMessage', {
            sender: {
              _id: socket.user._id,
              firstName: socket.user.firstName,
              lastName: socket.user.lastName,
              photo: socket.user.photo
            },
            text,
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
      }
    });
  });

  return io;
};

// Fonction pour envoyer une notification
const sendNotification = (userId, notification) => {
  if (onlineUsers[userId]) {
    io.to(onlineUsers[userId]).emit('notification', notification);
  }
};

module.exports = { initializeSocketServer, sendNotification };