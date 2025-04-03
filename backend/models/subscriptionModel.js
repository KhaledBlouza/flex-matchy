// backend/models/subscriptionModel.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['coach', 'healthSpecialist', 'gym', 'sportField'],
    required: true
  },
  price: {
    type: Number,
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
  autoRenewal: {
    type: Boolean,
    default: false
  },
  paymentHistory: [{
    amount: Number,
    date: Date,
    transactionId: String,
    method: {
      type: String,
      enum: ['creditCard', 'bankTransfer', 'cash']
    }
  }]
});

// Middleware pour vérifier l'état actif en fonction de la date de fin
subscriptionSchema.pre(/^find/, function(next) {
  this.find().then(docs => {
    docs.forEach(async doc => {
      if (doc.endDate < Date.now() && doc.isActive) {
        await mongoose.model('Subscription').findByIdAndUpdate(doc._id, { isActive: false });
      }
    });
  });
  next();
});

// Méthode d'instance pour renouveler l'abonnement
subscriptionSchema.methods.renew = function(months) {
  const currentEndDate = this.endDate > Date.now() ? this.endDate : Date.now();
  this.endDate = new Date(currentEndDate);
  this.endDate.setMonth(this.endDate.getMonth() + months);
  this.isActive = true;
  return this.save();
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;