// frontend/src/pages/auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirection après connexion (si l'utilisateur venait d'une page protégée)
  const from = location.state?.from?.pathname || '/dashboard';

  // Validation du formulaire avec Formik et Yup
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Adresse email invalide')
        .required('Email requis'),
      password: Yup.string()
        .required('Mot de passe requis')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      
      try {
        await login(values.email, values.password);
        navigate(from, { replace: true });
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
          <h2>Connexion</h2>
          <p>Connectez-vous à votre compte FlexMatch</p>
        </div>

        {error && (
          <Alert type="danger" className="mb-2">
            {error}
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

          <Input
            label="Mot de passe"
            type="password"
            id="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Votre mot de passe"
            error={formik.touched.password && formik.errors.password}
            required
            icon={<FiLock />}
          />

          <div className="auth-links">
            <Link to="/forgot-password" className="auth-link">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            className="auth-btn"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
            {!loading && <FiLogIn />}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Vous n'avez pas de compte ?{' '}
            <Link to="/signup" className="auth-link">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;