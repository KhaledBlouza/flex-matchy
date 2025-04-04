// frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode as jwt_decode } from 'jwt-decode';
import { toast } from 'react-toastify';
import api from '../services/api';

// Création du contexte d'authentification
const AuthContext = createContext();

// Custom hook pour utiliser le contexte d'authentification
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est connecté (appelé au chargement de l'application)
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      // Vérification du token JWT stocké
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Vérifier si le token est expiré
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp < currentTime) {
        // Token expiré, déconnexion
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Token valide, récupération des données utilisateur
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/api/v1/users/me');
      
      setUser(response.data.data.data);
      setIsAuthenticated(true);
    } catch (err) {
      // En cas d'erreur, réinitialiser l'état
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/v1/users/login', {
        email,
        password
      });
      
      const { token, data } = response.data;
      
      // Stockage du token JWT
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(data.user);
      setIsAuthenticated(true);
      setError(null);
      
      toast.success('Connexion réussie!');
      
      return data.user;
    } catch (err) {
      console.error('Erreur de connexion:', err);
      const errorMessage = err.response?.data?.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw errorMessage;
    }
  };

  // Fonction d'inscription
  const signup = async (userData) => {
    try {
      const response = await api.post('/api/v1/users/signup', userData);
      
      const { token, data } = response.data;
      
      // Stockage du token JWT
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(data.user);
      setIsAuthenticated(true);
      setError(null);
      
      toast.success('Inscription réussie!');
      
      return data.user;
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      const errorMessage = err.response?.data?.message || 'Échec de l\'inscription. Veuillez réessayer.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw errorMessage;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await api.get('/api/v1/users/logout');
      
      // Supprimer le token JWT
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast.success('Déconnexion réussie!');
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
      // Même en cas d'erreur, on déconnecte l'utilisateur côté client
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Fonction pour mot de passe oublié
  const forgotPassword = async (email) => {
    try {
      await api.post('/api/v1/users/forgotPassword', { email });
      toast.success('Instructions de réinitialisation envoyées par e-mail!');
    } catch (err) {
      console.error('Erreur de récupération de mot de passe:', err);
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw errorMessage;
    }
  };

  // Fonction pour réinitialiser le mot de passe
  const resetPassword = async (token, password, passwordConfirm) => {
    try {
      await api.patch(`/api/v1/users/resetPassword/${token}`, {
        password,
        passwordConfirm
      });
      toast.success('Mot de passe réinitialisé avec succès! Vous pouvez maintenant vous connecter.');
    } catch (err) {
      console.error('Erreur de réinitialisation du mot de passe:', err);
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw errorMessage;
    }
  };

  // Fonction pour mettre à jour le profil utilisateur
  const updateProfile = async (userData) => {
    try {
      const response = await api.patch('/api/v1/users/updateMe', userData);
      setUser(response.data.data.user);
      toast.success('Profil mis à jour avec succès!');
      return response.data.data.user;
    } catch (err) {
      console.error('Erreur de mise à jour du profil:', err);
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw errorMessage;
    }
  };

  // Fonction pour changer le mot de passe
  const updatePassword = async (passwordCurrent, password, passwordConfirm) => {
    try {
      const response = await api.patch('/api/v1/users/updateMyPassword', {
        passwordCurrent,
        password,
        passwordConfirm
      });
      
      const { token, data } = response.data;
      
      // Mise à jour du token JWT
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.success('Mot de passe mis à jour avec succès!');
    } catch (err) {
      console.error('Erreur de mise à jour du mot de passe:', err);
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw errorMessage;
    }
  };

  // Valeurs exposées par le contexte
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    checkAuth,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};