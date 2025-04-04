// backend/controllers/handlerFactory.js
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Créer un document
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// Obtenir un document
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('Aucun document trouvé avec cet ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// Mettre à jour un document
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('Aucun document trouvé avec cet ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// Supprimer un document
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('Aucun document trouvé avec cet ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

// Obtenir tous les documents
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // Pour permettre les requêtes imbriquées (ex: GET /coaches/:id/reviews)
    let filter = {};
    if (req.params.coachId) filter = { coach: req.params.coachId };
    if (req.params.healthSpecialistId) filter = { healthSpecialist: req.params.healthSpecialistId };
    if (req.params.gymId) filter = { gym: req.params.gymId };
    if (req.params.sportFieldId) filter = { sportField: req.params.sportFieldId };
    if (req.params.serviceId) filter = { service: req.params.serviceId };

    // Exécuter la requête
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    
    const doc = await features.query;

    // Envoyer la réponse
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });