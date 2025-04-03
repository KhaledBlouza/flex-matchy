// frontend/src/components/ui/Checkbox.js
import React from 'react';
import './Checkbox.css';

const Checkbox = ({
  label,
  id,
  name,
  checked,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-check ${className}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className={`form-check-input ${error ? 'is-invalid' : ''}`}
        disabled={disabled}
        {...props}
      />
      {label && (
        <label htmlFor={id} className="form-check-label">
          {label}
        </label>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Checkbox;