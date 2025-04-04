// backend/controllers/userController.js
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const Client = require('../models/clientModel');
const Coach = require('../models/coachModel');
const HealthSpecialist = require('../models/healthSpecialistModel');
const Gym = require('../models/gymModel');
const SportField = require('../models/sportFieldModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// Configuration de multer pour le stockage des images
const multerStorage = multer.memoryStorage();

// Filtrer pour n'accepter que les images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Veuillez télécharger uniquement des images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

// Upload de photo de profil
exports.uploadUserPhoto = upload.single('photo');

// Redimensionner la photo de profil
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  
  next();
});

// Filtrer les champs de l'objet de mise à jour
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Obtenir mon profil
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Mise à jour de mon profil
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Créer une erreur si l'utilisateur tente de modifier son mot de passe
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Cette route n\'est pas pour les mises à jour de mot de passe. Veuillez utiliser /updateMyPassword.',
        400
      )
    );
  }
  
  // 2) Filtrer les champs non autorisés
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'phoneNumber', 'bio', 'address');
  if (req.file) filteredBody.photo = req.file.filename;
  
  // 3) Mise à jour du document utilisateur
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Désactiver mon compte
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Recherche d'utilisateurs par rôle
exports.getUsersByRole = catchAsync(async (req, res, next) => {
  let query = {};
  
  // Filtrer par rôle si spécifié
  if (req.params.role) {
    query.role = req.params.role;
  }
  
  // Filtrer par localisation si spécifié (recherche géospatiale)
  if (req.query.lat && req.query.lng && req.query.distance) {
    const { lat, lng, distance } = req.query;
    
    // Convertir la distance en radians (diviser par le rayon de la Terre)
    const radius = distance / 6378.1; // 6378.1 km est le rayon de la Terre
    
    query.location = {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    };
  }
  
  // Filtrer par spécialité pour les coachs
  if (req.query.specialty && req.params.role === 'coach') {
    query.specialties = { $in: [req.query.specialty] };
  }
  
  // Filtrer par spécialité pour les professionnels de santé
  if (req.query.specialty && req.params.role === 'healthSpecialist') {
    query.specialty = req.query.specialty;
  }
  
  // Filtrer par type de sport pour les terrains
  if (req.query.sportType && req.params.role === 'sportFieldOwner') {
    query.sportType = req.query.sportType;
  }
  
  // Filtrer par disponibilité
  if (req.query.availableDay) {
    query['availability.day'] = req.query.availableDay;
  }
  
  // Filtrer par note moyenne minimale
  if (req.query.minRating) {
    query['ratings.average'] = { $gte: parseFloat(req.query.minRating) };
  }
  
  // Recherche par nom ou prénom
  if (req.query.name) {
    const searchRegex = new RegExp(req.query.name, 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { name: searchRegex } // Pour les salles et terrains
    ];
  }
  
  let users;
  
  // Déterminer le modèle à utiliser en fonction du rôle
  switch (req.params.role) {
    case 'client':
      users = await Client.find(query);
      break;
    case 'coach':
      users = await Coach.find(query);
      break;
    case 'healthSpecialist':
      users = await HealthSpecialist.find(query);
      break;
    case 'gymOwner':
      users = await Gym.find(query);
      break;
    case 'sportFieldOwner':
      users = await SportField.find(query);
      break;
    default:
      users = await User.find(query);
  }
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

// Ajouter un coach/spécialiste/salle aux favoris
exports.addToFavorites = catchAsync(async (req, res, next) => {
  // Vérifier que l'utilisateur est un client
  if (req.user.role !== 'client') {
    return next(new AppError('Seuls les clients peuvent ajouter des favoris', 403));
  }
  
  const { entityId, entityType } = req.body;
  
  if (!entityId || !entityType) {
    return next(new AppError('Veuillez fournir entityId et entityType', 400));
  }
  
  // Vérifier que l'entité existe
  let entity;
  switch (entityType) {
    case 'coach':
      entity = await Coach.findById(entityId);
      if (!entity) return next(new AppError('Coach non trouvé', 404));
      await Client.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { favoriteCoaches: entityId } },
        { new: true }
      );
      break;
    case 'healthSpecialist':
      entity = await HealthSpecialist.findById(entityId);
      if (!entity) return next(new AppError('Spécialiste non trouvé', 404));
      await Client.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { favoriteHealthSpecialists: entityId } },
        { new: true }
      );
      break;
    case 'gym':
      entity = await Gym.findById(entityId);
      if (!entity) return next(new AppError('Salle de sport non trouvée', 404));
      await Client.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { favoriteGyms: entityId } },
        { new: true }
      );
      break;
    default:
      return next(new AppError('Type d\'entité non valide', 400));
  }
  
  res.status(200).json({
    status: 'success',
    message: `${entityType} ajouté aux favoris`
  });
});

// Supprimer des favoris
exports.removeFromFavorites = catchAsync(async (req, res, next) => {
  // Vérifier que l'utilisateur est un client
  if (req.user.role !== 'client') {
    return next(new AppError('Seuls les clients peuvent gérer leurs favoris', 403));
  }
  
  const { entityId, entityType } = req.params;
  
  if (!entityId || !entityType) {
    return next(new AppError('Veuillez fournir entityId et entityType', 400));
  }
  
  // Mettre à jour les favoris
  switch (entityType) {
    case 'coach':
      await Client.findByIdAndUpdate(
        req.user.id,
        { $pull: { favoriteCoaches: entityId } },
        { new: true }
      );
      break;
    case 'healthSpecialist':
      await Client.findByIdAndUpdate(
        req.user.id,
        { $pull: { favoriteHealthSpecialists: entityId } },
        { new: true }
      );
      break;
    case 'gym':
      await Client.findByIdAndUpdate(
        req.user.id,
        { $pull: { favoriteGyms: entityId } },
        { new: true }
      );
      break;
    default:
      return next(new AppError('Type d\'entité non valide', 400));
  }
  
  res.status(200).json({
    status: 'success',
    message: `${entityType} retiré des favoris`
  });
});

// Routes CRUD standard
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.searchUsersForChat = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new AppError('Le champ de recherche est requis.', 400));
  }

  const searchRegex = new RegExp(query, 'i');

  const users = await User.find({
    _id: { $ne: req.user.id },
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { name: searchRegex } // utile pour salles et terrains
    ]
  }).select('firstName lastName name email photo role');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});
