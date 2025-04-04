// src/pages/services/ServiceDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  FiStar, 
  FiMapPin, 
  FiClock, 
  FiDollarSign, 
  FiCalendar,
  FiUser,
  FiEdit,
  FiMessageSquare
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import './ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // Récupérer les détails du service
  const { data: service, isLoading, isError, error } = useQuery(
    ['service', id],
    async () => {
      // Pour l'exemple, on utilise des données simulées
      // Dans une implémentation réelle, on ferait un appel API
      // const response = await api.get(`/api/v1/services/${id}`);
      // return response.data.data.service;
      
      return {
        _id: id,
        title: 'Coaching sportif personnalisé',
        description: 'Programme adapté à vos objectifs et votre niveau actuel. Suivi personnalisé et ajustements réguliers. Le coaching comprend une évaluation initiale, un plan d\'entraînement sur mesure, et un suivi nutritionnel de base. Idéal pour les personnes souhaitant améliorer leur condition physique, perdre du poids ou se préparer à une compétition.',
        category: 'coaching',
        price: 50,
        duration: 60,
        provider: {
          _id: 'coach1',
          firstName: 'Ahmed',
          lastName: 'Ben Ali',
          photo: null,
          role: 'coach',
          rating: 4.8,
          reviewCount: 24,
          bio: 'Coach sportif certifié avec plus de 10 ans d\'expérience. Spécialisé dans la préparation physique et la perte de poids.',
          specialties: ['Musculation', 'Fitness', 'Cross Training']
        },
        location: 'Tunis Centre',
        address: '12 Avenue Habib Bourguiba, Tunis',
        availabilities: [
          {
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Demain
            slots: ['09:00', '11:00', '14:00', '16:00', '18:00']
          },
          {
            date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Après-demain
            slots: ['10:00', '13:00', '15:00', '17:00']
          },
          {
            date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // Dans 3 jours
            slots: ['09:00', '10:00', '12:00', '16:00', '17:00']
          }
        ],
        reviews: [
          {
            _id: 'r1',
            user: {
              firstName: 'Mouna',
              lastName: 'Belkadhi',
              photo: null
            },
            rating: 5,
            comment: 'Excellent coach! Ahmed a su adapter le programme à mes besoins spécifiques. Je vois déjà des résultats après seulement un mois.',
            date: '2023-05-15'
          },
          {
            _id: 'r2',
            user: {
              firstName: 'Selim',
              lastName: 'Chatti',
              photo: null
            },
            rating: 4,
            comment: 'Très professionnel et motivant. Les séances sont intenses mais efficaces.',
            date: '2023-04-22'
          }
        ],
        benefits: [
          'Programme personnalisé selon vos objectifs',
          'Suivi et ajustements réguliers',
          'Conseils nutritionnels',
          'Accès à du matériel spécialisé',
          'Flexibilité des horaires'
        ]
      };
    },
    {
      onSuccess: (data) => {
        // Si des disponibilités existent, sélectionner la première date par défaut
        if (data.availabilities && data.availabilities.length > 0) {
          setSelectedDate(data.availabilities[0].date);
        }
      }
    }
  );
  
  // Obtenir les créneaux horaires disponibles pour la date sélectionnée
  const getAvailableSlots = () => {
    if (!service || !selectedDate) return [];
    
    const dateObj = service.availabilities.find(a => a.date === selectedDate);
    return dateObj ? dateObj.slots : [];
  };
  
  // Formater la date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Obtenir une date lisible
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Vérifier si l'utilisateur est le propriétaire du service
  const isProvider = service && user && service.provider._id === user._id;
  
  // Gérer la sélection d'un créneau
  const handleTimeSelection = (time) => {
    setSelectedTime(time);
  };
  
  // Gérer la réservation
  const handleBooking = () => {
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour réserver');
      return;
    }
    
    if (!selectedDate || !selectedTime) {
      alert('Veuillez sélectionner une date et un horaire');
      return;
    }
    
    // Rediriger vers la page de confirmation avec les détails
    window.location.href = `/bookings/confirm?service=${id}&date=${selectedDate}&time=${selectedTime}`;
  };
  
  if (isLoading) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <div className="loader-container">
            <Loader size="large" text="Chargement du service..." />
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <Alert type="danger">
            Une erreur est survenue lors du chargement des détails du service: {error.message}
          </Alert>
        </div>
      </div>
    );
  }
  
  return (
    <div className="service-detail-page">
      <div className="container">
        <div className="service-detail-container">
          {/* Section principale */}
          <div className="service-detail-main">
            <div className="service-header">
              <h1 className="service-title">{service.title}</h1>
              
              {isProvider && (
                <div className="service-actions">
                  <Button
                    variant="outline-primary"
                    as={Link}
                    to={`/services/edit/${service._id}`}
                  >
                    <FiEdit /> Modifier
                  </Button>
                </div>
              )}
            </div>
            
            <div className="service-meta">
              <div className="service-category">
                <Badge type="primary">
                  {service.category === 'coaching' ? 'Coaching sportif' :
                   service.category === 'nutrition' ? 'Nutrition' :
                   service.category === 'physio' ? 'Physiothérapie' :
                   service.category === 'yoga' ? 'Yoga' : 
                   service.category === 'fitness' ? 'Fitness' : 'Sport'}
                </Badge>
              </div>
              
              <div className="service-rating">
                <FiStar className="star-icon" />
                <span>{service.provider.rating} ({service.provider.reviewCount} avis)</span>
              </div>
              
              <div className="service-location">
                <FiMapPin />
                <span>{service.location}</span>
              </div>
              
              <div className="service-duration">
                <FiClock />
                <span>{service.duration} minutes</span>
              </div>
              
              <div className="service-price">
                <FiDollarSign />
                <span>{service.price} TND</span>
              </div>
            </div>
            
            <Card className="service-description-card">
              <h2>Description</h2>
              <p>{service.description}</p>
              
              {service.benefits && service.benefits.length > 0 && (
                <div className="service-benefits">
                  <h3>Ce que comprend ce service</h3>
                  <ul>
                    {service.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
            
            <Card className="service-provider-card">
              <h2>À propos du prestataire</h2>
              
              <div className="provider-profile">
                <div className="provider-avatar">
                  {service.provider.photo ? (
                    <img 
                      src={`/img/users/${service.provider.photo}`} 
                      alt={`${service.provider.firstName} ${service.provider.lastName}`}
                    />
                  ) : (
                    <span>{service.provider.firstName.charAt(0)}</span>
                  )}
                </div>
                
                <div className="provider-info">
                  <h3>
                    {service.provider.firstName} {service.provider.lastName}
                  </h3>
                  
                  <div className="provider-role">
                    {service.provider.role === 'coach' ? 'Coach sportif' :
                     service.provider.role === 'healthSpecialist' ? 'Spécialiste de santé' :
                     service.provider.role === 'gymOwner' ? 'Propriétaire de salle' : 'Professionnel'}
                  </div>
                  
                  <div className="provider-rating">
                    <FiStar className="star-icon" />
                    <span>{service.provider.rating} ({service.provider.reviewCount} avis)</span>
                  </div>
                  
                  <div className="provider-specialties">
                    {service.provider.specialties && service.provider.specialties.map((specialty, index) => (
                      <Badge key={index} type="secondary" className="specialty-badge">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {service.provider.bio && (
                <div className="provider-bio">
                  <p>{service.provider.bio}</p>
                </div>
              )}
              
              <div className="provider-actions">
                <Button
                  variant="outline-primary"
                  as={Link}
                  to={`/user/${service.provider._id}`}
                >
                  <FiUser /> Voir le profil
                </Button>
                
                <Button
                  variant="outline-secondary"
                  as={Link}
                  to={`/messages/${service.provider._id}`}
                >
                  <FiMessageSquare /> Contacter
                </Button>
              </div>
            </Card>
            
            {service.reviews && service.reviews.length > 0 && (
              <Card className="service-reviews-card">
                <h2>Avis des clients</h2>
                
                <div className="reviews-list">
                  {service.reviews.map((review) => (
                    <div key={review._id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.user.photo ? (
                              <img 
                                src={`/img/users/${review.user.photo}`} 
                                alt={`${review.user.firstName} ${review.user.lastName}`}
                              />
                            ) : (
                              <span>{review.user.firstName.charAt(0)}</span>
                            )}
                          </div>
                          
                          <div>
                            <div className="reviewer-name">
                              {review.user.firstName} {review.user.lastName}
                            </div>
                            <div className="review-date">
                              {new Date(review.date).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <FiStar 
                              key={i}
                              className={i < review.rating ? 'star-filled' : 'star-empty'} 
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="review-content">
                        <p>{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="reviews-footer">
                  <Button
                    variant="outline-primary"
                    as={Link}
                    to={`/reviews/${service._id}`}
                  >
                    Voir tous les avis
                  </Button>
                </div>
              </Card>
            )}
          </div>
          
          {/* Sidebar de réservation */}
          {!isProvider && (
            <div className="service-detail-sidebar">
              <Card className="booking-card">
                <h2>Réserver ce service</h2>
                
                <div className="booking-price">
                  <span className="price-amount">{service.price} TND</span>
                  <span className="price-duration">/ {service.duration} min</span>
                </div>
                
                <div className="booking-dates">
                  <h3>
                    <FiCalendar /> Choisir une date
                  </h3>
                  
                  <div className="date-picker">
                    {service.availabilities.map((availability) => (
                      <button
                        key={availability.date}
                        className={`date-option ${selectedDate === availability.date ? 'active' : ''}`}
                        onClick={() => setSelectedDate(availability.date)}
                      >
                        <div className="date-day">
                          {new Date(availability.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </div>
                        <div className="date-number">
                          {new Date(availability.date).getDate()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="booking-times">
                  <h3>
                    <FiClock /> Choisir un horaire
                  </h3>
                  
                  <div className="time-picker">
                    {getAvailableSlots().length > 0 ? (
                      getAvailableSlots().map((slot) => (
                        <button
                          key={slot}
                          className={`time-option ${selectedTime === slot ? 'active' : ''}`}
                          onClick={() => handleTimeSelection(slot)}
                        >
                          {slot}
                        </button>
                      ))
                    ) : (
                      <p className="no-slots">Aucun créneau disponible pour cette date.</p>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime}
                >
                  Réserver maintenant
                </Button>
                
                {!isAuthenticated && (
                  <div className="login-prompt">
                    <p>Veuillez <Link to="/login">vous connecter</Link> pour réserver ce service</p>
                  </div>
                )}
              </Card>
              
              <Card className="location-card">
                <h3>Lieu</h3>
                <p>{service.address}</p>
                <div className="map-placeholder">
                  <img 
                    src="/img/map-placeholder.jpg" 
                    alt="Map" 
                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                  />
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;