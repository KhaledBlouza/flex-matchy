// backend/models/notificationModel.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['bookingConfirmed', 'bookingCancelled', 'newMessage', 'paymentReceived', 'newReview', 'reminderSession', 'subscriptionExpiring', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Booking', 'Conversation', 'Review', 'Subscription', 'Post']
    },
    id: mongoose.Schema.ObjectId
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexer pour trier par date et statut de lecture
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;