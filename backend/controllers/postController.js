// backend/controllers/postController.js
const multer = require('multer');
const sharp = require('sharp');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const Coach = require('../models/coachModel');
const HealthSpecialist = require('../models/healthSpecialistModel');
const Gym = require('../models/gymModel');
const Notification = require('../models/notificationModel');
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

// Upload d'images multiples pour la publication
exports.uploadPostImages = upload.array('images', 5);

// Redimensionner les images de la publication
exports.resizePostImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();
  
  req.body.images = [];
  
  await Promise.all(
    req.files.map(async (file, i) => {
      const filename = `post-${req.params.id || 'new'}-${Date.now()}-${i + 1}.jpeg`;
      
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/posts/${filename}`);
      
      req.body.images.push(filename);
    })
  );
  
  next();
});

// Vérifier le propriétaire de la publication
exports.checkPostOwner = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new AppError('Aucune publication trouvée avec cet ID', 404));
  }
  
  // Vérifier que l'utilisateur actuel est le propriétaire de la publication
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'êtes pas autorisé à modifier cette publication', 403));
  }
  
  next();
});

// Créer une nouvelle publication
exports.createPost = catchAsync(async (req, res, next) => {
  // Vérifier que l'utilisateur est un coach, un spécialiste de santé ou une salle de sport
  if (!['coach', 'healthSpecialist', 'gymOwner'].includes(req.user.role)) {
    return next(new AppError('Seuls les coachs, spécialistes de santé et salles de sport peuvent créer des publications', 403));
  }
  
  // Déterminer le type d'auteur (authorModel) en fonction du rôle
  let authorModel;
  switch (req.user.role) {
    case 'coach':
      authorModel = 'Coach';
      break;
    case 'healthSpecialist':
      authorModel = 'HealthSpecialist';
      break;
    case 'gymOwner':
      authorModel = 'Gym';
      break;
  }
  
  // Créer la publication
  const newPost = await Post.create({
    author: req.user.id,
    authorModel,
    title: req.body.title,
    content: req.body.content,
    type: req.body.type,
    images: req.body.images || [],
    tags: req.body.tags || [],
    eventDate: req.body.eventDate,
    eventLocation: req.body.eventLocation,
    jobDetails: req.body.jobDetails,
    promotionDetails: req.body.promotionDetails
  });
  
  // Ajouter la publication à la liste des publications de l'auteur
  switch (req.user.role) {
    case 'coach':
      await Coach.findByIdAndUpdate(
        req.user.id,
        { $push: { posts: newPost._id } }
      );
      break;
    case 'healthSpecialist':
      await HealthSpecialist.findByIdAndUpdate(
        req.user.id,
        { $push: { posts: newPost._id } }
      );
      break;
    case 'gymOwner':
      await Gym.findByIdAndUpdate(
        req.user.id,
        { $push: { posts: newPost._id } }
      );
      break;
  }
  
  res.status(201).json({
    status: 'success',
    data: {
      post: newPost
    }
  });
});

// Aimer une publication
exports.likePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new AppError('Publication non trouvée', 404));
  }
  
  // Vérifier si l'utilisateur a déjà aimé la publication
  const alreadyLiked = post.likes.includes(req.user.id);
  
  if (alreadyLiked) {
    // Enlever le like
    await Post.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.user.id } },
      { new: true }
    );
  } else {
    // Ajouter le like
    await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { likes: req.user.id } },
      { new: true }
    );
    
    // Notifier l'auteur si ce n'est pas lui-même qui like
    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.author,
        sender: req.user.id,
        type: 'other',
        title: 'Nouveau j\'aime',
        content: `${req.user.firstName} ${req.user.lastName} a aimé votre publication "${post.title}"`,
        relatedTo: {
          model: 'Post',
          id: post._id
        }
      });
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      liked: !alreadyLiked
    }
  });
});

// Commenter une publication
exports.commentPost = catchAsync(async (req, res, next) => {
  const { text } = req.body;
  
  if (!text) {
    return next(new AppError('Le commentaire ne peut pas être vide', 400));
  }
  
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new AppError('Publication non trouvée', 404));
  }
  
  // Ajouter le commentaire
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        comments: {
          user: req.user.id,
          text,
          createdAt: Date.now()
        }
      }
    },
    { new: true }
  );
  
  // Notifier l'auteur si ce n'est pas lui-même qui commente
  if (post.author.toString() !== req.user.id) {
    await Notification.create({
      recipient: post.author,
      sender: req.user.id,
      type: 'other',
      title: 'Nouveau commentaire',
      content: `${req.user.firstName} ${req.user.lastName} a commenté votre publication "${post.title}"`,
      relatedTo: {
        model: 'Post',
        id: post._id
      }
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      post: updatedPost
    }
  });
});


// Partager un post
exports.sharePost = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const post = await Post.findById(id);
    
    if (!post) {
      return next(new AppError('Publication non trouvée', 404));
    }
    
    // Créer un nouveau post qui partage le post original
    const sharedPost = await Post.create({
      author: req.user.id,
      authorModel: getAuthorModelFromRole(req.user.role),
      title: `Partagé: ${post.title}`,
      content: req.body.content || '',
      type: 'shared',
      originalPost: id,
      tags: post.tags,
      createdAt: Date.now()
    });
    
    // Notifier l'auteur du post original
    await Notification.create({
      recipient: post.author,
      sender: req.user.id,
      type: 'other',
      title: 'Partage de publication',
      content: `${req.user.firstName} ${req.user.lastName} a partagé votre publication "${post.title}"`,
      relatedTo: {
        model: 'Post',
        id: post._id
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        post: sharedPost
      }
    });
  });
  
  // Fonction utilitaire pour déterminer le modèle d'auteur en fonction du rôle
  const getAuthorModelFromRole = (role) => {
    switch (role) {
      case 'coach':
        return 'Coach';
      case 'healthSpecialist':
        return 'HealthSpecialist';
      case 'gymOwner':
        return 'Gym';
      default:
        return 'User';
    }
  };

// Obtenir les publications par type
exports.getPostsByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  
  // Vérifier si le type est valide
  if (!['blog', 'event', 'jobOffer', 'promotion'].includes(type)) {
    return next(new AppError('Type de publication non valide', 400));
  }
  
  // Recherche avancée
  let query = { type };
  
  // Filtrer par auteur si spécifié
  if (req.query.author) {
    query.author = req.query.author;
  }
  
  // Filtrer par type d'auteur si spécifié
  if (req.query.authorType) {
    query.authorModel = req.query.authorType;
  }
  
  // Recherche par titre ou contenu
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }
  
  // Filtrer par tag
  if (req.query.tag) {
    query.tags = { $in: [req.query.tag] };
  }
  
  // Filtrer par date d'événement (pour les événements)
  if (type === 'event' && req.query.startDate && req.query.endDate) {
    query.eventDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }
  
  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  
  // Trier par date de création (du plus récent au plus ancien)
  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'author',
      select: 'firstName lastName name photo'
    });
  
  // Compter le nombre total de résultats pour la pagination
  const total = await Post.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    results: posts.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      posts
    }
  });
});

// Routes CRUD standard
exports.getAllPosts = factory.getAll(Post);
exports.getPost = factory.getOne(Post);
exports.updatePost = factory.updateOne(Post);
exports.deletePost = factory.deleteOne(Post);