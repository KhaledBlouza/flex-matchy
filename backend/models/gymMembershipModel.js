// backend/models/gymMembershipModel.js
const mongoose = require('mongoose');

const gymMembershipSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true
  },
  gym: {
    type: mongoose.Schema.ObjectId,
    ref: 'Gym',
    required: true
  },
  plan: {
    type: mongoose.Schema.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentDetails: {
    amount: Number,
    date: Date,
    method: {
      type: String,
      enum: ['creditCard', 'bankTransfer', 'cash']
    },
    transactionId: String
  },
  usageStats: {
    visitsCount: {
      type: Number,
      default: 0
    },
    lastVisit: Date
  }
});

// Middleware pour vérifier l'état actif
gymMembershipSchema.pre(/^find/, function(next) {
  this.find().then(docs => {
    docs.forEach(async doc => {
      if (doc.endDate < Date.now() && doc.isActive) {
        await mongoose.model('GymMembership').findByIdAndUpdate(doc._id, { isActive: false });
      }
    });
  });
  next();
});

const GymMembership = mongoose.model('GymMembership', gymMembershipSchema);
module.exports = GymMembership;