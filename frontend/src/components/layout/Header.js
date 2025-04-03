// frontend/src/components/layout/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMenu, FiX, FiBell, FiMessageSquare, FiUser, FiLogOut } from 'react-icons/fi';
import NotificationDropdown from '../notifications/NotificationDropdown';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Fermer le menu mobile lorsque la route change
  useEffect(() => {
    setIsOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  // Vérifier les notifications non lues
  useEffect(() => {
    if (isAuthenticated) {
      // Ici, on pourrait faire une requête API pour obtenir les nombres réels
      // Pour l'instant, on utilise des valeurs factices
      setUnreadNotifications(3);
      setUnreadMessages(2);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          FlexMatch
        </Link>

        {/* Menu de navigation mobile */}
        <div className="mobile-nav">
          {isAuthenticated && (
            <div className="mobile-icons">
              <Link to="/notifications" className="icon-link">
                <FiBell size={24} />
                {unreadNotifications > 0 && (
                  <span className="badge">{unreadNotifications}</span>
                )}
              </Link>
              <Link to="/messages" className="icon-link">
                <FiMessageSquare size={24} />
                {unreadMessages > 0 && (
                  <span className="badge">{unreadMessages}</span>
                )}
              </Link>
            </div>
          )}
          <button className="menu-toggle" onClick={toggleMenu}>
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Navigation principale */}
        <nav className={`main-nav ${isOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/coaches" className="nav-link">Coachs</Link>
            </li>
            <li className="nav-item">
              <Link to="/health-specialists" className="nav-link">Spécialistes</Link>
            </li>
            <li className="nav-item">
              <Link to="/gyms" className="nav-link">Salles de sport</Link>
            </li>
            <li className="nav-item">
              <Link to="/sport-fields" className="nav-link">Terrains</Link>
            </li>
            <li className="nav-item">
              <Link to="/posts" className="nav-link">Actualités</Link>
            </li>
          </ul>

          {/* Menu utilisateur */}
          <div className="user-menu">
            {isAuthenticated ? (
              <>
                <div className="desktop-icons">
                  <div className="icon-wrapper">
                    <button className="icon-btn" onClick={toggleNotifications}>
                      <FiBell size={24} />
                      {unreadNotifications > 0 && (
                        <span className="badge">{unreadNotifications}</span>
                      )}
                    </button>
                    {showNotifications && <NotificationDropdown />}
                  </div>
                  <Link to="/messages" className="icon-link">
                    <FiMessageSquare size={24} />
                    {unreadMessages > 0 && (
                      <span className="badge">{unreadMessages}</span>
                    )}
                  </Link>
                </div>
                <div className="user-dropdown">
                  <button className="user-btn">
                    <div className="avatar">
                      {user?.photo ? (
                        <img src={`/img/users/${user.photo}`} alt={`${user.firstName} ${user.lastName}`} />
                      ) : (
                        <div className="avatar-placeholder">{user?.firstName?.charAt(0) || 'U'}</div>
                      )}
                    </div>
                    <span className="username">{user?.firstName || 'Utilisateur'}</span>
                  </button>
                  <div className="dropdown-menu">
                    <Link to="/dashboard" className="dropdown-item">
                      <FiUser /> Tableau de bord
                    </Link>
                    <Link to="/profile" className="dropdown-item">
                      <FiUser /> Mon profil
                    </Link>
                    <Link to="/bookings" className="dropdown-item">
                      <FiUser /> Mes réservations
                    </Link>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <FiLogOut /> Déconnexion
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">Se connecter</Link>
                <Link to="/signup" className="btn btn-primary">S'inscrire</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;