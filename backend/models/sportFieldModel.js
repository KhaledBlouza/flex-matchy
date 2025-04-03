// backend/models/sportFieldModel.js
const mongoose = require('mongoose');
const User = require('./userModel');

const sportFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Un terrain de sport doit avoir un nom']
  },
  description: {
    type: String,
    required: [true, 'Une description est requise']
  },
  sportType: {
    type: String,
    required: [true, 'Le type de sport est requis'],
    enum: ['football', 'tennis', 'basketball', 'padel', 'volleyball', 'swimming', 'other']
  },
  photos: [String],
  capacity: {
    type: Number,
    required: [true, 'La capacité du terrain est requise']
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Le tarif horaire est requis']
  },
  amenities: [String],
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slots: [{
      startTime: String,
      endTime: String,
      isBooked: {
        type: Boolean,
        default: false
      },
      booking: {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking'
      }
    }]
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
  subscriptionStatus: {
    isActive: {
      type: Boolean,
      default: false
    },
    expiresAt: Date
  }
});

// Indexer la localisation pour les recherches géospatiales
sportFieldSchema.index({ location: '2dsphere' });

const SportField = User.discriminator('SportField', sportFieldSchema);
module.exports = SportField;