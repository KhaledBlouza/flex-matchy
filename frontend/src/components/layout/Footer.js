// frontend/src/components/layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">FlexMatch</h3>
            <p className="footer-description">
              Connectez-vous avec des professionnels du sport et du bien-être. Réservez des cours, des consultations et des terrains en quelques clics.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/coaches">Coachs</Link></li>
              <li><Link to="/health-specialists">Spécialistes de santé</Link></li>
              <li><Link to="/gyms">Salles de sport</Link></li>
              <li><Link to="/sport-fields">Terrains</Link></li>
              <li><Link to="/posts">Actualités</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Ressources</h4>
            <ul className="footer-links">
              <li><Link to="/about">À propos</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/conditions">Conditions d'utilisation</Link></li>
              <li><Link to="/privacy">Politique de confidentialité</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Contact</h4>
            <p>Email: contact@flexmatch.tn</p>
            <p>Téléphone: +216 XX XXX XXX</p>
            <p>Adresse: Tunis, Tunisie</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FlexMatch. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;