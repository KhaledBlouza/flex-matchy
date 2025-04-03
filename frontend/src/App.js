// frontend/src/App.js
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/profile/Profile';
import Dashboard from './pages/dashboard/Dashboard';
import Services from './pages/services/Services';
import ServiceDetail from './pages/services/ServiceDetail';
import CreateService from './pages/services/CreateService';
import EditService from './pages/services/EditService';
import Bookings from './pages/bookings/Bookings';
import BookingDetail from './pages/bookings/BookingDetail';
import Posts from './pages/posts/Posts';
import PostDetail from './pages/posts/PostDetail';
import CreatePost from './pages/posts/CreatePost';
import EditPost from './pages/posts/EditPost';
import Coaches from './pages/users/Coaches';
import HealthSpecialists from './pages/users/HealthSpecialists';
import Gyms from './pages/users/Gyms';
import SportFields from './pages/users/SportFields';
import UserDetail from './pages/users/UserDetail';
import Messages from './pages/messages/Messages';
import Conversation from './pages/messages/Conversation';
import Notifications from './pages/notifications/Notifications';
import Subscription from './pages/subscription/Subscription';
import SubscriptionPlans from './pages/subscription/SubscriptionPlans';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentCancel from './pages/payment/PaymentCancel';
import NotFound from './pages/NotFound';
import './App.css';

const App = () => {
  const { isAuthenticated, user, loading, checkAuth } = useAuth();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <div className="loading-container">Chargement...</div>;
  }

  // Composant de route protégée
  const ProtectedRoute = ({ element, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" />;
    }

    return element;
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/health-specialists" element={<HealthSpecialists />} />
          <Route path="/gyms" element={<Gyms />} />
          <Route path="/sport-fields" element={<SportFields />} />
          <Route path="/user/:id" element={<UserDetail />} />
          
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          
          <Route path="/subscription-plans" element={<SubscriptionPlans />} />
          
          {/* Routes protégées */}
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          
          <Route path="/bookings" element={<ProtectedRoute element={<Bookings />} />} />
          <Route path="/bookings/:id" element={<ProtectedRoute element={<BookingDetail />} />} />
          
          <Route path="/messages" element={<ProtectedRoute element={<Messages />} />} />
          <Route path="/messages/:id" element={<ProtectedRoute element={<Conversation />} />} />
          
          <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
          
          <Route path="/subscription" element={<ProtectedRoute element={<Subscription />} />} />
          
          <Route path="/payment/success" element={<ProtectedRoute element={<PaymentSuccess />} />} />
          <Route path="/payment/cancel" element={<ProtectedRoute element={<PaymentCancel />} />} />
          
          {/* Routes pour les fournisseurs de services */}
          <Route 
            path="/services/create" 
            element={
              <ProtectedRoute 
                element={<CreateService />} 
                allowedRoles={['coach', 'healthSpecialist', 'gymOwner']} 
              />
            } 
          />
          
          <Route 
            path="/services/edit/:id" 
            element={
              <ProtectedRoute 
                element={<EditService />} 
                allowedRoles={['coach', 'healthSpecialist', 'gymOwner']} 
              />
            } 
          />
          
          <Route 
            path="/posts/create" 
            element={
              <ProtectedRoute 
                element={<CreatePost />} 
                allowedRoles={['coach', 'healthSpecialist', 'gymOwner']} 
              />
            } 
          />
          
          <Route 
            path="/posts/edit/:id" 
            element={
              <ProtectedRoute 
                element={<EditPost />} 
                allowedRoles={['coach', 'healthSpecialist', 'gymOwner']} 
              />
            } 
          />
          
          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
