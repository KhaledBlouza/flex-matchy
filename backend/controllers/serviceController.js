// backend/controllers/serviceController.js
const multer = require('multer');
const sharp = require('sharp');
const Service = require('../models/serviceModel');
const Coach = require('../models/coachModel');
const HealthSpecialist = require('../models/healthSpecialistModel');
const Gym = require('../models/gymModel');
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

// Upload d'images multiples pour le service
exports.uploadServiceImages = upload.array('images', 5);

// Redimensionner les images du service
exports.resizeServiceImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();
  
  req.body.images = [];
  
  await Promise.all(
    req.files.map(async (file, i) => {
      const filename = `service-${req.params.id || 'new'}-${Date.now()}-${i + 1}.jpeg`;
      
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/services/${filename}`);
      
      req.body.images.push(filename);
    })
  );
  
  next();
});

// Vérifier le propriétaire du service
exports.checkServiceOwner = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return next(new AppError('Aucun service trouvé avec cet ID', 404));
  }
  
  // Vérifier que l'utilisateur actuel est le propriétaire du service
  if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'êtes pas autorisé à modifier ce service', 403));
  }
  
  next();
});

// Créer un nouveau service
exports.createService = catchAsync(async (req, res, next) => {
  // Vérifier que l'utilisateur est un coach, un spécialiste de santé ou une salle de sport
  if (!['coach', 'healthSpecialist', 'gymOwner'].includes(req.user.role)) {
    return next(new AppError('Seuls les coachs, spécialistes de santé et salles de sport peuvent créer des services', 403));
  }
  
  // Déterminer le type de fournisseur (providerModel) en fonction du rôle
  let providerModel;
  switch (req.user.role) {
    case 'coach':
      providerModel = 'Coach';
      break;
    case 'healthSpecialist':
      providerModel = 'HealthSpecialist';
      break;
    case 'gymOwner':
      providerModel = 'Gym';
      break;
  }
  
  // Créer le service avec l'ID du fournisseur
  const newService = await Service.create({
    ...req.body,
    provider: req.user.id,
    providerModel
  });
  
  // Ajouter le service à la liste des services du fournisseur
  switch (req.user.role) {
    case 'coach':
      await Coach.findByIdAndUpdate(
        req.user.id,
        { $push: { services: newService._id } },
        { new: true }
      );
      break;
    case 'healthSpecialist':
      await HealthSpecialist.findByIdAndUpdate(
        req.user.id,
        { $push: { services: newService._id } },
        { new: true }
      );
      break;
    case 'gymOwner':
      await Gym.findByIdAndUpdate(
        req.user.id,
        { $push: { services: newService._id } },
        { new: true }
      );
      break;
  }
  
  res.status(201).json({
    status: 'success',
    data: {
      service: newService
    }
  });
});

// Recherche avancée de services
exports.searchServices = catchAsync(async (req, res, next) => {
  let query = {};
  
  // Filtrer par catégorie
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Filtrer par type de fournisseur
  if (req.query.providerType) {
    query.providerModel = req.query.providerType;
  }
  
  // Filtrer par localisation (recherche géospatiale)
  if (req.query.lat && req.query.lng && req.query.distance) {
    const { lat, lng, distance } = req.query;
    
    // Convertir la distance en radians
    const radius = distance / 6378.1;
    
    query.location = {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    };
  }
  
  // Filtrer par prix maximum
  if (req.query.maxPrice) {
    query.price = { $lte: parseFloat(req.query.maxPrice) };
  }
  
  // Filtrer par disponibilité (jour)
  if (req.query.availableDay) {
    query['availability.day'] = req.query.availableDay;
  }
  
  // Filtrer par note minimale
  if (req.query.minRating) {
    query['ratings.average'] = { $gte: parseFloat(req.query.minRating) };
  }
  
  // Recherche par titre ou description
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }
  
  // Filtrer par services en ligne
  if (req.query.online === 'true') {
    query.isOnline = true;
  }
  
  // Option de tri
  let sort = {};
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price-asc':
        sort = { price: 1 };
        break;
      case 'price-desc':
        sort = { price: -1 };
        break;
      case 'rating-desc':
        sort = { 'ratings.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
    }
  } else {
    // Tri par défaut
    sort = { 'ratings.average': -1, createdAt: -1 };
  }
  
  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  
  // Exécuter la requête
  const services = await Service.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'provider',
      select: 'firstName lastName name photo ratings'
    });
  
  // Compter le nombre total de résultats pour la pagination
  const total = await Service.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    results: services.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      services
    }
  });
});

// Obtenir les services par fournisseur
exports.getServicesByProvider = catchAsync(async (req, res, next) => {
  const { providerId } = req.params;
  
  if (!providerId) {
    return next(new AppError('Veuillez fournir l\'ID du fournisseur', 400));
  }
  
  const services = await Service.find({ provider: providerId })
    .populate({
      path: 'provider',
      select: 'firstName lastName name photo ratings'
    });
  
  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services
    }
  });
});

// Vérifier la disponibilité d'un service à une date/heure spécifique
exports.checkAvailability = catchAsync(async (req, res, next) => {
  const { serviceId, date, startTime } = req.query;
  
  if (!serviceId || !date || !startTime) {
    return next(new AppError('Veuillez fournir serviceId, date et startTime', 400));
  }
  
  const service = await Service.findById(serviceId);
  
  if (!service) {
    return next(new AppError('Service non trouvé', 404));
  }
  
  // Convertir la date en jour de la semaine (0-6, 0 étant dimanche)
  const dayIndex = new Date(date).getDay();
  // Convertir en format utilisé dans notre modèle (monday, tuesday, etc.)
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayString = days[dayIndex];
  
  // Vérifier si le service est disponible ce jour-là
  const dayAvailability = service.availability.find(avail => avail.day === dayString);
  
  if (!dayAvailability) {
    return res.status(200).json({
      status: 'success',
      data: {
        available: false,
        message: 'Le service n\'est pas disponible ce jour'
      }
    });
  }
  
  // Vérifier si l'heure demandée est disponible
  const slotAvailable = dayAvailability.slots.some(slot => {
    return slot.startTime === startTime && !slot.isBooked;
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      available: slotAvailable,
      message: slotAvailable 
        ? 'Le créneau est disponible' 
        : 'Le créneau n\'est pas disponible'
    }
  });
});

// Routes CRUD standard
exports.getAllServices = factory.getAll(Service);
exports.getService = factory.getOne(Service, { path: 'reviews' });
exports.updateService = factory.updateOne(Service);
exports.deleteService = factory.deleteOne(Service);