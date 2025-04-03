// backend/models/gymModel.js
const mongoose = require('mongoose');
const User = require('./userModel');

const gymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Une salle de sport doit avoir un nom']
  },
  description: {
    type: String,
    required: [true, 'Une description est requise']
  },
  facilities: [String],
  photos: [String],
  openingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: String,
    close: String
  }],
  subscriptionPlans: [{
    type: mongoose.Schema.ObjectId,
    ref: 'SubscriptionPlan'
  }],
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String
  },
  coachVacancies: [{
    type: mongoose.Schema.ObjectId,
    ref: 'CoachVacancy'
  }],
  members: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Client'
  }],
  coaches: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Coach'
  }],
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  posts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Post'
  }],
  subscriptionStatus: {
    isActive: {
      type: Boolean,
      default: false
    },
    expiresAt: Date
  }
});

// Indexer la localisation pour les recherches géospatiales
gymSchema.index({ location: '2dsphere' });

const Gym = User.discriminator('Gym', gymSchema);
module.exports = Gym;