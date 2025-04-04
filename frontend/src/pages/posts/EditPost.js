// src/pages/posts/EditPost.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Loader from '../../components/ui/Loader';

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  // Récupérer les données du post
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      
      try {
        // Simuler une requête API
        setTimeout(() => {
          const mockPost = {
            _id: id,
            title: 'Conseils pour une alimentation équilibrée',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc sapien lacinia nunc, vitae lacinia nisl nunc sit amet nunc. Sed vitae nunc vitae nisl ultricies aliquam.',
            category: 'nutrition',
            tags: ['alimentation', 'nutrition', 'santé']
          };
          
          setFormData({
            title: mockPost.title,
            content: mockPost.content,
            category: mockPost.category,
            tags: mockPost.tags.join(', ')
          });
          
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Une erreur est survenue lors du chargement de l\'article');
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);

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
    
    setSubmitting(true);
    setError('');
    
    try {
      // Simuler un appel API
      // Dans un cas réel, on ferait un appel API
      // const response = await api.patch(`/api/v1/posts/${id}`, {
      //   ...formData,
      //   tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      // });
      
      setTimeout(() => {
        setSubmitting(false);
        navigate(`/posts/${id}`);
      }, 1000);
    } catch (err) {
      setError('Une erreur est survenue lors de la modification de l\'article');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-post-page">
        <div className="container">
          <div className="loader-container">
            <Loader text="Chargement de l'article..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-post-page">
      <div className="container">
        <h1 className="page-title">Modifier l'article</h1>
        
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
                onClick={() => navigate(`/posts/${id}`)}
              >
                <FiX /> Annuler
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
        </Card>
      </div>
      
      <style jsx>{`
        .edit-post-page {
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
        
        .loader-container {
          display: flex;
          justify-content: center;
          padding: 50px 0;
        }
      `}</style>
    </div>
  );
};

export default EditPost;