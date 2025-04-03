// frontend/src/components/ui/Alert.js
import React from 'react';
import './Alert.css';

const Alert = ({ type = 'info', children, className = '', dismissible = false, onClose }) => {
  return (
    <div className={`alert alert-${type} ${dismissible ? 'alert-dismissible' : ''} ${className}`}>
      {children}
      {dismissible && (
        <button type="button" className="close-btn" onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;