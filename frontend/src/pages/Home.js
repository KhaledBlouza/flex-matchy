// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiUser, FiMapPin, FiCalendar } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="home-page">
      {/* Section Héro */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Trouvez votre coach sportif ou spécialiste de santé</h1>
            <p>FlexMatch vous connecte avec des professionnels du sport et de la santé pour atteindre vos objectifs</p>
            <div className="hero-buttons">
              <Link to="/coaches" className="btn btn-primary btn-large">Trouver un coach</Link>
              <Link to="/health-specialists" className="btn btn-outline-primary btn-large">Consulter un spécialiste</Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section Services */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Nos services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <FiUser />
              </div>
              <h3>Coachs sportifs</h3>
              <p>Trouvez un coach personnel qualifié pour vous accompagner dans vos objectifs sportifs</p>
              <Link to="/coaches" className="service-link">Découvrir</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FiActivity />
              </div>
              <h3>Spécialistes de santé</h3>
              <p>Consultez des nutritionnistes, physiothérapeutes et autres spécialistes</p>
              <Link to="/health-specialists" className="service-link">Découvrir</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FiMapPin />
              </div>
              <h3>Salles et terrains</h3>
              <p>Accédez à des salles de sport et terrains près de chez vous</p>
              <Link to="/gyms" className="service-link">Découvrir</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FiCalendar />
              </div>
              <h3>Réservations faciles</h3>
              <p>Planifiez et gérez vos séances en quelques clics</p>
              <Link to="/signup" className="service-link">S'inscrire</Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section Comment ça marche */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Comment ça marche</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Créez votre compte</h3>
              <p>Inscrivez-vous gratuitement et complétez votre profil</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Trouvez un professionnel</h3>
              <p>Recherchez et filtrez selon vos besoins et préférences</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Réservez une séance</h3>
              <p>Choisissez une date et payez en ligne en toute sécurité</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>Profitez et progressez</h3>
              <p>Atteignez vos objectifs avec l'aide d'un professionnel</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à commencer votre parcours?</h2>
            <p>Rejoignez des milliers de clients satisfaits qui transforment leur vie</p>
            <Link to="/signup" className="btn btn-primary btn-large">S'inscrire maintenant</Link>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .hero {
          background-color: #f8f9fa;
          padding: 80px 0;
          text-align: center;
        }
        
        .hero-content h1 {
          font-size: 2.5rem;
          margin-bottom: 20px;
          color: var(--dark-color);
        }
        
        .hero-content p {
          font-size: 1.2rem;
          margin-bottom: 30px;
          color: var(--dark-gray-color);
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .hero-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }
        
        .section-title {
          text-align: center;
          margin-bottom: 50px;
          font-size: 2rem;
          color: var(--dark-color);
        }
        
        .services-section {
          padding: 80px 0;
        }
        
        .services-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }
        
        .service-card {
          background-color: var(--white-color);
          border-radius: var(--border-radius);
          padding: 30px;
          box-shadow: var(--box-shadow);
          text-align: center;
          transition: var(--transition);
        }
        
        .service-card:hover {
          transform: translateY(-10px);
        }
        
        .service-icon {
          width: 70px;
          height: 70px;
          background-color: #e1f0ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 30px;
          color: var(--primary-color);
        }
        
        .service-card h3 {
          margin-bottom: 15px;
          color: var(--dark-color);
        }
        
        .service-card p {
          margin-bottom: 20px;
          color: var(--dark-gray-color);
        }
        
        .service-link {
          color: var(--primary-color);
          font-weight: 500;
          text-decoration: none;
          transition: var(--transition);
        }
        
        .service-link:hover {
          text-decoration: underline;
        }
        
        .how-it-works {
          background-color: #f8f9fa;
          padding: 80px 0;
        }
        
        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }
        
        .step {
          text-align: center;
        }
        
        .step-number {
          width: 50px;
          height: 50px;
          background-color: var(--primary-color);
          color: var(--white-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 24px;
          font-weight: bold;
        }
        
        .step h3 {
          margin-bottom: 15px;
          color: var(--dark-color);
        }
        
        .step p {
          color: var(--dark-gray-color);
        }
        
        .cta-section {
          padding: 80px 0;
          background-color: var(--primary-color);
          color: var(--white-color);
          text-align: center;
        }
        
        .cta-content h2 {
          font-size: 2rem;
          margin-bottom: 20px;
        }
        
        .cta-content p {
          font-size: 1.2rem;
          margin-bottom: 30px;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        
        @media (max-width: 992px) {
          .services-grid, .steps {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 576px) {
          .services-grid, .steps {
            grid-template-columns: 1fr;
          }
          
          .hero-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;