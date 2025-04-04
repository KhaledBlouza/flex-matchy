// src/pages/services/EditService.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  FiCheckSquare, 
  FiPlus, 
  FiMinus,
  FiSave,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Loader from '../../components/ui/Loader';
import './CreateService.css'; // Réutiliser les mêmes styles

const EditService = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [benefits, setBenefits] = useState(['']);
  const [availabilities, setAvailabilities] = useState([{ 
    day: 'monday', 
    slots: ['09:00']
  }]);
  
  // Options pour les catégories
  const categoryOptions = [
    { value: '', label: 'Sélectionner une catégorie' },
    { value: 'coaching', label: 'Coaching sportif' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'physio', label: 'Physiothérapie' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'sport', label: 'Sport' }
  ];
  
  // Options pour les jours de la semaine
  const daysOptions = [
    { value: 'monday', label: 'Lundi' },
    { value: 'tuesday', label: 'Mardi' },
    { value: 'wednesday', label: 'Mercredi' },
    { value: 'thursday', label: 'Jeudi' },
    { value: 'friday', label: 'Vendredi' },
    { value: 'saturday', label: 'Samedi' },
    { value: 'sunday', label: 'Dimanche' }
  ];
  
  // Initialisation du formulaire
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
      price: '',
      duration: '',
      location: '',
      address: ''
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('Le titre est requis')
        .max(100, 'Le titre ne doit pas dépasser 100 caractères'),
      description: Yup.string()
        .required('La description est requise')
        .min(20, 'La description doit contenir au moins 20 caractères'),
      category: Yup.string()
        .required('La catégorie est requise'),
      price: Yup.number()
        .required('Le prix est requis')
        .positive('Le prix doit être positif')
        .typeError('Le prix doit être un nombre'),
      duration: Yup.number()
        .required('La durée est requise')
        .positive('La durée doit être positive')
        .integer('La durée doit être un nombre entier')
        .typeError('La durée doit être un nombre'),
      location: Yup.string()
        .required('La localisation est requise'),
      address: Yup.string()
        .required('L\'adresse est requise')
    }),
    onSubmit: async (values) => {
      // Validation additionnelle
      if (benefits.filter(b => b.trim()).length === 0) {
        setError('Veuillez ajouter au moins un avantage');
        return;
      }
      
      if (availabilities.some(a => a.slots.length === 0)) {
        setError('Tous les jours doivent avoir au moins un créneau horaire');
        return;
      }
      
      setSubmitting(true);
      setError('');
      
      try {
        // Préparation des données
        const serviceData = {
          ...values,
          benefits: benefits.filter(b => b.trim()),
          availabilities: availabilities.map(a => ({
            day: a.day,
            slots: a.slots
          }))
        };
        
        // Simulation d'appel API
        console.log('Données du service à mettre à jour:', serviceData);
        
        // Dans une implémentation réelle, on enverrait les données à l'API
        // const response = await api.patch(`/api/v1/services/${id}`, serviceData);
        // navigate(`/services/${id}`);
        
        // Pour l'exemple, on simule un succès après 1s
        setTimeout(() => {
          navigate(`/services/${id}`);
        }, 1000);
      } catch (err) {
        console.error('Erreur lors de la mise à jour du service:', err);
        setError(err.response?.data?.message || 'Une erreur est survenue');
      } finally {
        setSubmitting(false);
      }
    }
  });
  
  // Charger les données du service
  useEffect(() => {
    const fetchServiceData = async () => {
      setLoading(true);
      
      try {
        // Simulation de récupération de données
        // Dans un cas réel, on ferait un appel API
        // const response = await api.get(`/api/v1/services/${id}`);
        // const serviceData = response.data.data.service;
        
        // Données simulées pour l'exemple
        const serviceData = {
          title: 'Coaching sportif personnalisé',
          description: 'Programme adapté à vos objectifs et votre niveau actuel. Suivi personnalisé et ajustements réguliers. Le coaching comprend une évaluation initiale, un plan d\'entraînement sur mesure, et un suivi nutritionnel de base.',
          category: 'coaching',
          price: 50,
          duration: 60,
          location: 'Tunis Centre',
          address: '12 Avenue Habib Bourguiba, Tunis',
          benefits: [
            'Programme personnalisé selon vos objectifs',
            'Suivi et ajustements réguliers',
            'Conseils nutritionnels'
          ],
          availabilities: [
            {
              day: 'monday',
              slots: ['09:00', '11:00', '14:00']
            },
            {
              day: 'wednesday',
              slots: ['10:00', '15:00']
            }
          ]
        };
        
        // Mise à jour des valeurs du formulaire
        formik.setValues({
          title: serviceData.title,
          description: serviceData.description,
          category: serviceData.category,
          price: serviceData.price,
          duration: serviceData.duration,
          location: serviceData.location,
          address: serviceData.address
        });
        
        // Mise à jour des avantages
        setBenefits(serviceData.benefits);
        
        // Mise à jour des disponibilités
        setAvailabilities(serviceData.availabilities);
        
      } catch (err) {
        console.error('Erreur lors du chargement du service:', err);
        setError('Erreur lors du chargement des données du service');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceData();
  }, [id]);
  
  // Gérer les avantages
  const handleBenefitChange = (index, value) => {
    const updatedBenefits = [...benefits];
    updatedBenefits[index] = value;
    setBenefits(updatedBenefits);
  };
  
  const addBenefit = () => {
    setBenefits([...benefits, '']);
  };
  
  const removeBenefit = (index) => {
    if (benefits.length > 1) {
      const updatedBenefits = [...benefits];
      updatedBenefits.splice(index, 1);
      setBenefits(updatedBenefits);
    }
  };
  
  // Gérer les disponibilités
  const handleDayChange = (index, day) => {
    const updatedAvailabilities = [...availabilities];
    updatedAvailabilities[index].day = day;
    setAvailabilities(updatedAvailabilities);
  };
  
  const handleSlotChange = (dayIndex, slotIndex, value) => {
    const updatedAvailabilities = [...availabilities];
    updatedAvailabilities[dayIndex].slots[slotIndex] = value;
    setAvailabilities(updatedAvailabilities);
  };
  
  const addSlot = (dayIndex) => {
    const updatedAvailabilities = [...availabilities];
    updatedAvailabilities[dayIndex].slots.push('');
    setAvailabilities(updatedAvailabilities);
  };
  
  const removeSlot = (dayIndex, slotIndex) => {
    if (availabilities[dayIndex].slots.length > 1) {
      const updatedAvailabilities = [...availabilities];
      updatedAvailabilities[dayIndex].slots.splice(slotIndex, 1);
      setAvailabilities(updatedAvailabilities);
    }
  };
  
  const addAvailabilityDay = () => {
    setAvailabilities([
      ...availabilities,
      { day: 'tuesday', slots: ['09:00'] }
    ]);
  };
  
  const removeAvailabilityDay = (index) => {
    if (availabilities.length > 1) {
      const updatedAvailabilities = [...availabilities];
      updatedAvailabilities.splice(index, 1);
      setAvailabilities(updatedAvailabilities);
    }
  };
  
  if (loading) {
    return (
      <div className="create-service-page">
        <div className="container">
          <div className="loader-container">
            <Loader size="large" text="Chargement du service..." />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="create-service-page">
      <div className="container">
        <h1 className="page-title">Modifier le service</h1>
        
        {error && (
          <Alert type="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <Card className="mb-4">
            <h2 className="section-title">Informations générales</h2>
            
            <Input
              label="Titre"
              id="title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && formik.errors.title}
              placeholder="Ex: Coaching sportif personnalisé"
              required
            />
            
            <Textarea
              label="Description"
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && formik.errors.description}
              placeholder="Décrivez votre service en détail..."
              rows={5}
              required
            />
            
            <Select
              label="Catégorie"
              id="category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              options={categoryOptions}
              error={formik.touched.category && formik.errors.category}
              required
            />
            
            <div className="form-row">
              <Input
                label="Prix (TND)"
                type="number"
                id="price"
                name="price"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && formik.errors.price}
                placeholder="Ex: 50"
                min="0"
                step="0.01"
                required
              />
              
              <Input
                label="Durée (minutes)"
                type="number"
                id="duration"
                name="duration"
                value={formik.values.duration}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.duration && formik.errors.duration}
                placeholder="Ex: 60"
                min="15"
                step="5"
                required
              />
            </div>
            
            <div className="form-row">
              <Input
                label="Localisation"
                id="location"
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.location && formik.errors.location}
                placeholder="Ex: Tunis Centre"
                required
              />
              
              <Input
                label="Adresse complète"
                id="address"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && formik.errors.address}
                placeholder="Ex: 12 Avenue Habib Bourguiba, Tunis"
                required
              />
            </div>
          </Card>
          
          <Card className="mb-4">
            <h2 className="section-title">Ce que comprend ce service</h2>
            <p className="section-description">
              Listez les avantages et ce que les clients obtiennent en réservant ce service.
            </p>
            
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-item">
                <div className="benefit-icon">
                  <FiCheckSquare />
                </div>
                
                <Input
                  id={`benefit-${index}`}
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  placeholder="Ex: Programme personnalisé selon vos objectifs"
                  className="benefit-input"
                />
                
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeBenefit(index)}
                  disabled={benefits.length === 1}
                >
                  <FiMinus />
                </button>
              </div>
            ))}
            
            <button
              type="button"
              className="add-btn"
              onClick={addBenefit}
            >
              <FiPlus /> Ajouter un avantage
            </button>
          </Card>
          
          <Card className="mb-4">
            <h2 className="section-title">Disponibilités</h2>
            <p className="section-description">
              Définissez vos jours et créneaux horaires de disponibilité.
            </p>
            
            {availabilities.map((availability, dayIndex) => (
              <div key={dayIndex} className="availability-item">
                <div className="availability-header">
                  <Select
                    id={`day-${dayIndex}`}
                    value={availability.day}
                    onChange={(e) => handleDayChange(dayIndex, e.target.value)}
                    options={daysOptions}
                    className="day-select"
                  />
                  
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeAvailabilityDay(dayIndex)}
                    disabled={availabilities.length === 1}
                  >
                    <FiX />
                  </button>
                </div>
                
                <div className="slots-container">
                  {availability.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="slot-item">
                      <Input
                        type="time"
                        id={`slot-${dayIndex}-${slotIndex}`}
                        value={slot}
                        onChange={(e) => handleSlotChange(dayIndex, slotIndex, e.target.value)}
                        className="slot-input"
                      />
                      
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeSlot(dayIndex, slotIndex)}
                        disabled={availability.slots.length === 1}
                      >
                        <FiMinus />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    className="add-btn slot-add-btn"
                    onClick={() => addSlot(dayIndex)}
                  >
                    <FiPlus /> Ajouter un créneau
                  </button>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="add-btn"
              onClick={addAvailabilityDay}
            >
              <FiPlus /> Ajouter un jour
            </button>
          </Card>
          
          <div className="form-actions">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => navigate(`/services/${id}`)}
            >
              Annuler
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Mise à jour en cours...' : 'Enregistrer les modifications'}
              {!submitting && <FiSave />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditService;