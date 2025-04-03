// backend/models/bookingModel.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Une réservation doit appartenir à un utilisateur']
  },
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service'
  },
  sportField: {
    type: mongoose.Schema.ObjectId,
    ref: 'SportField'
  },
  date: {
    type: Date,
    required: [true, 'Une réservation doit avoir une date']
  },
  startTime: {
    type: String,
    required: [true, 'Une réservation doit avoir une heure de début']
  },
  endTime: {
    type: String,
    required: [true, 'Une réservation doit avoir une heure de fin']
  },
  participants: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  payment: {
    amount: {
      type: Number,
      required: [true, 'Une réservation doit avoir un montant']
    },
    method: {
      type: String,
      enum: ['online', 'cash'],
      required: [true, 'Le mode de paiement est requis']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending'
    },
    transactionId: String
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware pour populer automatiquement service ou sportField
bookingSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email phoneNumber'
  });
  
  if (this._conditions.service) {
    this.populate({
      path: 'service',
      select: 'title price duration provider'
    });
  }
  
  if (this._conditions.sportField) {
    this.populate({
      path: 'sportField',
      select: 'name sportType hourlyRate'
    });
  }
  
  next();
});

// Virtual populate pour l'avis
bookingSchema.virtual('review', {
  ref: 'Review',
  foreignField: 'booking',
  localField: '_id',
  justOne: true
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;