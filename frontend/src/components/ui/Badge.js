// frontend/src/components/ui/Badge.js
import React from 'react';
import './Badge.css';

const Badge = ({ children, type = 'primary', className = '', ...props }) => {
  return (
    <span className={`badge badge-${type} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;