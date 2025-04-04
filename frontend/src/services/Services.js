// src/pages/services/Services.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  FiFilter, 
  FiStar, 
  FiMapPin, 
  FiDollarSign, 
  FiClock,
  FiPlus
} from 'react-icons/fi';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import './Services.css';

const Services = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({
    category: '',
    minRating: '',
    maxPrice: '',
    location: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('rating-desc');

  // Options pour le tri
  const sortOptions = [
    { value: 'rating-desc', label: 'Meilleurs avis' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'newest', label: 'Plus récents' }
  ];
  
  // Options pour les catégories
  const categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'coaching', label: 'Coaching sportif' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'physio', label: 'Physiothérapie' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'sport', label: 'Sport' }
  ];

  // Récupérer les paramètres d'URL lors du chargement
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    setFilters({
      category: params.get('category') || '',
      minRating: params.get('minRating') || '',
      maxPrice: params.get('maxPrice') || '',
      location: params.get('location') || '',
      search: params.get('search') || ''
    });
    
    setSortOption(params.get('sort') || 'rating-desc');
  }, [location.search]);

  // Simuler une requête pour récupérer les services
  const { data, isLoading, isError, error } = useQuery(
    ['services', filters, sortOption],
    async () => {
      // Simuler les données
      return [
        {
          _id: 's1',
          title: 'Coaching sportif personnalisé',
          description: 'Programme adapté à vos objectifs et votre niveau actuel. Suivi personnalisé et ajustements réguliers.',
          category: 'coaching',
          price: 50,
          duration: 60,
          provider: {
            _id: 'coach1',
            firstName: 'Ahmed',
            lastName: 'Ben Ali',
            photo: null,
            rating: 4.8,
            reviewCount: 24
          },
          location: 'Tunis Centre'
        },
        {
          _id: 's2',
          title: 'Consultation nutritionnelle',
          description: "Analyse de vos habitudes alimentaires et création d'un plan nutritionnel adapté à vos besoins.",
          category: 'nutrition',
          price: 45,
          duration: 45,
          provider: {
            _id: 'nutritionist1',
            firstName: 'Sonia',
            lastName: 'Gharbi',
            photo: null,
            rating: 4.9,
            reviewCount: 31
          },
          location: 'La Marsa'
        },
        {
          _id: 's3',
          title: 'Séance de physiothérapie',
          description: 'Traitement et prévention des blessures sportives, rééducation et conseils personnalisés.',
          category: 'physio',
          price: 60,
          duration: 50,
          provider: {
            _id: 'physio1',
            firstName: 'Karim',
            lastName: 'Mrad',
            photo: null,
            rating: 4.7,
            reviewCount: 18
          },
          location: 'Lac 2'
        },
        {
          _id: 's4',
          title: 'Cours de yoga débutant',
          description: 'Découvrez les bases du yoga, la respiration et les postures fondamentales dans un cadre apaisant.',
          category: 'yoga',
          price: 35,
          duration: 75,
          provider: {
            _id: 'yoga1',
            firstName: 'Yasmine',
            lastName: 'Jouini',
            photo: null,
            rating: 4.9,
            reviewCount: 42
          },
          location: 'Les Berges du Lac'
        },
        {
          _id: 's5',
          title: 'Programme de perte de poids',
          description: 'Programme complet combinant entraînement et nutrition pour atteindre vos objectifs de perte de poids.',
          category: 'fitness',
          price: 75,
          duration: 90,
          provider: {
            _id: 'coach2',
            firstName: 'Mehdi',
            lastName: 'Trabelsi',
            photo: null,
            rating: 4.6,
            reviewCount: 15
          },
          location: 'La Soukra'
        },
        {
          _id: 's6',
          title: 'Préparation physique spécifique',
          description: 'Préparation physique adaptée à votre sport pour améliorer vos performances et prévenir les blessures.',
          category: 'sport',
          price: 65,
          duration: 60,
          provider: {
            _id: 'coach3',
            firstName: 'Nizar',
            lastName: 'Abidi',
            photo: null,
            rating: 4.7,
            reviewCount: 22
          },
          location: 'Tunis, El Menzah'
        }
      ];
    },
    {
      keepPreviousData: true
    }
  );

  // Gérer le changement de filtre
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilters({
      category: '',
      minRating: '',
      maxPrice: '',
      location: '',
      search: ''
    });
    setSortOption('rating-desc');
  };

  // Appliquer les filtres
  const handleApplyFilters = () => {
    // Mise à jour de l'URL avec les paramètres de filtre
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    if (sortOption) params.append('sort', sortOption);
    
    window.history.pushState({}, '', `${location.pathname}?${params.toString()}`);
    setShowFilters(false);
  };

  // Filtrer les services (simulation côté client)
  const filteredServices = !data ? [] : data.filter(service => {
    // Filtre par catégorie
    if (filters.category && service.category !== filters.category) return false;
    
    // Filtre par note minimale
    if (filters.minRating && service.provider.rating < parseFloat(filters.minRating)) return false;
    
    // Filtre par prix maximum
    if (filters.maxPrice && service.price > parseFloat(filters.maxPrice)) return false;
    
    // Filtre par localisation
    if (filters.location && !service.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    
    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        service.title.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        service.provider.firstName.toLowerCase().includes(searchLower) ||
        service.provider.lastName.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Trier les services (simulation côté client)
  const sortedServices = filteredServices.slice().sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'rating-desc':
      default:
        return b.provider.rating - a.provider.rating;
    }
  });

  return (
    <div className="services-page">
      <div className="container">
        <div className="services-header">
          <h1 className="page-title">Services</h1>
          <Link to="/services/create" className="btn btn-primary">
            <FiPlus /> Créer un service
          </Link>
        </div>
        
        <div className="search-filters-container">
          <div className="search-bar">
            <Input
              type="text"
              placeholder="Rechercher un service..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
            />
          </div>
          
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filtres
          </button>
        </div>
        
        <div className={`filters ${showFilters ? 'show' : ''}`}>
          <div className="filters-content">
            <h3>Filtres</h3>
            
            <Select
              label="Catégorie"
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              options={categoryOptions}
            />
            
            <Input
              label="Localisation"
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Ville, quartier..."
              icon={<FiMapPin />}
            />
            
            <Input
              label="Note minimale"
              type="number"
              id="minRating"
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              placeholder="Ex: 4"
              min="0"
              max="5"
              step="0.5"
              icon={<FiStar />}
            />
            
            <Input
              label="Prix maximum (TND)"
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Ex: 100"
              min="0"
              icon={<FiDollarSign />}
            />
            
            <div className="filter-actions">
              <Button
                type="button"
                variant="outline-primary"
                onClick={handleResetFilters}
              >
                Réinitialiser
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleApplyFilters}
              >
                Appliquer
              </Button>
            </div>
          </div>
        </div>
        
        <div className="sort-container">
          <div className="results-count">
            {!isLoading && sortedServices && (
              <span>{sortedServices.length} résultats trouvés</span>
            )}
          </div>
          
          <div className="sort-by">
            <label>Trier par:</label>
            <Select
              id="sortOption"
              name="sortOption"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              options={sortOptions}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="loader-container">
            <Loader text="Chargement des services..." />
          </div>
        ) : isError ? (
          <Alert type="danger">
            Une erreur est survenue: {error.message}
          </Alert>
        ) : sortedServices.length > 0 ? (
          <div className="services-grid">
            {sortedServices.map((service) => (
              <Link to={`/services/${service._id}`} key={service._id} className="service-link">
                <Card className="service-card">
                  <h3 className="service-title">{service.title}</h3>
                  
                  <div className="service-provider">
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
                      <div className="provider-name">
                        {service.provider.firstName} {service.provider.lastName}
                      </div>
                      <div className="provider-rating">
                        <FiStar className="star-icon" />
                        <span>
                          {service.provider.rating} ({service.provider.reviewCount} avis)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="service-description">
                    {service.description.length > 120
                      ? `${service.description.substring(0, 120)}...`
                      : service.description
                    }
                  </p>
                  
                  <div className="service-details">
                    <Badge type={service.category === 'coaching' ? 'primary' : 
                              service.category === 'nutrition' ? 'success' :
                              service.category === 'physio' ? 'secondary' : 
                              service.category === 'yoga' ? 'warning' : 'dark'
                    }>
                      {categoryOptions.find(option => option.value === service.category)?.label || service.category}
                    </Badge>
                    
                    <div className="service-location">
                      <FiMapPin />
                      <span>{service.location}</span>
                    </div>
                    
                    <div className="service-duration">
                      <FiClock />
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                  
                  <div className="service-price">
                    <span>{service.price} TND</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Aucun service ne correspond à vos critères de recherche.</p>
            <p>Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;