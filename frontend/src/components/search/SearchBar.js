// src/components/search/SearchBar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ placeholder = "Rechercher...", onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  // Récupérer le terme de recherche des paramètres d'URL au chargement
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [location.search]);

  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (onSearch) {
      // Si une fonction de recherche est fournie, l'utiliser
      onSearch(searchTerm);
      return;
    }
    
    // Sinon, mettre à jour l'URL avec le terme de recherche
    const params = new URLSearchParams(location.search);
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    
    navigate(`${location.pathname}?${params.toString()}`);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            <FiSearch />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;