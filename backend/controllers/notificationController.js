// backend/controllers/notificationController.js
const { sendNotification } = require('../utils/socketManager');


// Obtenir les notifications de l'utilisateur connecté
exports.getMyNotifications = catchAsync(async (req, res, next) => {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'sender',
        select: 'firstName lastName photo'
      });
    
    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: {
        notifications
      }
    });
  });


  exports.createNotification = catchAsync(async (req, res, next) => {
    const { recipient, type, title, content, relatedTo } = req.body;
    
    if (!recipient || !type || !title || !content) {
      return next(new AppError('Tous les champs sont requis', 400));
    }
    
    const notification = await Notification.create({
      recipient,
      sender: req.user.id,
      type,
      title,
      content,
      relatedTo
    });
    
    // Envoyer la notification en temps réel
    sendNotification(recipient, notification);
    
    res.status(201).json({
      status: 'success',
      data: {
        notification
      }
    });
  });
  
  // Marquer une notification comme lue
  exports.markAsRead = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return next(new AppError('Notification non trouvée', 404));
    }
    
    // Vérifier que l'utilisateur est le destinataire de la notification
    if (notification.recipient.toString() !== req.user.id) {
      return next(new AppError('Vous n\'êtes pas autorisé à modifier cette notification', 403));
    }
    
    notification.read = true;
    await notification.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  });
  
  // Marquer toutes les notifications comme lues
  exports.markAllAsRead = catchAsync(async (req, res, next) => {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  });
  
  // Supprimer une notification
  exports.deleteNotification = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return next(new AppError('Notification non trouvée', 404));
    }
    
    // Vérifier que l'utilisateur est le destinataire de la notification
    if (notification.recipient.toString() !== req.user.id) {
      return next(new AppError('Vous n\'êtes pas autorisé à supprimer cette notification', 403));
    }
    
    await Notification.findByIdAndDelete(id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  });