// backend/models/coachVacancyModel.js
const mongoose = require('mongoose');

const coachVacancySchema = new mongoose.Schema({
  gym: {
    type: mongoose.Schema.ObjectId,
    ref: 'Gym',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  specialties: [String],
  salary: String,
  employmentType: {
    type: String,
    enum: ['fullTime', 'partTime', 'freelance', 'internship'],
    required: true
  },
  applications: [{
    coach: {
      type: mongoose.Schema.ObjectId,
      ref: 'Coach'
    },
    coverLetter: String,
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isOpen: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deadlineDate: Date
});

// Indexer pour la recherche
coachVacancySchema.index({ title: 'text', description: 'text' });

// Ne pas afficher les postes fermés ou expirés
coachVacancySchema.pre(/^find/, function(next) {
  const now = new Date();
  this.find({
    isOpen: true,
    deadlineDate: { $gt: now }
  });
  next();
});

const CoachVacancy = mongoose.model('CoachVacancy', coachVacancySchema);
module.exports = CoachVacancy;