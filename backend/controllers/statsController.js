// backend/controllers/statsController.js

const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/bookingModel');
const Service = require('../models/serviceModel');
const Review = require('../models/reviewModel');
const Post = require('../models/postModel');
const Conversation = require('../models/conversationModel');
const GymMembership = require('../models/gymMembershipModel');

// Statistiques pour les clients
exports.getClientStats = catchAsync(async (req, res, next) => {
  // Total des réservations
  const totalBookings = await Booking.countDocuments({ user: req.user.id });
  
  // Réservations par statut
  const bookingsByStatus = await Booking.aggregate([
    { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Réservations récentes
  const recentBookings = await Booking.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({
      path: 'service',
      select: 'title'
    })
    .populate({
      path: 'sportField',
      select: 'name'
    });
  
  // Total dépensé
  const totalSpent = await Booking.aggregate([
    { $match: { 
      user: mongoose.Types.ObjectId(req.user.id),
      'payment.status': 'completed'
    } },
    { $group: { _id: null, total: { $sum: '$payment.amount' } } }
  ]);
  
  // Répartition des réservations par type
  const bookingsByType = await Booking.aggregate([
    { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
    { $project: { 
      type: { 
        $cond: { if: '$service', then: 'service', else: 'sportField' } 
      }
    } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      totalBookings,
      bookingsByStatus: bookingsByStatus.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),
      recentBookings,
      totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0,
      bookingsByType: bookingsByType.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {})
    }
  });
});

// Statistiques pour les coachs
exports.getCoachStats = catchAsync(async (req, res, next) => {
  // Services offerts
  const totalServices = await Service.countDocuments({ provider: req.user.id });
  
  // Total des réservations
  const services = await Service.find({ provider: req.user.id });
  const serviceIds = services.map(service => service._id);
  
  const totalBookings = await Booking.countDocuments({ 
    service: { $in: serviceIds } 
  });
  
  // Réservations par statut
  const bookingsByStatus = await Booking.aggregate([
    { $match: { service: { $in: serviceIds.map(id => mongoose.Types.ObjectId(id)) } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Revenus totaux
  const totalRevenue = await Booking.aggregate([
    { $match: { 
      service: { $in: serviceIds.map(id => mongoose.Types.ObjectId(id)) },
      'payment.status': 'completed'
    } },
    { $group: { _id: null, total: { $sum: '$payment.amount' } } }
  ]);
  
  // Réservations par mois (6 derniers mois)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const bookingsByMonth = await Booking.aggregate([
    { $match: { 
      service: { $in: serviceIds.map(id => mongoose.Types.ObjectId(id)) },
      createdAt: { $gte: sixMonthsAgo }
    } },
    { $group: { 
      _id: { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      },
      count: { $sum: 1 },
      revenue: { $sum: '$payment.amount' }
    } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Note moyenne des avis
  const reviews = await Review.find({ 
    provider: req.user.id,
    providerModel: 'Coach'
  });
  
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  
  res.status(200).json({
    status: 'success',
    data: {
      totalServices,
      totalBookings,
      bookingsByStatus: bookingsByStatus.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      bookingsByMonth,
      totalReviews: reviews.length,
      averageRating
    }
  });
});

// Statistiques pour les salles de sport
exports.getGymStats = catchAsync(async (req, res, next) => {
  // Total des abonnements
  const totalMemberships = await GymMembership.countDocuments({ 
    gym: req.user.id,
    isActive: true
  });
  
  // Nouveaux abonnements ce mois-ci
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const newMemberships = await GymMembership.countDocuments({
    gym: req.user.id,
    isActive: true,
    startDate: { $gte: startOfMonth }
  });
  
  // Revenus des abonnements par mois
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const revenueByMonth = await GymMembership.aggregate([
    { $match: { 
      gym: mongoose.Types.ObjectId(req.user.id),
      isActive: true,
      startDate: { $gte: sixMonthsAgo }
    } },
    { $group: { 
      _id: { 
        year: { $year: '$startDate' },
        month: { $month: '$startDate' }
      },
      count: { $sum: 1 },
      revenue: { $sum: '$paymentDetails.amount' }
    } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Répartition des abonnements par plan
  const membershipsByPlan = await GymMembership.aggregate([
    { $match: { gym: mongoose.Types.ObjectId(req.user.id), isActive: true } },
    { $lookup: {
      from: 'subscriptionplans',
      localField: 'plan',
      foreignField: '_id',
      as: 'planDetails'
    } },
    { $unwind: '$planDetails' },
    { $group: { 
      _id: '$plan', 
      name: { $first: '$planDetails.name' },
      count: { $sum: 1 },
      revenue: { $sum: '$paymentDetails.amount' }
    } }
  ]);
  
  // Taux de renouvellement
  const expiredMemberships = await GymMembership.find({
    gym: req.user.id,
    endDate: { $lt: new Date() }
  });
  
  const renewedMemberships = await GymMembership.countDocuments({
    gym: req.user.id,
    endDate: { $lt: new Date() },
    isActive: true
  });
  
  const renewalRate = expiredMemberships.length > 0 
    ? (renewedMemberships / expiredMemberships.length) * 100
    : 0;
  
  res.status(200).json({
    status: 'success',
    data: {
      totalMemberships,
      newMemberships,
      revenueByMonth,
      membershipsByPlan,
      renewalRate
    }
  });
});

// Statistiques pour les terrains de sport
exports.getSportFieldStats = catchAsync(async (req, res, next) => {
  // Total des réservations
  const totalBookings = await Booking.countDocuments({ 
    sportField: req.user.id 
  });
  
  // Réservations par statut
  const bookingsByStatus = await Booking.aggregate([
    { $match: { sportField: mongoose.Types.ObjectId(req.user.id) } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Revenus totaux
  const totalRevenue = await Booking.aggregate([
    { $match: { 
      sportField: mongoose.Types.ObjectId(req.user.id),
      'payment.status': 'completed'
    } },
    { $group: { _id: null, total: { $sum: '$payment.amount' } } }
  ]);
  
  // Réservations par mois
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const bookingsByMonth = await Booking.aggregate([
    { $match: { 
      sportField: mongoose.Types.ObjectId(req.user.id),
      createdAt: { $gte: sixMonthsAgo }
    } },
    { $group: { 
      _id: { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      },
      count: { $sum: 1 },
      revenue: { $sum: '$payment.amount' }
    } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Taux d'occupation
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  
  const weeklyBookings = await Booking.countDocuments({
    sportField: req.user.id,
    date: { $gte: startOfWeek, $lt: endOfWeek }
  });
  
  // Supposons qu'un terrain a en moyenne 12 créneaux disponibles par jour (10h à 22h)
  const totalPossibleSlots = 12 * 7; // 12 créneaux par jour, 7 jours
  const occupancyRate = (weeklyBookings / totalPossibleSlots) * 100;
  
  res.status(200).json({
    status: 'success',
    data: {
      totalBookings,
      bookingsByStatus: bookingsByStatus.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      bookingsByMonth,
      weeklyBookings,
      occupancyRate
    }
  });
});