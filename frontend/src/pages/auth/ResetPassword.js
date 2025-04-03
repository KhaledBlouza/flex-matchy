// frontend/src/pages/auth/ResetPassword.js
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiLock, FiSave } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validation du formulaire avec Formik et Yup
  const formik = useFormik({
    initialValues: {
      password: '',
      passwordConfirm: ''
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .required('Mot de passe requis'),
      passwordConfirm: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
        .required('Confirmation du mot de passe requise')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      try {
        await resetPassword(token, values.password, values.passwordConfirm);
        setSuccess(true);
        // Redirection vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
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
          <h2>Réinitialisation du mot de passe</h2>
          <p>Veuillez entrer votre nouveau mot de passe</p>
        </div>

        {error && (
          <Alert type="danger" className="mb-2">
            {error}
          </Alert>
        )}

        {success && (
          <Alert type="success" className="mb-2">
            Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
          </Alert>
        )}

        {!success && (
          <form onSubmit={formik.handleSubmit} className="auth-form">
            <Input
              label="Nouveau mot de passe"
              type="password"
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Votre nouveau mot de passe"
              error={formik.touched.password && formik.errors.password}
              required
              icon={<FiLock />}
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formik.values.passwordConfirm}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Confirmez votre nouveau mot de passe"
              error={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
              required
              icon={<FiLock />}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              className="auth-btn"
            >
              {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
              {!loading && <FiSave />}
            </Button>
          </form>
        )}

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

export default ResetPassword;