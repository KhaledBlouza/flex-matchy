// backend/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Schéma de base pour tous les utilisateurs
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Veuillez fournir votre prénom']
  },
  lastName: {
    type: String,
    required: [true, 'Veuillez fournir votre nom']
  },
  email: {
    type: String,
    required: [true, 'Veuillez fournir votre email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Veuillez fournir votre numéro de téléphone']
  },
  role: {
    type: String,
    enum: ['client', 'coach', 'healthSpecialist', 'gymOwner', 'sportFieldOwner', 'admin'],
    default: 'client'
  },
  password: {
    type: String,
    required: [true, 'Veuillez fournir un mot de passe'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Veuillez confirmer votre mot de passe'],
    validate: {
      // Cette validation fonctionne uniquement lors de CREATE et SAVE
      validator: function(el) {
        return el === this.password;
      },
      message: 'Les mots de passe ne correspondent pas'
    }
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Tunisie'
    }
  },
  bio: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  notifications: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Notification'
  }],
  subscription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subscription'
  },
  conversations: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Conversation'
  }]
}, {
  discriminatorKey: 'userType',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware pour hacher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  // Exécuter cette fonction seulement si le mot de passe a été modifié
  if (!this.isModified('password')) return next();
  
  // Hacher le mot de passe avec un coût de 12
  this.password = await bcrypt.hash(this.password, 12);
  
  // Supprimer le champ passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

// Middleware pour mettre à jour passwordChangedAt après changement de mot de passe
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000; // -1s pour assurer que le token est créé après le changement
  next();
});

// Middleware pour ne pas afficher les utilisateurs inactifs
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// Méthode d'instance pour comparer les mots de passe
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Méthode pour vérifier si le mot de passe a été changé après émission du JWT
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Méthode pour générer un token de réinitialisation de mot de passe
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;