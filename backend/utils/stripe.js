// backend/utils/stripe.js

const Stripe = require('stripe');

// Ne pas utiliser dotenv ici ! Les variables doivent être déjà chargées via server.js
if (!process.env.STRIPE_SECRET_KEY) {
    
  throw new Error('❌ STRIPE_SECRET_KEY non définie. Assure-toi que dotenv est bien chargé en premier.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
