// src/pages/users/Gyms.js
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiFilter, FiStar, FiMapPin, FiDollarSign } from 'react-icons/fi';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/search/SearchBar';
import './UsersSearch.css';

const Gyms = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({
    amenities: '',
    minRating: '',
    maxPrice: '',
    location: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('rating-desc');
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Options pour le tri
  const sortOptions = [
    { value: 'rating-desc', label: 'Meilleurs avis' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'newest', label: 'Plus récents' }
  ];
  
  // Options pour les équipements
  const amenitiesOptions = [
    { value: '', label: 'Tous les équipements' },
    { value: 'cardio', label: 'Machines cardio' },
    { value: 'weights', label: 'Poids libres' },
    { value: 'classes', label: 'Cours collectifs' },
    { value: 'pool', label: 'Piscine' },
    { value: 'sauna', label: 'Sauna' },
    { value: 'parking', label: 'Parking' }
  ];

  // Récupérer les paramètres d'URL lors du chargement
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    setFilters({
      amenities: params.get('amenities') || '',
      minRating: params.get('minRating') || '',
      maxPrice: params.get('maxPrice') || '',
      location: params.get('location') || '',
      search: params.get('search') || ''
    });
    
    setSortOption(params.get('sort') || 'rating-desc');
  }, [location.search]);

  // Récupérer les salles de sport
  useEffect(() => {
    const fetchGyms = async () => {
      setLoading(true);
      
      try {
        // Simuler un appel API
        setTimeout(() => {
          const mockGyms = [
            {
              _id: 'gym1',
              name: 'Fitness Club Premium',
              description: 'Salle de sport moderne avec équipements haut de gamme et nombreux cours collectifs.',
              location: 'Tunis, Les Berges du Lac',
              address: '15 Rue du Lac Léman, Les Berges du Lac, Tunis',
              rating: 4.8,
              reviewCount: 45,
              price: {
                monthly: 120,
                yearly: 1200
              },
              amenities: ['cardio', 'weights', 'classes', 'sauna'],
              photo: null,
              openingHours: {
                monday: '06:00-22:00',
                tuesday: '06:00-22:00',
                wednesday: '06:00-22:00',
                thursday: '06:00-22:00',
                friday: '06:00-22:00',
                saturday: '08:00-20:00',
                sunday: '09:00-18:00'
              }
            },
            {
              _id: 'gym2',
              name: 'Power Gym',
              description: 'Spécialisée en musculation et powerlifting avec des équipements professionnels.',
              location: 'Tunis, El Menzah',
              address: '25 Avenue Hédi Nouira, El Menzah, Tunis',
              rating: 4.6,
              reviewCount: 32,
              price: {
                monthly: 90,
                yearly: 900
              },
              amenities: ['weights', 'cardio'],
              photo: null,
              openingHours: {
                monday: '07:00-23:00',
                tuesday: '07:00-23:00',
                wednesday: '07:00-23:00',
                thursday: '07:00-23:00',
                friday: '07:00-23:00',
                saturday: '09:00-22:00',
                sunday: '09:00-20:00'
              }
            },
            {
              _id: 'gym3',
              name: 'Aqua Fitness Center',
              description: 'Centre de fitness avec piscine, cours d\'aquagym et spa complet.',
              location: 'La Marsa',
              address: '8 Avenue Habib Bourguiba, La Marsa',
              rating: 4.9,
              reviewCount: 56,
              price: {
                monthly: 150,
                yearly: 1500
              },
              amenities: ['cardio', 'weights', 'classes', 'pool', 'sauna'],
              photo: null,
              openingHours: {
                monday: '06:00-22:00',
                tuesday: '06:00-22:00',
                wednesday: '06:00-22:00',
                thursday: '06:00-22:00',
                friday: '06:00-22:00',
                saturday: '08:00-20:00',
                sunday: '09:00-18:00'
              }
            }
          ];
          
          setGyms(mockGyms);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Une erreur est survenue lors du chargement des salles de sport');
        setLoading(false);
      }
    };
    
    fetchGyms();
  }, []);

  // Gérer le changement de filtre
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilters({
      amenities: '',
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

  // Filtrer les résultats
  const filteredGyms = gyms.filter(gym => {
    // Filtre par équipement
    if (filters.amenities && !gym.amenities.includes(filters.amenities)) return false;
    
    // Filtre par note minimale
    if (filters.minRating && gym.rating < parseFloat(filters.minRating)) return false;
    
    // Filtre par prix maximum
    if (filters.maxPrice && gym.price.monthly > parseFloat(filters.maxPrice)) return false;
    
    // Filtre par localisation
    if (filters.location && !gym.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    
    // Filtre par recherche
    if (filters.search) {
      const searchTerms = filters.search.toLowerCase();
      return (
        gym.name.toLowerCase().includes(searchTerms) ||
        gym.description.toLowerCase().includes(searchTerms) ||
        gym.location.toLowerCase().includes(searchTerms)
      );
    }
    
    return true;
  });

  // Trier les résultats
  const sortedGyms = [...filteredGyms].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return a.price.monthly - b.price.monthly;
      case 'price-desc':
        return b.price.monthly - a.price.monthly;
      case 'newest':
        return 0; // Pas de date dans les données mockées
      case 'rating-desc':
      default:
        return b.rating - a.rating;
    }
  });

  return (
    <div className="users-search">
      <div className="container">
        <h1 className="page-title">Salles de Sport</h1>
        
        <div className="search-filters-container">
          <SearchBar placeholder="Rechercher une salle de sport..." />
          
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
              label="Équipements"
              id="amenities"
              name="amenities"
              value={filters.amenities}
              onChange={handleFilterChange}
              options={amenitiesOptions}
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
              label="Prix mensuel maximum (TND)"
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
            {!loading && (
              <span>{sortedGyms.length} résultats trouvés</span>
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
        
        {loading ? (
          <div className="loader-container">
            <Loader text="Chargement des salles de sport..." />
          </div>
        ) : error ? (
          <Alert type="danger">
            {error}
          </Alert>
        ) : sortedGyms.length > 0 ? (
          <div className="gyms-grid">
            {sortedGyms.map((gym) => (
              <Link to={`/user/${gym._id}`} key={gym._id} className="gym-link">
                <Card className="gym-card">
                  <div className="gym-image">
                    <img 
                      src={gym.photo ? `/img/users/${gym.photo}` : '/img/default-gym.jpg'} 
                      alt={gym.name} 
                    />
                  </div>
                  <div className="gym-info">
                    <h3>{gym.name}</h3>
                    
                    <div className="gym-rating">
                      <FiStar className="star-icon" />
                      <span>{gym.rating} ({gym.reviewCount} avis)</span>
                    </div>
                    
                    <div className="gym-location">
                      <FiMapPin className="location-icon" />
                      <span>{gym.location}</span>
                    </div>
                    
                    <div className="gym-price">
                      <FiDollarSign className="price-icon" />
                      <span>À partir de {gym.price.monthly} TND/mois</span>
                    </div>
                    
                    <div className="gym-amenities">
                      {gym.amenities.includes('cardio') && (
                        <Badge type="primary" className="amenity-badge">
                          Cardio
                        </Badge>
                      )}
                      {gym.amenities.includes('weights') && (
                        <Badge type="secondary" className="amenity-badge">
                          Poids
                        </Badge>
                      )}
                      {gym.amenities.includes('classes') && (
                        <Badge type="success" className="amenity-badge">
                          Cours
                        </Badge>
                      )}
                      {gym.amenities.includes('pool') && (
                        <Badge type="warning" className="amenity-badge">
                          Piscine
                        </Badge>
                      )}
                      {gym.amenities.includes('sauna') && (
                        <Badge type="danger" className="amenity-badge">
                          Sauna
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Aucune salle de sport ne correspond à vos critères de recherche.</p>
            <p>Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gyms;