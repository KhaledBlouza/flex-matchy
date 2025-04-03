// backend/controllers/authController.js
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Client = require('../models/clientModel');
const Coach = require('../models/coachModel');
const HealthSpecialist = require('../models/healthSpecialistModel');
const Gym = require('../models/gymModel');
const SportField = require('../models/sportFieldModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// Fonction pour créer et signer un JWT
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Fonction pour envoyer le token au client
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
  res.cookie('jwt', token, cookieOptions);
  
  // Retirer le mot de passe de la sortie
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Inscription
exports.signup = catchAsync(async (req, res, next) => {
  // Déterminer le modèle utilisateur en fonction du rôle
  let userModel;
  switch (req.body.role) {
    case 'client':
      userModel = Client;
      break;
    case 'coach':
      userModel = Coach;
      break;
    case 'healthSpecialist':
      userModel = HealthSpecialist;
      break;
    case 'gymOwner':
      userModel = Gym;
      break;
    case 'sportFieldOwner':
      userModel = SportField;
      break;
    default:
      userModel = Client;
  }
  
  // Créer le nouvel utilisateur
  const newUser = await userModel.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    photo: req.body.photo || 'default.jpg',
    address: req.body.address
  });
  
  // Si c'est un coach, un spécialiste de santé, une salle de sport ou un terrain, 
  // ajouter les informations spécifiques
  if (req.body.role === 'coach' && req.body.specialties) {
    newUser.specialties = req.body.specialties;
    newUser.experience = req.body.experience;
    newUser.certifications = req.body.certifications;
    newUser.location = req.body.location;
  } else if (req.body.role === 'healthSpecialist' && req.body.specialty) {
    newUser.specialty = req.body.specialty;
    newUser.qualifications = req.body.qualifications;
    newUser.licenseNumber = req.body.licenseNumber;
    newUser.location = req.body.location;
  } else if (req.body.role === 'gymOwner' && req.body.name) {
    newUser.name = req.body.name;
    newUser.description = req.body.description;
    newUser.facilities = req.body.facilities;
    newUser.location = req.body.location;
    newUser.openingHours = req.body.openingHours;
  } else if (req.body.role === 'sportFieldOwner' && req.body.name) {
    newUser.name = req.body.name;
    newUser.description = req.body.description;
    newUser.sportType = req.body.sportType;
    newUser.capacity = req.body.capacity;
    newUser.hourlyRate = req.body.hourlyRate;
    newUser.location = req.body.location;
  }
  
  await newUser.save();
  
  // Envoyer un email de bienvenue
  const welcomeMessage = `Bienvenue sur FlexMatch, ${newUser.firstName}! Nous sommes ravis de vous avoir parmi nous.`;
  try {
    await sendEmail({
      email: newUser.email,
      subject: 'Bienvenue sur FlexMatch!',
      message: welcomeMessage
    });
  } catch (err) {
    console.log('Erreur lors de l\'envoi de l\'email de bienvenue.', err);
  }
  
  // Créer et envoyer le JWT
  createSendToken(newUser, 201, res);
});

// Connexion
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // 1) Vérifier si l'email et le mot de passe existent
  if (!email || !password) {
    return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
  }
  
  // 2) Vérifier si l'utilisateur existe && le mot de passe est correct
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email ou mot de passe incorrect', 401));
  }
  
  // 3) Si tout est ok, envoyer le token au client
  createSendToken(user, 200, res);
});

// Déconnexion
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

// Protection des routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Obtenir le token et vérifier s'il existe
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  
  if (!token) {
    return next(
      new AppError('Vous n\'êtes pas connecté! Veuillez vous connecter pour accéder à cette ressource.', 401)
    );
  }
  
  // 2) Vérification du token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
  // 3) Vérifier si l'utilisateur existe toujours
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'L\'utilisateur associé à ce token n\'existe plus.',
        401
      )
    );
  }
  
  // 4) Vérifier si l'utilisateur a changé de mot de passe après l'émission du token
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('L\'utilisateur a récemment changé de mot de passe! Veuillez vous reconnecter.', 401)
    );
  }
  
  // Accorder l'accès à la route protégée
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Vérification si l'utilisateur est connecté
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Vérification du token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      
      // 2) Vérifier si l'utilisateur existe toujours
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      
      // 3) Vérifier si l'utilisateur a changé de mot de passe après l'émission du token
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      
      // L'utilisateur est connecté
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Restriction d'accès aux rôles spécifiés
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Vous n\'avez pas la permission d\'effectuer cette action', 403)
      );
    }
    
    next();
  };
};

// Mot de passe oublié
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Obtenir l'utilisateur basé sur l'email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet email', 404));
  }
  
  // 2) Générer un token aléatoire
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  
  // 3) Envoyer le token par email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  
  const message = `Vous avez oublié votre mot de passe? Soumettez une requête PATCH avec votre nouveau mot de passe et sa confirmation à: ${resetURL}.\nSi vous n'avez pas oublié votre mot de passe, veuillez ignorer cet email!`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Votre token de réinitialisation de mot de passe (valide pour 10 min)',
      message
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Token envoyé par email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(
      new AppError('Une erreur est survenue lors de l\'envoi de l\'email. Veuillez réessayer plus tard!', 500)
    );
  }
});

// Réinitialisation du mot de passe
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Obtenir l'utilisateur basé sur le token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  
  // 2) Si le token n'a pas expiré et qu'il y a un utilisateur, définir le nouveau mot de passe
  if (!user) {
    return next(new AppError('Token invalide ou expiré', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  
  // 3) Mettre à jour changedPasswordAt (fait via middleware)
  
  // 4) Connecter l'utilisateur, envoyer le JWT
  createSendToken(user, 200, res);
});

// Mise à jour du mot de passe (pour utilisateur connecté)
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Obtenir l'utilisateur de la collection
  const user = await User.findById(req.user.id).select('+password');
  
  // 2) Vérifier si le mot de passe actuel est correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Votre mot de passe actuel est incorrect', 401));
  }
  
  // 3) Si c'est correct, mettre à jour le mot de passe
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  
  // 4) Connecter l'utilisateur, envoyer le JWT
  createSendToken(user, 200, res);
});