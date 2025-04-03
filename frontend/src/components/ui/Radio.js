// frontend/src/components/ui/Radio.js
import React from 'react';
import './Radio.css';

const Radio = ({
  label,
  id,
  name,
  value,
  checked,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-radio ${className}`}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className={`form-radio-input ${error ? 'is-invalid' : ''}`}
        disabled={disabled}
        {...props}
      />
      {label && (
        <label htmlFor={id} className="form-radio-label">
          {label}
        </label>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Radio;