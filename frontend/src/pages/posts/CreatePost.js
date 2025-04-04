// src/pages/posts/CreatePost.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  // Options pour les catégories
  const categoryOptions = [
    { value: '', label: 'Sélectionner une catégorie' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'actualités', label: 'Actualités' },
    { value: 'conseils', label: 'Conseils' },
    { value: 'bien-être', label: 'Bien-être' }
  ];

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Simuler un appel API
      // Dans un cas réel, on ferait un appel API
      // const response = await api.post('/api/v1/posts', {
      //   ...formData,
      //   tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      // });
      
      setTimeout(() => {
        setLoading(false);
        navigate('/posts');
      }, 1000);
    } catch (err) {
      setError('Une erreur est survenue lors de la création du post');
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="container">
        <h1 className="page-title">Créer un nouvel article</h1>
        
        {error && (
          <Alert type="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        <Card>
          <form onSubmit={handleSubmit}>
            <Input
              label="Titre"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Titre de l'article"
              required
            />
            
            <Select
              label="Catégorie"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
              required
            />
            
            <Textarea
              label="Contenu"
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="12"
              placeholder="Contenu de l'article..."
              required
            />
            
            <Input
              label="Tags (séparés par des virgules)"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="nutrition, santé, sport..."
            />
            
            <div className="form-actions">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/posts')}
              >
                <FiX /> Annuler
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Publication en cours...' : 'Publier l\'article'}
                {!loading && <FiSave />}
              </Button>
            </div>
          </form>
        </Card>
      </div>
      
      <style jsx>{`
        .create-post-page {
          padding: 40px 0;
        }
        
        .page-title {
          margin-bottom: 30px;
          color: var(--dark-color);
        }
        
        .mb-4 {
          margin-bottom: 20px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 30px;
        }
      `}</style>
    </div>
  );
};

export default CreatePost;