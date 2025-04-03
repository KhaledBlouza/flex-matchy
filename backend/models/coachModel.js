// backend/models/coachModel.js
const mongoose = require('mongoose');
const User = require('./userModel');

const coachSchema = new mongoose.Schema({
  specialties: {
    type: [String],
    required: [true, 'Un coach doit avoir au moins une spécialité']
  },
  experience: {
    type: Number,
    default: 0
  },
  certifications: [{
    name: String,
    issuedBy: String,
    year: Number,
    document: String // URL de l'image ou du PDF
  }],
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
    coordinates: [Number], // [longitude, latitude]
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
coachSchema.index({ location: '2dsphere' });

const Coach = User.discriminator('Coach', coachSchema);
module.exports = Coach;