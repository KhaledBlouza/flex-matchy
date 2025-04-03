// frontend/src/pages/users/HealthSpecialists.js
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiFilter, FiStar, FiMapPin, FiDollarSign } from 'react-icons/fi';
import api from '../../services/api';
import SearchBar from '../../components/search/SearchBar';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import './UsersSearch.css';

const HealthSpecialists = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({
    specialty: '',
    minRating: '',
    maxPrice: '',
    location: '',
    availableDay: '',
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
  
  // Options pour les spécialités
  const specialtyOptions = [
    { value: '', label: 'Toutes les spécialités' },
    { value: 'nutritionniste', label: 'Nutritionniste' },
    { value: 'physiotherapeute', label: 'Physiothérapeute' },
    { value: 'osteopathe', label: 'Ostéopathe' },
    { value: 'chiropracteur', label: 'Chiropracteur' },
    { value: 'psychologue', label: 'Psychologue sportif' },
    { value: 'dieteticien', label: 'Diététicien' }
  ];
  
  // Options pour les jours de disponibilité
  const dayOptions = [
    { value: '', label: 'Tous les jours' },
    { value: 'monday', label: 'Lundi' },
    { value: 'tuesday', label: 'Mardi' },
    { value: 'wednesday', label: 'Mercredi' },
    { value: 'thursday', label: 'Jeudi' },
    { value: 'friday', label: 'Vendredi' },
    { value: 'saturday', label: 'Samedi' },
    { value: 'sunday', label: 'Dimanche' }
  ];

  // Récupérer les paramètres d'URL lors du chargement
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    setFilters({
      specialty: params.get('specialty') || '',
      minRating: params.get('minRating') || '',
      maxPrice: params.get('maxPrice') || '',
      location: params.get('location') || '',
      availableDay: params.get('availableDay') || '',
      search: params.get('search') || ''
    });
    
    setSortOption(params.get('sort') || 'rating-desc');
  }, [location.search]);

  // Requête pour récupérer les spécialistes de santé
  const { data, isLoading, isError, error } = useQuery(
    ['healthSpecialists', filters, sortOption],
    async () => {
      const params = new URLSearchParams();
      
      if (filters.specialty) params.append('specialty', filters.specialty);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.location) params.append('location', filters.location);
      if (filters.availableDay) params.append('availableDay', filters.availableDay);
      if (filters.search) params.append('search', filters.search);
      if (sortOption) params.append('sort', sortOption);
      
      const response = await api.get(`/api/v1/users/role/healthSpecialist?${params.toString()}`);
      return response.data.data.users;
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
      specialty: '',
      minRating: '',
      maxPrice: '',
      location: '',
      availableDay: '',
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

  return (
    <div className="users-search">
      <div className="container">
        <h1 className="page-title">Spécialistes de Santé</h1>
        
        <div className="search-filters-container">
          <SearchBar />
          
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
              label="Spécialité"
              id="specialty"
              name="specialty"
              value={filters.specialty}
              onChange={handleFilterChange}
              options={specialtyOptions}
            />
            
            <Select
              label="Disponibilité"
              id="availableDay"
              name="availableDay"
              value={filters.availableDay}
              onChange={handleFilterChange}
              options={dayOptions}
            />
            
            <Input
              label="Localisation"
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Ville, région..."
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
            {!isLoading && data && (
              <span>{data.length} résultats trouvés</span>
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
            <Loader text="Chargement des spécialistes..." />
          </div>
        ) : isError ? (
          <Alert type="danger">
            Une erreur est survenue: {error.message}
          </Alert>
        ) : data && data.length > 0 ? (
          <div className="specialists-grid">
            {data.map((specialist) => (
              <Link to={`/user/${specialist._id}`} key={specialist._id} className="specialist-link">
                <Card className="specialist-card">
                  <div className="specialist-image">
                    <img 
                      src={specialist.photo ? `/img/users/${specialist.photo}` : '/img/default-user.jpg'} 
                      alt={`${specialist.firstName} ${specialist.lastName}`} 
                    />
                  </div>
                  <div className="specialist-info">
                    <h3>{specialist.firstName} {specialist.lastName}</h3>
                    
                    {specialist.specialty && (
                      <Badge type="primary" className="specialty-badge">
                        {specialist.specialty}
                      </Badge>
                    )}
                    
                    <div className="specialist-rating">
                      <FiStar className="star-icon" />
                      <span>
                        {specialist.ratings && specialist.ratings.average
                          ? specialist.ratings.average.toFixed(1)
                          : 'Nouveau'}
                        {specialist.ratings && specialist.ratings.count > 0 && 
                          ` (${specialist.ratings.count} avis)`
                        }
                      </span>
                    </div>
                    
                    {specialist.location && specialist.location.address && (
                      <div className="specialist-location">
                        <FiMapPin className="location-icon" />
                        <span>{specialist.location.address}</span>
                      </div>
                    )}
                    
                    {specialist.services && specialist.services[0] && specialist.services[0].price && (
                      <div className="specialist-price">
                        <FiDollarSign className="price-icon" />
                        <span>À partir de {specialist.services[0].price} TND</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Aucun spécialiste de santé ne correspond à vos critères de recherche.</p>
            <p>Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthSpecialists;