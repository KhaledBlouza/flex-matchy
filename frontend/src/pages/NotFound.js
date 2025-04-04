// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="container">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Page non trouvée</h2>
          <p>Désolé, la page que vous recherchez n'existe pas ou a été déplacée.</p>
          <Link to="/" className="btn btn-primary">
            <FiHome /> Retour à l'accueil
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .not-found {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 200px);
          padding: 50px 0;
          text-align: center;
        }
        
        .not-found-content h1 {
          font-size: 6rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 10px;
        }
        
        .not-found-content h2 {
          font-size: 2rem;
          color: var(--dark-color);
          margin-bottom: 20px;
        }
        
        .not-found-content p {
          font-size: 1.1rem;
          color: var(--dark-gray-color);
          margin-bottom: 30px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .not-found-content .btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
      `}</style>
    </div>
  );
};

export default NotFound;