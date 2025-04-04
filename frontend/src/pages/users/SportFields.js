// src/pages/users/SportFields.js
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

const SportFields = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({
    sportType: '',
    minRating: '',
    maxPrice: '',
    location: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('rating-desc');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Options pour le tri
  const sortOptions = [
    { value: 'rating-desc', label: 'Meilleurs avis' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'newest', label: 'Plus récents' }
  ];
  
  // Options pour les types de sport
  const sportTypeOptions = [
    { value: '', label: 'Tous les sports' },
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'handball', label: 'Handball' },
    { value: 'padel', label: 'Padel' },
    { value: 'squash', label: 'Squash' }
  ];

  // Récupérer les paramètres d'URL lors du chargement
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    setFilters({
      sportType: params.get('sportType') || '',
      minRating: params.get('minRating') || '',
      maxPrice: params.get('maxPrice') || '',
      location: params.get('location') || '',
      search: params.get('search') || ''
    });
    
    setSortOption(params.get('sort') || 'rating-desc');
  }, [location.search]);

  // Récupérer les terrains
  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      
      try {
        // Simuler un appel API
        setTimeout(() => {
          const mockFields = [
            {
              _id: 'field1',
              name: 'Stade Municipal',
              description: 'Terrain de football en gazon naturel avec vestiaires et éclairage.',
              sportType: 'football',
              location: 'Tunis, El Menzah',
              address: 'Complexe Sportif El Menzah, Tunis',
              rating: 4.5,
              reviewCount: 28,
              price: 120, // Prix par heure
              photo: null,
              facilities: ['parking', 'changing_rooms', 'lighting', 'shower'],
              capacity: 22
            },
            {
              _id: 'field2',
              name: 'Tennis Club La Marsa',
              description: 'Courts de tennis en terre battue et en dur, bien entretenus.',
              sportType: 'tennis',
              location: 'La Marsa',
              address: '12 Avenue Habib Bourguiba, La Marsa',
              rating: 4.7,
              reviewCount: 35,
              price: 60, // Prix par heure
              photo: null,
              facilities: ['parking', 'changing_rooms', 'club_house', 'shower'],
              capacity: 4
            },
            {
              _id: 'field3',
              name: 'Arena Padel',
              description: 'Terrains de padel couverts aux normes internationales.',
              sportType: 'padel',
              location: 'Tunis, Les Berges du Lac',
              address: '25 Rue du Lac Michigan, Les Berges du Lac, Tunis',
              rating: 4.9,
              reviewCount: 42,
              price: 70, // Prix par heure
              photo: null,
              facilities: ['parking', 'changing_rooms', 'shower', 'cafeteria'],
              capacity: 4
            },
            {
              _id: 'field4',
              name: 'Basketball Center',
              description: 'Terrain de basketball couvert avec gradins.',
              sportType: 'basketball',
              location: 'Tunis, Cité Olympique',
              address: 'Cité Olympique, El Menzah, Tunis',
              rating: 4.4,
              reviewCount: 19,
              price: 80, // Prix par heure
              photo: null,
              facilities: ['parking', 'changing_rooms', 'lighting'],
              capacity: 10
            }
          ];
          
          setFields(mockFields);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Une erreur est survenue lors du chargement des terrains');
        setLoading(false);
      }
    };
    
    fetchFields();
  }, []);

  // Gérer le changement de filtre
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilters({
      sportType: '',
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
  const filteredFields = fields.filter(field => {
    // Filtre par type de sport
    if (filters.sportType && field.sportType !== filters.sportType) return false;
    
    // Filtre par note minimale
    if (filters.minRating && field.rating < parseFloat(filters.minRating)) return false;
    
    // Filtre par prix maximum
    if (filters.maxPrice && field.price > parseFloat(filters.maxPrice)) return false;
    
    // Filtre par localisation
    if (filters.location && !field.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    
    // Filtre par recherche
    if (filters.search) {
      const searchTerms = filters.search.toLowerCase();
      return (
        field.name.toLowerCase().includes(searchTerms) ||
        field.description.toLowerCase().includes(searchTerms) ||
        field.location.toLowerCase().includes(searchTerms) ||
        field.sportType.toLowerCase().includes(searchTerms)
      );
    }
    
    return true;
  });

  // Trier les résultats
  const sortedFields = [...filteredFields].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
        return 0; // Pas de date dans les données mockées
      case 'rating-desc':
      default:
        return b.rating - a.rating;
    }
  });

  // Obtenir le nom lisible du type de sport
  const getSportTypeName = (type) => {
    const sportOption = sportTypeOptions.find(option => option.value === type);
    return sportOption ? sportOption.label : type;
  };

  return (
    <div className="users-search">
      <div className="container">
        <h1 className="page-title">Terrains de Sport</h1>
        
        <div className="search-filters-container">
          <SearchBar placeholder="Rechercher un terrain..." />
          
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
              label="Type de sport"
              id="sportType"
              name="sportType"
              value={filters.sportType}
              onChange={handleFilterChange}
              options={sportTypeOptions}
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
              label="Prix horaire maximum (TND)"
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
              <span>{sortedFields.length} résultats trouvés</span>
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
            <Loader text="Chargement des terrains de sport..." />
          </div>
        ) : error ? (
          <Alert type="danger">
            {error}
          </Alert>
        ) : sortedFields.length > 0 ? (
          <div className="fields-grid">
            {sortedFields.map((field) => (
              <Link to={`/user/${field._id}`} key={field._id} className="field-link">
                <Card className="field-card">
                  <div className="field-image">
                    <img 
                      src={field.photo ? `/img/users/${field.photo}` : '/img/default-field.jpg'} 
                      alt={field.name} 
                    />
                  </div>
                  <div className="field-info">
                    <h3>{field.name}</h3>
                    
                    <Badge type="primary" className="sport-badge">
                      {getSportTypeName(field.sportType)}
                    </Badge>
                    
                    <div className="field-rating">
                      <FiStar className="star-icon" />
                      <span>{field.rating} ({field.reviewCount} avis)</span>
                    </div>
                    
                    <div className="field-location">
                      <FiMapPin className="location-icon" />
                      <span>{field.location}</span>
                    </div>
                    
                    <div className="field-price">
                      <FiDollarSign className="price-icon" />
                      <span>{field.price} TND/heure</span>
                    </div>
                    
                    <div className="field-facilities">
                      {field.facilities.includes('parking') && (
                        <Badge type="light" className="facility-badge">
                          Parking
                        </Badge>
                      )}
                      {field.facilities.includes('changing_rooms') && (
                        <Badge type="light" className="facility-badge">
                          Vestiaires
                        </Badge>
                      )}
                      {field.facilities.includes('lighting') && (
                        <Badge type="light" className="facility-badge">
                          Éclairage
                        </Badge>
                      )}
                      {field.facilities.includes('shower') && (
                        <Badge type="light" className="facility-badge">
                          Douches
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
            <p>Aucun terrain ne correspond à vos critères de recherche.</p>
            <p>Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SportFields;