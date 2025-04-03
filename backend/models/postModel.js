// backend/models/postModel.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    refPath: 'authorModel',
    required: [true, 'Une publication doit avoir un auteur']
  },
  authorModel: {
    type: String,
    required: true,
    enum: ['Coach', 'HealthSpecialist', 'Gym']
  },
  title: {
    type: String,
    required: [true, 'Une publication doit avoir un titre']
  },
  content: {
    type: String,
    required: [true, 'Une publication doit avoir un contenu']
  },
  images: [String],
  type: {
    type: String,
    enum: ['blog', 'event', 'jobOffer', 'promotion'],
    required: [true, 'Le type de publication est requis']
  },
  tags: [String],
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  eventDate: Date, // Pour les événements
  eventLocation: String, // Pour les événements
  jobDetails: { // Pour les offres d'emploi
    position: String,
    requirements: [String],
    salary: String,
    applicationDeadline: Date
  },
  promotionDetails: { // Pour les promotions
    startDate: Date,
    endDate: Date,
    discount: Number
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexer pour la recherche par titre et contenu
postSchema.index({ title: 'text', content: 'text' });

// Middleware pour populer l'auteur
postSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'firstName lastName photo'
  });
  next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;