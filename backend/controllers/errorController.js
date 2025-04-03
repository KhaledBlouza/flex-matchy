// backend/controllers/errorController.js
const AppError = require('../utils/appError');

// Gestion des erreurs en développement
const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Gestion des erreurs en production
const sendErrorProd = (err, req, res) => {
  // Erreurs opérationnelles, de confiance: envoyer au client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  
  // Erreurs de programmation ou inconnues: ne pas divulguer les détails
  console.error('ERROR 💥', err);
  res.status(500).json({
    status: 'error',
    message: 'Une erreur s\'est produite!'
  });
};

// Gestion des erreurs CastError de MongoDB
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Gestion des erreurs de champs dupliqués de MongoDB
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Champ dupliqué: ${value}. Veuillez utiliser une autre valeur!`;
  return new AppError(message, 400);
};

// Gestion des erreurs de validation de Mongoose
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Données d'entrée invalides. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Gestion des erreurs JWT
const handleJWTError = () =>
  new AppError('Token invalide. Veuillez vous reconnecter!', 401);

// Gestion des erreurs d'expiration JWT
const handleJWTExpiredError = () =>
  new AppError('Votre token a expiré. Veuillez vous reconnecter!', 401);

// Middleware global de gestion des erreurs
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};