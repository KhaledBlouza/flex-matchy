// backend/models/reviewModel.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Un avis doit appartenir à un utilisateur']
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: [true, 'Un avis doit être lié à une réservation']
  },
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service'
  },
  sportField: {
    type: mongoose.Schema.ObjectId,
    ref: 'SportField'
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    refPath: 'providerModel'
  },
  providerModel: {
    type: String,
    enum: ['Coach', 'HealthSpecialist', 'Gym', 'SportField']
  },
  rating: {
    type: Number,
    required: [true, 'Un avis doit avoir une note'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Un avis doit avoir un commentaire']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Chaque utilisateur ne peut donner qu'un seul avis par réservation
reviewSchema.index({ booking: 1, user: 1 }, { unique: true });

// Middleware pour populer automatiquement l'utilisateur
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName photo'
  });
  next();
});

// Méthode statique pour calculer la moyenne des avis
reviewSchema.statics.calcAverageRatings = async function(providerId, model) {
  const stats = await this.aggregate([
    {
      $match: { provider: providerId }
    },
    {
      $group: {
        _id: '$provider',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await mongoose.model(model).findByIdAndUpdate(providerId, {
      'ratings.count': stats[0].nRating,
      'ratings.average': stats[0].avgRating
    });
  } else {
    await mongoose.model(model).findByIdAndUpdate(providerId, {
      'ratings.count': 0,
      'ratings.average': 0
    });
  }
};

// Appeler calcAverageRatings après save
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.provider, this.providerModel);
});

// Middleware pour accéder à la réservation avant qu'elle soit supprimée ou modifiée
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

// Appeler calcAverageRatings après findOneAndUpdate ou findOneAndDelete
reviewSchema.post(/^findOneAnd/, function() {
  this.r.constructor.calcAverageRatings(this.r.provider, this.r.providerModel);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;