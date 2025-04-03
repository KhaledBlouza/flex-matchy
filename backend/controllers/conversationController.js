// backend/controllers/conversationController.js
const Conversation = require('../models/conversationModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// Créer une nouvelle conversation
exports.createConversation = catchAsync(async (req, res, next) => {
  const { recipientId, message } = req.body;
  
  if (!recipientId || !message) {
    return next(new AppError('Destinataire et message requis', 400));
  }
  
  // Vérifier si le destinataire existe
  const recipient = await User.findById(recipientId);
  
  if (!recipient) {
    return next(new AppError('Destinataire non trouvé', 404));
  }
  
  // Vérifier si une conversation existe déjà entre ces deux utilisateurs
  const existingConversation = await Conversation.findOne({
    participants: { $all: [req.user.id, recipientId] }
  });
  
  let conversation;
  
  if (existingConversation) {
    // Ajouter le message à la conversation existante
    conversation = await Conversation.findByIdAndUpdate(
      existingConversation._id,
      {
        $push: {
          messages: {
            sender: req.user.id,
            text: message,
            createdAt: Date.now()
          }
        },
        lastMessage: Date.now()
      },
      { new: true }
    );
  } else {
    // Créer une nouvelle conversation
    conversation = await Conversation.create({
      participants: [req.user.id, recipientId],
      messages: [{
        sender: req.user.id,
        text: message,
        createdAt: Date.now()
      }],
      lastMessage: Date.now()
    });
    
    // Ajouter la conversation aux conversations des utilisateurs
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { conversations: conversation._id } }
    );
    
    await User.findByIdAndUpdate(
      recipientId,
      { $push: { conversations: conversation._id } }
    );
  }
  
  // Notifier le destinataire
  await Notification.create({
    recipient: recipientId,
    sender: req.user.id,
    type: 'newMessage',
    title: 'Nouveau message',
    content: `${req.user.firstName} ${req.user.lastName} vous a envoyé un message`,
    relatedTo: {
      model: 'Conversation',
      id: conversation._id
    }
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      conversation
    }
  });
});

// Ajouter un message à une conversation
exports.addMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { message } = req.body;
  
  if (!message) {
    return next(new AppError('Message requis', 400));
  }
  
  // Vérifier si la conversation existe
  const conversation = await Conversation.findById(id);
  
  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }
  
  // Vérifier que l'utilisateur est un participant de la conversation
  if (!conversation.participants.includes(req.user.id)) {
    return next(new AppError('Vous n\'êtes pas autorisé à accéder à cette conversation', 403));
  }
  
  // Ajouter le message à la conversation
  const updatedConversation = await Conversation.findByIdAndUpdate(
    id,
    {
      $push: {
        messages: {
          sender: req.user.id,
          text: message,
          createdAt: Date.now()
        }
      },
      lastMessage: Date.now()
    },
    { new: true }
  );
  
  // Notifier l'autre participant
  const otherParticipant = conversation.participants.find(
    participant => participant.toString() !== req.user.id
  );
  
  await Notification.create({
    recipient: otherParticipant,
    sender: req.user.id,
    type: 'newMessage',
    title: 'Nouveau message',
    content: `${req.user.firstName} ${req.user.lastName} vous a envoyé un message`,
    relatedTo: {
      model: 'Conversation',
      id: conversation._id
    }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      conversation: updatedConversation
    }
  });
});

// Marquer les messages comme lus
exports.markMessagesAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Vérifier si la conversation existe
  const conversation = await Conversation.findById(id);
  
  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }
  
  // Vérifier que l'utilisateur est un participant de la conversation
  if (!conversation.participants.includes(req.user.id)) {
    return next(new AppError('Vous n\'êtes pas autorisé à accéder à cette conversation', 403));
  }
  
  // Marquer tous les messages non lus comme lus
  const updatedConversation = await Conversation.findByIdAndUpdate(
    id,
    {
      $set: {
        'messages.$[elem].read': true
      }
    },
    {
      arrayFilters: [{ 'elem.sender': { $ne: req.user.id }, 'elem.read': false }],
      new: true
    }
  );
  
  res.status(200).json({
    status: 'success',
    data: {
      conversation: updatedConversation
    }
  });
});

// Obtenir les conversations de l'utilisateur connecté
exports.getMyConversations = catchAsync(async (req, res, next) => {
  const conversations = await Conversation.find({
    participants: req.user.id
  })
    .sort({ lastMessage: -1 })
    .populate({
      path: 'participants',
      select: 'firstName lastName photo'
    });
  
  // Pour chaque conversation, compter le nombre de messages non lus
  const conversationsWithUnreadCount = conversations.map(conversation => {
    const unreadCount = conversation.messages.filter(
      message => message.sender.toString() !== req.user.id && !message.read
    ).length;
    
    return {
      ...conversation._doc,
      unreadCount
    };
  });
  
  res.status(200).json({
    status: 'success',
    results: conversations.length,
    data: {
      conversations: conversationsWithUnreadCount
    }
  });
});

// Obtenir une conversation spécifique
exports.getConversation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const conversation = await Conversation.findById(id).populate({
    path: 'participants',
    select: 'firstName lastName photo'
  });
  
  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }
  
  // Vérifier que l'utilisateur est un participant de la conversation
  if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
    return next(new AppError('Vous n\'êtes pas autorisé à accéder à cette conversation', 403));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      conversation
    }
  });
});

// Supprimer une conversation
exports.deleteConversation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const conversation = await Conversation.findById(id);
  
  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }
  
  // Vérifier que l'utilisateur est un participant de la conversation
  if (!conversation.participants.includes(req.user.id)) {
    return next(new AppError('Vous n\'êtes pas autorisé à supprimer cette conversation', 403));
  }
  
  // Supprimer la conversation de la liste des conversations des participants
  for (const participant of conversation.participants) {
    await User.findByIdAndUpdate(
      participant,
      { $pull: { conversations: conversation._id } }
    );
  }
  
  await Conversation.findByIdAndDelete(id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Rechercher des utilisateurs pour démarrer une conversation
exports.searchUsersForChat = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  
  if (!query) {
    return next(new AppError('Terme de recherche requis', 400));
  }
  
  // Rechercher des utilisateurs par nom, prénom ou email
  const searchRegex = new RegExp(query, 'i');
  
  const users = await User.find({
    $and: [
      { _id: { $ne: req.user.id } }, // Exclure l'utilisateur connecté
      {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { name: searchRegex } // Pour les salles et terrains
        ]
      }
    ]
  }).select('firstName lastName name photo role');
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});