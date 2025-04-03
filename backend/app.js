// backend/app.js
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Import des routes
const userRouter = require('./routes/userRoutes');
const serviceRouter = require('./routes/serviceRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const postRouter = require('./routes/postRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const conversationRouter = require('./routes/conversationRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const subscriptionRouter = require('./routes/subscriptionRoutes');
const gymSubscriptionRouter = require('./routes/gymSubscriptionRoutes');

// Initialisation de l'application Express
const app = express();

// Activer CORS
app.use(cors());
app.options('*', cors());

// Servir des fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de sécurité
app.use(helmet()); // Entêtes HTTP sécurisés

// Middleware de journalisation en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limiter les requêtes pour éviter les attaques par force brute
const limiter = rateLimit({
  max: 100, // 100 requêtes par heure
  windowMs: 60 * 60 * 1000,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer dans une heure!'
});
app.use('/api', limiter);

// Routes sans limitation de taux (webhooks)
app.post('/webhook-checkout', express.raw({ type: 'application/json' }), require('./controllers/bookingController').webhookCheckout);
app.post('/webhook-subscription', express.raw({ type: 'application/json' }), require('./controllers/subscriptionController').webhookSubscription);

// Middleware de parsing du corps des requêtes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Protection contre l'injection dans MongoDB
app.use(mongoSanitize());

// Protection contre les attaques XSS
app.use(xss());

// Protection contre la pollution des paramètres HTTP
app.use(hpp({
  whitelist: [
    'price',
    'duration',
    'rating',
    'maxParticipants',
    'hourlyRate',
    'capacity'
  ]
}));

// Compression des réponses
app.use(compression());

// Middleware pour ajouter un timestamp à la requête
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes API
app.use('/api/v1/users', userRouter);
app.use('/api/v1/services', serviceRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/conversations', conversationRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/gym-subscriptions', gymSubscriptionRouter);

// Route pour la santé de l'API
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API FlexMatch fonctionne correctement'
  });
});

// Gestion des routes inexistantes
app.all('*', (req, res, next) => {
  next(new AppError(`Impossible de trouver ${req.originalUrl} sur ce serveur!`, 404));
});

// Middleware de gestion globale des erreurs
app.use(globalErrorHandler);

module.exports = app;