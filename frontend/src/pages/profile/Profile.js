// src/pages/profile/Profile.js
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiLock } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Formulaire pour les informations générales
  const infoFormik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        postalCode: user?.address?.postalCode || '',
        country: user?.address?.country || 'Tunisie'
      }
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('Prénom requis'),
      lastName: Yup.string().required('Nom requis'),
      email: Yup.string().email('Email invalide').required('Email requis'),
      phoneNumber: Yup.string().required('Téléphone requis')
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');
      
      try {
        const formData = new FormData();
        
        // Ajouter les champs de texte
        Object.keys(values).forEach(key => {
          if (key === 'address') {
            Object.keys(values.address).forEach(addrKey => {
              formData.append(`address[${addrKey}]`, values.address[addrKey]);
            });
          } else {
            formData.append(key, values[key]);
          }
        });
        
        // Ajouter la photo si elle a été modifiée
        if (photoFile) {
          formData.append('photo', photoFile);
        }
        
        await updateProfile(formData);
        setSuccess('Profil mis à jour avec succès');
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
  });

  // Formulaire pour le changement de mot de passe
  const passwordFormik = useFormik({
    initialValues: {
      passwordCurrent: '',
      password: '',
      passwordConfirm: ''
    },
    validationSchema: Yup.object({
      passwordCurrent: Yup.string().required('Mot de passe actuel requis'),
      password: Yup.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .required('Nouveau mot de passe requis'),
      passwordConfirm: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
        .required('Confirmation requise')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');
      
      try {
        await updatePassword(
          values.passwordCurrent,
          values.password,
          values.passwordConfirm
        );
        
        setSuccess('Mot de passe mis à jour avec succès');
        passwordFormik.resetForm();
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
  });

  // Gestion du changement de photo
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setPhotoFile(file);
      
      // Prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Effet pour réinitialiser les messages d'erreur et de succès lors du changement d'onglet
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [activeTab]);

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">Mon profil</h1>
        
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Informations générales
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Changer le mot de passe
          </button>
        </div>
        
        {activeTab === 'info' && (
          <Card>
            {error && (
              <Alert type="danger" className="mb-4">
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert type="success" className="mb-4">
                {success}
              </Alert>
            )}
            
            <form onSubmit={infoFormik.handleSubmit} encType="multipart/form-data">
              <div className="profile-content">
                <div className="profile-photo-section">
                  <div className="profile-photo">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Prévisualisation" />
                    ) : user?.photo ? (
                      <img src={`/img/users/${user.photo}`} alt={`${user.firstName} ${user.lastName}`} />
                    ) : (
                      <div className="photo-placeholder">
                        {user?.firstName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  
                  <div className="photo-upload">
                    <label htmlFor="photo" className="btn btn-outline-primary">
                      Changer de photo
                    </label>
                    <input 
                      type="file" 
                      id="photo" 
                      name="photo" 
                      accept="image/*" 
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                    <p className="upload-help">JPG, PNG ou GIF, 5 MB maximum</p>
                  </div>
                </div>
                
                <div className="profile-info-section">
                  <div className="form-row">
                    <Input
                      label="Prénom"
                      id="firstName"
                      name="firstName"
                      value={infoFormik.values.firstName}
                      onChange={infoFormik.handleChange}
                      onBlur={infoFormik.handleBlur}
                      error={infoFormik.touched.firstName && infoFormik.errors.firstName}
                      required
                      icon={<FiUser />}
                    />
                    
                    <Input
                      label="Nom"
                      id="lastName"
                      name="lastName"
                      value={infoFormik.values.lastName}
                      onChange={infoFormik.handleChange}
                      onBlur={infoFormik.handleBlur}
                      error={infoFormik.touched.lastName && infoFormik.errors.lastName}
                      required
                      icon={<FiUser />}
                    />
                  </div>
                  
                  <div className="form-row">
                    <Input
                      label="Email"
                      type="email"
                      id="email"
                      name="email"
                      value={infoFormik.values.email}
                      onChange={infoFormik.handleChange}
                      onBlur={infoFormik.handleBlur}
                      error={infoFormik.touched.email && infoFormik.errors.email}
                      required
                      icon={<FiMail />}
                    />
                    
                    <Input
                      label="Téléphone"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={infoFormik.values.phoneNumber}
                      onChange={infoFormik.handleChange}
                      onBlur={infoFormik.handleBlur}
                      error={infoFormik.touched.phoneNumber && infoFormik.errors.phoneNumber}
                      required
                      icon={<FiPhone />}
                    />
                  </div>
                  
                  <h3 className="section-title">Adresse</h3>
                  
                  <Input
                    label="Rue"
                    id="address.street"
                    name="address.street"
                    value={infoFormik.values.address.street}
                    onChange={infoFormik.handleChange}
                    onBlur={infoFormik.handleBlur}
                    error={
                      infoFormik.touched.address?.street && 
                      infoFormik.errors.address?.street
                    }
                    icon={<FiMapPin />}
                  />
                  
                  <div className="form-row">
                    <Input
                      label="Ville"
                      id="address.city"
                      name="address.city"
                      value={infoFormik.values.address.city}
                      onChange={infoFormik.handleChange}
                      onBlur={infoFormik.handleBlur}
                      error={
                        infoFormik.touched.address?.city && 
                        infoFormik.errors.address?.city
                      }
                    />
                    
                    <Input
                      label="Code postal"
                      id="address.postalCode"
                      name="address.postalCode"
                      value={infoFormik.values.address.postalCode}
                      onChange={infoFormik.handleChange}
                      onBlur={infoFormik.handleBlur}
                      error={
                        infoFormik.touched.address?.postalCode && 
                        infoFormik.errors.address?.postalCode
                      }
                    />
                  </div>
                  
                  <div className="form-actions">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? 'Mise à jour en cours...' : 'Enregistrer les modifications'}
                      {!loading && <FiSave />}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Card>
        )}
        
        {activeTab === 'password' && (
          <Card>
            {error && (
              <Alert type="danger" className="mb-4">
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert type="success" className="mb-4">
                {success}
              </Alert>
            )}
            
            <form onSubmit={passwordFormik.handleSubmit}>
              <Input
                label="Mot de passe actuel"
                type="password"
                id="passwordCurrent"
                name="passwordCurrent"
                value={passwordFormik.values.passwordCurrent}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.touched.passwordCurrent && passwordFormik.errors.passwordCurrent}
                required
                icon={<FiLock />}
              />
              
              <Input
                label="Nouveau mot de passe"
                type="password"
                id="password"
                name="password"
                value={passwordFormik.values.password}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.touched.password && passwordFormik.errors.password}
                required
                icon={<FiLock />}
              />
              
              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={passwordFormik.values.passwordConfirm}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.touched.passwordConfirm && passwordFormik.errors.passwordConfirm}
                required
                icon={<FiLock />}
              />
              
              <div className="form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Mise à jour en cours...' : 'Changer le mot de passe'}
                  {!loading && <FiSave />}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;