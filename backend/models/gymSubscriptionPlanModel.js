// backend/models/gymSubscriptionPlanModel.js
const mongoose = require('mongoose');

const gymSubscriptionPlanSchema = new mongoose.Schema({
  gym: {
    type: mongoose.Schema.ObjectId,
    ref: 'Gym',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  duration: {
    type: Number, // en mois
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  features: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Relation virtuelle avec les membres abonnés
gymSubscriptionPlanSchema.virtual('subscribers', {
  ref: 'GymMembership',
  foreignField: 'plan',
  localField: '_id'
});

const GymSubscriptionPlan = mongoose.model('SubscriptionPlan', gymSubscriptionPlanSchema);
module.exports = GymSubscriptionPlan;