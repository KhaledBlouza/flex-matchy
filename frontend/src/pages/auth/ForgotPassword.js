// frontend/src/pages/auth/ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiMail, FiSend } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import './Auth.css';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validation du formulaire avec Formik et Yup
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Adresse email invalide')
        .required('Email requis')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      try {
        await forgotPassword(values.email);
        setSuccess(true);
        formik.resetForm();
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Mot de passe oublié</h2>
          <p>Entrez votre email pour réinitialiser votre mot de passe</p>
        </div>

        {error && (
          <Alert type="danger" className="mb-2">
            {error}
          </Alert>
        )}

        {success && (
          <Alert type="success" className="mb-2">
            Un email de réinitialisation a été envoyé à l'adresse indiquée. Veuillez vérifier votre boîte de réception.
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit} className="auth-form">
          <Input
            label="Email"
            type="email"
            id="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Votre adresse email"
            error={formik.touched.email && formik.errors.email}
            required
            icon={<FiMail />}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            className="auth-btn"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer les instructions'}
            {!loading && <FiSend />}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/login" className="auth-link">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;