// backend/models/serviceModel.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Un service doit avoir un titre']
  },
  description: {
    type: String,
    required: [true, 'Une description est requise']
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    refPath: 'providerModel',
    required: [true, 'Un service doit avoir un fournisseur']
  },
  providerModel: {
    type: String,
    required: true,
    enum: ['Coach', 'HealthSpecialist', 'Gym']
  },
  price: {
    type: Number,
    required: [true, 'Un service doit avoir un prix']
  },
  duration: {
    type: Number, // en minutes
    required: [true, 'La durée du service est requise']
  },
  category: {
    type: String,
    required: [true, 'La catégorie du service est requise'],
    enum: ['individual', 'group', 'online', 'consultation', 'program']
  },
  maxParticipants: {
    type: Number,
    default: 1
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    address: String
  },
  isOnline: {
    type: Boolean,
    default: false
  },
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
      }
    }]
  }],
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
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
  active: {
    type: Boolean,
    default: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate pour les réservations
serviceSchema.virtual('bookings', {
  ref: 'Booking',
  foreignField: 'service',
  localField: '_id'
});

// Virtual populate pour les avis
serviceSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'service',
  localField: '_id'
});

// Indexer la localisation pour les recherches géospatiales
serviceSchema.index({ location: '2dsphere' });

// Indexer pour la recherche par titre et description
serviceSchema.index({ title: 'text', description: 'text' });

// Middleware pour ne pas afficher les services inactifs
serviceSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;