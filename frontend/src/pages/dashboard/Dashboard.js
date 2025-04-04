// src/pages/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHome, 
  FiCalendar, 
  FiDollarSign, 
  FiMessageSquare, 
  FiUser, 
  FiFileText,
  FiSettings,
  FiCreditCard,
  FiPlus,
  FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Charger les données du tableau de bord
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Simuler les données pour l'exemple
        setTimeout(() => {
          setStats({
            totalBookings: 12,
            pendingBookings: 3,
            totalRevenue: 540,
            unreadMessages: 2
          });
          
          setBookings([
            {
              _id: '1',
              date: new Date('2023-06-15T10:00:00'),
              service: 'Séance de coaching',
              provider: {
                _id: 'coach1',
                firstName: 'Ahmed',
                lastName: 'Ben Ali'
              },
              status: 'confirmed',
              price: 60
            },
            {
              _id: '2',
              date: new Date('2023-06-18T14:30:00'),
              service: 'Consultation nutritionnelle',
              provider: {
                _id: 'nutritionist1',
                firstName: 'Sonia',
                lastName: 'Gharbi'
              },
              status: 'pending',
              price: 45
            },
            {
              _id: '3',
              date: new Date('2023-06-10T09:00:00'),
              service: 'Séance de physiothérapie',
              provider: {
                _id: 'physio1',
                firstName: 'Karim',
                lastName: 'Mrad'
              },
              status: 'completed',
              price: 70
            }
          ]);
          
          setNotifications([
            {
              _id: 'notif1',
              title: 'Réservation confirmée',
              content: 'Votre séance avec Ahmed Ben Ali a été confirmée.',
              createdAt: new Date('2023-06-12T15:30:00'),
              read: false
            },
            {
              _id: 'notif2',
              title: 'Nouveau message',
              content: 'Vous avez reçu un nouveau message de Sonia Gharbi.',
              createdAt: new Date('2023-06-11T10:15:00'),
              read: false
            },
            {
              _id: 'notif3',
              title: 'Rappel de rendez-vous',
              content: 'Rappel: Votre rendez-vous avec Karim Mrad est demain à 09:00.',
              createdAt: new Date('2023-06-09T14:00:00'),
              read: true
            }
          ]);
          
          setLoading(false);
        }, 1000);
        
        // Remplacer par des appels API réels
        // const [statsResponse, bookingsResponse, notificationsResponse] = await Promise.all([
        //   api.get('/api/v1/stats'),
        //   api.get('/api/v1/bookings/upcoming'),
        //   api.get('/api/v1/notifications/recent')
        // ]);
        
        // setStats(statsResponse.data.data);
        // setBookings(bookingsResponse.data.data.bookings);
        // setNotifications(notificationsResponse.data.data.notifications);
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Formater la date
  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'short' };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };
  
  // Formater l'heure
  const formatTime = (date) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleTimeString('fr-FR', options);
  };
  
  // Obtenir le badge de statut pour les réservations
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
  
  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="user-avatar">
              {user?.photo ? (
                <img 
                  src={`/img/users/${user.photo}`} 
                  alt={`${user.firstName} ${user.lastName}`} 
                />
              ) : (
                <div className="avatar-placeholder">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="user-info">
              <h3>{user?.firstName} {user?.lastName}</h3>
              <div className="user-role">
                {user?.role === 'client' && 'Client'}
                {user?.role === 'coach' && 'Coach sportif'}
                {user?.role === 'healthSpecialist' && 'Spécialiste de santé'}
                {user?.role === 'gymOwner' && 'Propriétaire de salle'}
                {user?.role === 'sportFieldOwner' && 'Propriétaire de terrain'}
              </div>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li>
                <button 
                  className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <FiHome />
                  Aperçu
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  <FiCalendar />
                  Réservations
                  {stats?.pendingBookings > 0 && (
                    <span className="badge">{stats.pendingBookings}</span>
                  )}
                </button>
              </li>
              {(user?.role === 'coach' || user?.role === 'healthSpecialist' || user?.role === 'gymOwner') && (
                <li>
                  <button 
                    className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
                    onClick={() => setActiveTab('services')}
                  >
                    <FiFileText />
                    Services
                  </button>
                </li>
              )}
              <li>
                <button 
                  className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                  onClick={() => setActiveTab('messages')}
                >
                  <FiMessageSquare />
                  Messages
                  {stats?.unreadMessages > 0 && (
                    <span className="badge">{stats.unreadMessages}</span>
                  )}
                </button>
              </li>
              {(user?.role === 'coach' || user?.role === 'healthSpecialist' || user?.role === 'gymOwner') && (
                <li>
                  <button 
                    className={`nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('earnings')}
                  >
                    <FiDollarSign />
                    Revenus
                  </button>
                </li>
              )}
              <li>
                <button 
                  className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <FiUser />
                  Profil
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`}
                  onClick={() => setActiveTab('subscription')}
                >
                  <FiCreditCard />
                  Abonnement
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <FiSettings />
                  Paramètres
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Contenu principal */}
        <div className="dashboard-content">
          {loading ? (
            <div className="loading-container">
              <Loader size="large" text="Chargement du tableau de bord..." />
            </div>
          ) : (
            <>
              {/* Aperçu */}
              {activeTab === 'overview' && (
                <>
                  <h1 className="dashboard-title">Tableau de bord</h1>
                  
                  {/* Cartes d'information */}
                  <div className="info-cards">
                    <Card className="info-card">
                      <div className="info-card-icon">
                        <FiCalendar />
                      </div>
                      <div className="info-card-content">
                        <h3>Réservations</h3>
                        <div className="info-card-value">{stats.totalBookings}</div>
                      </div>
                    </Card>
                    
                    <Card className="info-card">
                      <div className="info-card-icon">
                        <FiMessageSquare />
                      </div>
                      <div className="info-card-content">
                        <h3>Messages non lus</h3>
                        <div className="info-card-value">{stats.unreadMessages}</div>
                      </div>
                    </Card>
                    
                    {(user?.role === 'coach' || user?.role === 'healthSpecialist' || user?.role === 'gymOwner') && (
                      <Card className="info-card">
                        <div className="info-card-icon">
                          <FiDollarSign />
                        </div>
                        <div className="info-card-content">
                          <h3>Revenus</h3>
                          <div className="info-card-value">{stats.totalRevenue} TND</div>
                        </div>
                      </Card>
                    )}
                  </div>
                  
                  {/* Réservations à venir */}
                  <Card className="upcoming-bookings-card">
                    <div className="card-header">
                      <h2>Réservations à venir</h2>
                      <Link to="/bookings" className="view-all">
                        Voir tout <FiChevronRight />
                      </Link>
                    </div>
                    
                    {bookings.length > 0 ? (
                      <div className="bookings-list">
                        {bookings.map((booking) => (
                          <div key={booking._id} className="booking-item">
                            <div className="booking-date">
                              <div className="date-day">
                                {new Date(booking.date).getDate()}
                              </div>
                              <div className="date-month">
                                {new Date(booking.date).toLocaleString('fr-FR', { month: 'short' })}
                              </div>
                            </div>
                            
                            <div className="booking-details">
                              <h3>{booking.service}</h3>
                              <div className="booking-time">
                                {formatTime(booking.date)}
                              </div>
                              <div className="booking-service">
                                {user?.role === 'client' 
                                  ? `Avec: ${booking.provider.firstName} ${booking.provider.lastName}`
                                  : `Client: Nom du client`
                                }
                              </div>
                              <div className={`booking-status status-${booking.status}`}>
                                {getStatusBadge(booking.status)}
                              </div>
                            </div>
                            
                            <Link to={`/bookings/${booking._id}`} className="booking-link">
                              <FiChevronRight />
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>Vous n'avez aucune réservation à venir.</p>
                        {user?.role === 'client' && (
                          <div className="action-buttons">
                            <Button 
                              variant="primary"
                              size="medium"
                              as={Link}
                              to="/coaches"
                            >
                              Trouver un coach
                            </Button>
                            <Button 
                              variant="outline-primary"
                              size="medium"
                              as={Link}
                              to="/health-specialists"
                            >
                              Consulter un spécialiste
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                  
                  {/* Notifications récentes */}
                  <Card className="notifications-card">
                    <div className="card-header">
                      <h2>Notifications récentes</h2>
                      <Link to="/notifications" className="view-all">
                        Voir tout <FiChevronRight />
                      </Link>
                    </div>
                    
                    {notifications.length > 0 ? (
                      <div className="notifications-list">
                        {notifications.map((notification) => (
                          <div 
                            key={notification._id} 
                            className={`notification-item ${notification.read ? '' : 'unread'}`}
                          >
                            <div className="notification-content">
                              <h3>{notification.title}</h3>
                              <p>{notification.content}</p>
                            </div>
                            <div className="notification-time">
                              {formatDate(notification.createdAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>Vous n'avez aucune notification récente.</p>
                      </div>
                    )}
                  </Card>
                </>
              )}
              
              {/* Autres onglets */}
              {activeTab === 'bookings' && (
                <div>
                  <h1 className="dashboard-title">Mes réservations</h1>
                  <p>Cette section est en construction. Veuillez consulter la page Réservations pour voir toutes vos réservations.</p>
                  <div className="action-buttons">
                    <Button 
                      variant="primary"
                      size="medium"
                      as={Link}
                      to="/bookings"
                    >
                      Voir toutes mes réservations
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'services' && (
                <div>
                  <h1 className="dashboard-title">Mes services</h1>
                  <p>Cette section est en construction. Veuillez consulter la page Services pour gérer vos services.</p>
                  <div className="action-buttons">
                    <Button 
                      variant="primary"
                      size="medium"
                      as={Link}
                      to="/services"
                    >
                      Gérer mes services
                    </Button>
                    <Button 
                      variant="success"
                      size="medium"
                      as={Link}
                      to="/services/create"
                    >
                      <FiPlus /> Ajouter un service
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Ajouter d'autres contenus d'onglet selon les besoins */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;