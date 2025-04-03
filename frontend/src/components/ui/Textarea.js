// frontend/src/components/ui/Textarea.js
import React from 'react';
import './Textarea.css';

const Textarea = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-textarea ${error ? 'is-invalid' : ''}`}
        required={required}
        disabled={disabled}
        rows={rows}
        {...props}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Textarea;