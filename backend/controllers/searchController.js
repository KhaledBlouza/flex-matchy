// backend/controllers/searchController.js

const mongoose = require('mongoose');
const Coach = require('../models/coachModel');
const HealthSpecialist = require('../models/healthSpecialistModel');
const Gym = require('../models/gymModel');
const SportField = require('../models/sportFieldModel');
const Service = require('../models/serviceModel');
const catchAsync = require('../utils/catchAsync');

// Recherche géospatiale
exports.searchNearby = catchAsync(async (req, res, next) => {
  const { lat, lng, distance = 5, type } = req.query; // distance en km
  
  if (!lat || !lng) {
    return res.status(400).json({
      status: 'fail',
      message: 'Veuillez fournir les coordonnées de localisation (lat, lng)'
    });
  }
  
  // Coordonnées et distance maximale (en mètres)
  const coordinates = [parseFloat(lng), parseFloat(lat)];
  const maxDistance = parseFloat(distance) * 1000; // Conversion en mètres
  
  let results = {};
  
  // Recherche en parallèle dans les différentes collections
  const promises = [];
  
  if (!type || type === 'coach') {
    promises.push(
      Coach.find({
        'location.coordinates': {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates
            },
            $maxDistance: maxDistance
          }
        }
      })
      .select('firstName lastName photo specialties location ratings')
      .limit(20)
      .then(coaches => {
        results.coaches = coaches;
      })
    );
  }
  
  if (!type || type === 'healthSpecialist') {
    promises.push(
      HealthSpecialist.find({
        'location.coordinates': {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates
            },
            $maxDistance: maxDistance
          }
        }
      })
      .select('firstName lastName photo specialty location ratings')
      .limit(20)
      .then(specialists => {
        results.healthSpecialists = specialists;
      })
    );
  }
  
  if (!type || type === 'gym') {
    promises.push(
      Gym.find({
        'location.coordinates': {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates
            },
            $maxDistance: maxDistance
          }
        }
      })
      .select('name description photos location ratings facilities')
      .limit(20)
      .then(gyms => {
        results.gyms = gyms;
      })
    );
  }
  
  if (!type || type === 'sportField') {
    promises.push(
      SportField.find({
        'location.coordinates': {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates
            },
            $maxDistance: maxDistance
          }
        }
      })
      .select('name sportType photos location ratings hourlyRate')
      .limit(20)
      .then(sportFields => {
        results.sportFields = sportFields;
      })
    );
  }
  
  if (!type || type === 'service') {
    promises.push(
      Service.find({
        'location.coordinates': {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates
            },
            $maxDistance: maxDistance
          }
        }
      })
      .select('title description price duration category location ratings')
      .populate({
        path: 'provider',
        select: 'firstName lastName name photo'
      })
      .limit(20)
      .then(services => {
        results.services = services;
      })
    );
  }
  
  await Promise.all(promises);
  
  res.status(200).json({
    status: 'success',
    data: results
  });
});

// Recherche par texte dans toutes les entités
exports.searchAll = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({
      status: 'fail',
      message: 'Veuillez fournir un terme de recherche'
    });
  }
  
  const results = {};
  const promises = [];
  
  // Recherche dans les coachs
  promises.push(
    Coach.find({ 
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { specialties: { $regex: query, $options: 'i' } }
      ]
    })
    .select('firstName lastName photo specialties location ratings')
    .limit(10)
    .then(coaches => {
      results.coaches = coaches;
    })
  );
  
  // Recherche dans les spécialistes de santé
  promises.push(
    HealthSpecialist.find({ 
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { specialty: { $regex: query, $options: 'i' } }
      ]
    })
    .select('firstName lastName photo specialty location ratings')
    .limit(10)
    .then(specialists => {
      results.healthSpecialists = specialists;
    })
  );
  
  // Recherche dans les salles de sport
  promises.push(
    Gym.find({ 
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { facilities: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name description photos location ratings facilities')
    .limit(10)
    .then(gyms => {
      results.gyms = gyms;
    })
  );
  
  // Recherche dans les terrains de sport
  promises.push(
    SportField.find({ 
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { sportType: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name sportType photos location ratings hourlyRate')
    .limit(10)
    .then(sportFields => {
      results.sportFields = sportFields;
    })
  );
  
  // Recherche dans les services
  promises.push(
    Service.find({ 
      $text: { $search: query }
    })
    .select('title description price duration category location ratings')
    .populate({
      path: 'provider',
      select: 'firstName lastName name photo'
    })
    .limit(10)
    .then(services => {
      results.services = services;
    })
  );
  
  await Promise.all(promises);
  
  res.status(200).json({
    status: 'success',
    data: results
  });
});