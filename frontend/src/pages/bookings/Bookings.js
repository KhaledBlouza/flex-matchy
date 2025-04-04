// src/pages/bookings/Bookings.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, 
  FiChevronRight, 
  FiFilter, 
  FiUser, 
  FiMapPin, 
  FiClock
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import './Bookings.css';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('upcoming');
  
  // Options pour le filtre de statut
  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmé' },
    { value: 'completed', label: 'Terminé' },
    { value: 'cancelled', label: 'Annulé' }
  ];
  
  // Options pour le tri
  const sortOptions = [
    { value: 'upcoming', label: 'Prochaines réservations' },
    { value: 'past', label: 'Réservations passées' },
    { value: 'newest', label: 'Plus récentes' },
    { value: 'oldest', label: 'Plus anciennes' }
  ];
  
  // Récupérer les réservations
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      
      try {
        // Dans un cas réel, on ferait un appel API
        // const response = await api.get('/api/v1/bookings');
        // setBookings(response.data.data.bookings);
        
        // Données simulées pour l'exemple
        setTimeout(() => {
          const mockBookings = [
            {
              _id: 'b1',
              service: {
                _id: 's1',
                title: 'Coaching sportif personnalisé',
                price: 50,
                duration: 60
              },
              provider: {
                _id: 'coach1',
                firstName: 'Ahmed',
                lastName: 'Ben Ali',
                photo: null
              },
              client: {
                _id: 'client1',
                firstName: 'Sami',
                lastName: 'Mekki',
                photo: null
              },
              date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
              time: '10:00',
              location: 'Tunis Centre',
              status: 'confirmed',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
              totalPrice: 50
            },
            {
              _id: 'b2',
              service: {
                _id: 's2',
                title: 'Consultation nutritionnelle',
                price: 45,
                duration: 45
              },
              provider: {
                _id: 'nutritionist1',
                firstName: 'Sonia',
                lastName: 'Gharbi',
                photo: null
              },
              client: {
                _id: 'client1',
                firstName: 'Sami',
                lastName: 'Mekki',
                photo: null
              },
              date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
              time: '14:30',
              location: 'La Marsa',
              status: 'pending',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hier
              totalPrice: 45
            },
            {
              _id: 'b3',
              service: {
                _id: 's3',
                title: 'Séance de physiothérapie',
                price: 60,
                duration: 50
              },
              provider: {
                _id: 'physio1',
                firstName: 'Karim',
                lastName: 'Mrad',
                photo: null
              },
              client: {
                _id: 'client1',
                firstName: 'Sami',
                lastName: 'Mekki',
                photo: null
              },
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
              time: '09:00',
              location: 'Lac 2',
              status: 'completed',
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Il y a 10 jours
              totalPrice: 60
            },
            {
              _id: 'b4',
              service: {
                _id: 's4',
                title: 'Cours de yoga débutant',
                price: 35,
                duration: 75
              },
              provider: {
                _id: 'yoga1',
                firstName: 'Yasmine',
                lastName: 'Jouini',
                photo: null
              },
              client: {
                _id: 'client1',
                firstName: 'Sami',
                lastName: 'Mekki',
                photo: null
              },
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
              time: '18:00',
              location: 'Les Berges du Lac',
              status: 'cancelled',
              createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Il y a 4 jours
              totalPrice: 35
            }
          ];
          
          setBookings(mockBookings);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Erreur lors du chargement des réservations:', err);
        setError('Une erreur est survenue lors du chargement des réservations');
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user]);
  
  // Filtrer les réservations selon le statut
  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });
  
  // Trier les réservations
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = new Date(`${a.date.toISOString().split('T')[0]}T${a.time}`);
    const dateB = new Date(`${b.date.toISOString().split('T')[0]}T${b.time}`);
    
    switch (sortOrder) {
      case 'upcoming':
        return dateA - dateB;
      case 'past':
        return dateB - dateA;
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      default:
        return dateA - dateB;
    }
  });
  
  // Formater la date
  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };
  
  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge type="warning">En attente</Badge>;
      case 'confirmed':
        return <Badge type="success">Confirmé</Badge>;
      case 'completed':
        return <Badge type="primary">Terminé</Badge>;
      case 'cancelled':
        return <Badge type="danger">Annulé</Badge>;
      default:
        return null;
    }
  };
  
  // Vérifier si une date est passée
  const isPastDate = (date) => {
    return new Date(date) < new Date();
  };
  
  // Déterminer le type d'utilisateur (client ou prestataire)
  const isClient = user?.role === 'client';
  
  return (
    <div className="bookings-page">
      <div className="container">
        <h1 className="page-title">Mes réservations</h1>
        
        <div className="filters-sort">
          <div className="filter-container">
            <div className="filter-icon">
              <FiFilter />
            </div>
            <Select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
          
          <div className="sort-container">
            <label htmlFor="sortOrder">Trier par:</label>
            <Select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              options={sortOptions}
            />
          </div>
        </div>
        
        {error && (
          <Alert type="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        {loading ? (
          <div className="loader-container">
            <Loader size="large" text="Chargement des réservations..." />
          </div>
        ) : sortedBookings.length > 0 ? (
          <div className="bookings-list">
            {sortedBookings.map((booking) => (
              <Card key={booking._id} className="booking-card">
                <div className="booking-date">
                  <div className="date-box">
                    <div className="date-day">
                      {new Date(booking.date).getDate()}
                    </div>
                    <div className="date-month">
                      {new Date(booking.date).toLocaleString('fr-FR', { month: 'short' })}
                    </div>
                  </div>
                  <div className="date-time">
                    {booking.time}
                  </div>
                  <div className="date-full">
                    {formatDate(booking.date)}
                  </div>
                </div>
                
                <div className="booking-content">
                  <div className="booking-header">
                    <h3 className="booking-title">{booking.service.title}</h3>
                    <div className="booking-status">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="booking-detail">
                      <FiUser />
                      <span>{isClient 
                        ? `Avec: ${booking.provider.firstName} ${booking.provider.lastName}`
                        : `Client: ${booking.client.firstName} ${booking.client.lastName}`
                      }</span>
                    </div>
                    
                    <div className="booking-detail">
                      <FiMapPin />
                      <span>{booking.location}</span>
                    </div>
                    
                    <div className="booking-detail">
                      <FiClock />
                      <span>{booking.service.duration} minutes</span>
                    </div>
                  </div>
                  
                  <div className="booking-footer">
                    <div className="booking-price">
                      {booking.totalPrice} TND
                    </div>
                    
                    <div className="booking-actions">
                      <Button
                        variant="primary"
                        size="small"
                        as={Link}
                        to={`/bookings/${booking._id}`}
                      >
                        Détails <FiChevronRight />
                      </Button>
                      
                      {booking.status === 'pending' && (
                        <Button
                          variant="outline-danger"
                          size="small"
                        >
                          Annuler
                        </Button>
                      )}
                      
                      {booking.status === 'confirmed' && !isPastDate(booking.date) && (
                        <Button
                          variant="outline-danger"
                          size="small"
                        >
                          Annuler
                        </Button>
                      )}
                      
                      {booking.status === 'confirmed' && !isClient && (
                        <Button
                          variant="success"
                          size="small"
                        >
                          Marquer comme terminé
                        </Button>
                      )}
                      
                      {booking.status === 'completed' && isClient && !booking.reviewed && (
                        <Button
                          variant="outline-primary"
                          size="small"
                          as={Link}
                          to={`/reviews/add/${booking._id}`}
                        >
                          Laisser un avis
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="no-bookings">
            <div className="no-bookings-icon">
              <FiCalendar />
            </div>
            <h2>Aucune réservation trouvée</h2>
            <p>Vous n'avez pas encore de réservation {statusFilter !== 'all' ? `avec le statut "${statusOptions.find(o => o.value === statusFilter)?.label}"` : ''}.</p>
            
            {isClient && (
              <div className="no-bookings-actions">
                <Button
                  variant="primary"
                  as={Link}
                  to="/coaches"
                >
                  Trouver un coach
                </Button>
                <Button
                  variant="outline-primary"
                  as={Link}
                  to="/health-specialists"
                >
                  Consulter un spécialiste
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;