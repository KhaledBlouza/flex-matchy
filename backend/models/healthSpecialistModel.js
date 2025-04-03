// backend/models/healthSpecialistModel.js
const mongoose = require('mongoose');
const User = require('./userModel');

const healthSpecialistSchema = new mongoose.Schema({
  specialty: {
    type: String,
    required: [true, 'Un spécialiste doit avoir une spécialité']
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    document: String
  }],
  licenseNumber: {
    type: String,
    required: [true, 'Un numéro de licence est requis']
  },
  services: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Service'
  }],
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String
  }],
  clients: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Client'
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
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String
  },
  subscriptionStatus: {
    isActive: {
      type: Boolean,
      default: false
    },
    expiresAt: Date
  }
});

// Indexer la localisation pour les recherches géospatiales
healthSpecialistSchema.index({ location: '2dsphere' });

const HealthSpecialist = User.discriminator('HealthSpecialist', healthSpecialistSchema);
module.exports = HealthSpecialist;