// frontend/src/components/ui/Loader.js
import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', text = 'Chargement...', fullPage = false }) => {
  const loaderClass = `loader loader-${size} ${fullPage ? 'loader-full-page' : ''}`;

  return (
    <div className={loaderClass}>
      <div className="spinner"></div>
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
};

export default Loader;