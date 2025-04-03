// frontend/src/components/notifications/NotificationDropdown.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import api from '../../services/api';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/v1/notifications');
        setNotifications(response.data.data.notifications.slice(0, 5)); // Limiter à 5 notifications
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/v1/notifications/${id}/read`);
      // Mettre à jour l'état local
      setNotifications(
        notifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  };

  const renderNotificationContent = (notification) => {
    let link = '#';

    // Définir le lien en fonction du type de notification
    switch (notification.type) {
      case 'bookingConfirmed':
      case 'bookingCancelled':
        link = `/bookings/${notification.relatedTo.id}`;
        break;
      case 'newMessage':
        link = `/messages/${notification.relatedTo.id}`;
        break;
      case 'newReview':
        link = `/reviews/${notification.relatedTo.id}`;
        break;
      case 'paymentReceived':
        link = `/bookings/${notification.relatedTo.id}`;
        break;
      default:
        link = '/notifications';
    }

    return (
      <Link
        to={link}
        className="notification-link"
        onClick={() => markAsRead(notification._id)}
      >
        {notification.content}
      </Link>
    );
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notifications</h3>
      </div>
      <div className="notification-body">
        {loading ? (
          <p className="loading-text">Chargement...</p>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              {renderNotificationContent(notification)}
              <span className="notification-time">
                {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))
        ) : (
          <p className="empty-text">Pas de notifications</p>
        )}
      </div>
      <div className="notification-footer">
        <Link to="/notifications" className="view-all">
          Voir toutes les notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;