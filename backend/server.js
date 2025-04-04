// backend/server.js (modification)

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');

// Gestion des exceptions non capturées
process.on('uncaughtException', err => {
  console.log('Erreur levée depuis:', err.stack);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Configuration des variables d'environnement
dotenv.config({ path: './config.env' });
const app = require('./app');
const { initializeSocketServer } = require('./utils/socketManager');

// Construction de la chaîne de connexion MongoDB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connexion à MongoDB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à la base de données réussie!'));

// Créer le serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.IO
const io = initializeSocketServer(server);

// Démarrage du serveur
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

// Gestion des rejets de promesses non capturées
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Gestion du signal SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});