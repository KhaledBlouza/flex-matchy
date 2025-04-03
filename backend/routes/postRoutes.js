// backend/routes/postRoutes.js
const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

// Routes publiques
router.get('/', postController.getAllPosts);
router.get('/type/:type', postController.getPostsByType);
router.get('/:id', postController.getPost);

// Routes protégées
router.use(authController.protect);

// Actions sur les publications (like, commentaire)
router.patch('/:id/like', postController.likePost);
router.post('/:id/comment', postController.commentPost);

// Routes pour les fournisseurs
router.post(
  '/',
  authController.restrictTo('coach', 'healthSpecialist', 'gymOwner'),
  postController.uploadPostImages,
  postController.resizePostImages,
  postController.createPost
);

router.patch(
  '/:id',
  postController.checkPostOwner,
  postController.uploadPostImages,
  postController.resizePostImages,
  postController.updatePost
);

router.delete(
  '/:id',
  postController.checkPostOwner,
  postController.deletePost
);

module.exports = router;