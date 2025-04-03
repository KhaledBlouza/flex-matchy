// frontend/src/pages/auth/SignUp.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiPhone, 
  FiMapPin, 
  FiUserPlus
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import './Auth.css';

const SignUp = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Options pour le rôle
  const roleOptions = [
    { value: 'client', label: 'Client' },
    { value: 'coach', label: 'Coach sportif' },
    { value: 'healthSpecialist', label: 'Spécialiste de santé' },
    { value: 'gymOwner', label: 'Propriétaire de salle de sport' },
    { value: 'sportFieldOwner', label: 'Propriétaire de terrain de sport' }
  ];

  // Validation du formulaire avec Formik et Yup
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      passwordConfirm: '',
      role: 'client',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: 'Tunisie'
      },
      // Champs spécifiques (visibles selon le rôle)
      specialties: [],
      experience: 0,
      specialty: '',
      qualifications: [],
      licenseNumber: '',
      name: '',
      description: '',
      sportType: ''
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .required('Prénom requis'),
      lastName: Yup.string()
        .required('Nom requis'),
      email: Yup.string()
        .email('Adresse email invalide')
        .required('Email requis'),
      phoneNumber: Yup.string()
        .required('Numéro de téléphone requis'),
      password: Yup.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .required('Mot de passe requis'),
      passwordConfirm: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
        .required('Confirmation du mot de passe requise'),
      role: Yup.string()
        .required('Rôle requis'),
      address: Yup.object({
        street: Yup.string(),
        city: Yup.string(),
        postalCode: Yup.string(),
        country: Yup.string()
      })
    }),
    onSubmit: async (values) => {
      if (step < 2) {
        setStep(step + 1);
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        await signup(values);
        navigate('/dashboard');
      } catch (err) {
        setError(err);
        setStep(1);
      } finally {
        setLoading(false);
      }
    }
  });

  // Fonction pour revenir à l'étape précédente
  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <h2>Inscription</h2>
          <p>Créez votre compte FlexMatch</p>
          {step > 1 && (
            <div className="step-indicator">
              Étape {step} sur 2
            </div>
          )}
        </div>

        {error && (
          <Alert type="danger" className="mb-2">
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit} className="auth-form">
          {step === 1 && (
            <>
              <div className="form-row">
                <Input
                  label="Prénom"
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Votre prénom"
                  error={formik.touched.firstName && formik.errors.firstName}
                  required
                  icon={<FiUser />}
                />

                <Input
                  label="Nom"
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Votre nom"
                  error={formik.touched.lastName && formik.errors.lastName}
                  required
                  icon={<FiUser />}
                />
              </div>

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
                label="Téléphone"
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Votre numéro de téléphone"
                error={formik.touched.phoneNumber && formik.errors.phoneNumber}
                required
                icon={<FiPhone />}
              />

              <div className="form-row">
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

                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                  value={formik.values.passwordConfirm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Confirmez votre mot de passe"
                  error={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
                  required
                  icon={<FiLock />}
                />
              </div>

              <Select
                label="Je m'inscris en tant que"
                id="role"
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                options={roleOptions}
                error={formik.touched.role && formik.errors.role}
                required
              />
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="section-title">Adresse</h3>
              
              <Input
                label="Rue"
                type="text"
                id="address.street"
                name="address.street"
                value={formik.values.address.street}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Numéro et nom de rue"
                error={
                  formik.touched.address?.street && 
                  formik.errors.address?.street
                }
                icon={<FiMapPin />}
              />

              <div className="form-row">
                <Input
                  label="Ville"
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formik.values.address.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ville"
                  error={
                    formik.touched.address?.city && 
                    formik.errors.address?.city
                  }
                />

                <Input
                  label="Code postal"
                  type="text"
                  id="address.postalCode"
                  name="address.postalCode"
                  value={formik.values.address.postalCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Code postal"
                  error={
                    formik.touched.address?.postalCode && 
                    formik.errors.address?.postalCode
                  }
                />
              </div>

              {/* Champs spécifiques en fonction du rôle */}
              {formik.values.role === 'coach' && (
                <div className="role-specific-fields">
                  <h3 className="section-title">Profil de coach</h3>
                  {/* Des champs supplémentaires seraient ajoutés ici */}
                </div>
              )}

              {formik.values.role === 'healthSpecialist' && (
                <div className="role-specific-fields">
                  <h3 className="section-title">Profil de spécialiste</h3>
                  {/* Des champs supplémentaires seraient ajoutés ici */}
                </div>
              )}

              {formik.values.role === 'gymOwner' && (
                <div className="role-specific-fields">
                  <h3 className="section-title">Profil de salle</h3>
                  {/* Des champs supplémentaires seraient ajoutés ici */}
                </div>
              )}

              {formik.values.role === 'sportFieldOwner' && (
                <div className="role-specific-fields">
                  <h3 className="section-title">Profil de terrain</h3>
                  {/* Des champs supplémentaires seraient ajoutés ici */}
                </div>
              )}
            </>
          )}

          <div className="form-actions">
            {step > 1 && (
              <Button
                type="button"
                variant="outline-primary"
                onClick={handleBack}
                disabled={loading}
              >
                Retour
              </Button>
            )}
            
            <Button
              type="submit"
              variant="primary"
              fullWidth={step === 1}
              disabled={loading}
              className="auth-btn"
            >
              {loading 
                ? 'Inscription en cours...' 
                : step < 2 
                  ? 'Continuer' 
                  : "S'inscrire"}
              {!loading && step === 2 && <FiUserPlus />}
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="auth-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
