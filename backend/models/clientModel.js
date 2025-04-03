// backend/models/clientModel.js
const mongoose = require('mongoose');
const User = require('./userModel');

const clientSchema = new mongoose.Schema({
  favoriteCoaches: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Coach'
  }],
  favoriteGyms: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Gym'
  }],
  favoriteHealthSpecialists: [{
    type: mongoose.Schema.ObjectId,
    ref: 'HealthSpecialist'
  }],
  bookings: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Booking'
  }],
  reviews: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Review'
  }],
  preferences: {
    sports: [String],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
});

const Client = User.discriminator('Client', clientSchema);
module.exports = Client;

