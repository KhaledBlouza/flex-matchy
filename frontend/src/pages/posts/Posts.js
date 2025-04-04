// src/pages/posts/Posts.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiUser, FiCalendar, FiEye } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';

const Posts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Simuler une requête API
    setTimeout(() => {
      const mockPosts = [
        {
          _id: 'p1',
          title: 'Conseils pour une alimentation équilibrée',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed maximus eros ac diam...',
          author: {
            _id: 'author1',
            firstName: 'Ahmed',
            lastName: 'Ben Ali',
            photo: null,
            role: 'coach'
          },
          category: 'nutrition',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          viewCount: 120,
          commentCount: 8
        },
        {
          _id: 'p2',
          title: 'Comment éviter les blessures pendant l\'entraînement',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed maximus eros ac diam...',
          author: {
            _id: 'author2',
            firstName: 'Sonia',
            lastName: 'Gharbi',
            photo: null,
            role: 'healthSpecialist'
          },
          category: 'fitness',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          viewCount: 85,
          commentCount: 3
        },
        {
          _id: 'p3',
          title: 'Nouvelles installations dans notre salle de sport',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed maximus eros ac diam...',
          author: {
            _id: 'author3',
            firstName: 'Mohamed',
            lastName: 'Trabelsi',
            photo: null,
            role: 'gymOwner'
          },
          category: 'actualités',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          viewCount: 67,
          commentCount: 2
        }
      ];
      
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Formater la date
  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };
  
  // Vérifier si l'utilisateur peut créer un post
  const canCreatePost = user && ['admin', 'coach', 'healthSpecialist', 'gymOwner'].includes(user.role);
  
  return (
    <div className="posts-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Actualités et Articles</h1>
          
          {canCreatePost && (
            <Button
              variant="primary"
              as={Link}
              to="/posts/create"
            >
              <FiPlus /> Créer un article
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="loader-container">
            <Loader text="Chargement des articles..." />
          </div>
        ) : error ? (
          <Alert type="danger">
            {error}
          </Alert>
        ) : posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map((post) => (
              <Card key={post._id} className="post-card">
                <div className="post-category">
                  <Badge type={
                    post.category === 'nutrition' ? 'success' :
                    post.category === 'fitness' ? 'primary' :
                    post.category === 'actualités' ? 'warning' : 'secondary'
                  }>
                    {post.category}
                  </Badge>
                </div>
                
                <h2 className="post-title">
                  <Link to={`/posts/${post._id}`}>
                    {post.title}
                  </Link>
                </h2>
                
                <div className="post-meta">
                  <div className="post-author">
                    <FiUser /> {post.author.firstName} {post.author.lastName}
                  </div>
                  <div className="post-date">
                    <FiCalendar /> {formatDate(post.createdAt)}
                  </div>
                  <div className="post-views">
                    <FiEye /> {post.viewCount} vues
                  </div>
                </div>
                
                <div className="post-excerpt">
                  {post.content}
                </div>
                
                <div className="post-footer">
                  <Link to={`/posts/${post._id}`} className="read-more">
                    Lire la suite
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="no-posts">
            <p>Aucun article disponible pour le moment.</p>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .posts-page {
          padding: 40px 0;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .page-title {
          margin: 0;
          color: var(--dark-color);
        }
        
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        
        .post-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .post-category {
          margin-bottom: 15px;
        }
        
        .post-title {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 1.5rem;
        }
        
        .post-title a {
          color: var(--dark-color);
          text-decoration: none;
          transition: var(--transition);
        }
        
        .post-title a:hover {
          color: var(--primary-color);
        }
        
        .post-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 15px;
          font-size: 0.9rem;
          color: var(--dark-gray-color);
        }
        
        .post-author,
        .post-date,
        .post-views {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .post-excerpt {
          flex-grow: 1;
          margin-bottom: 20px;
          color: var(--dark-gray-color);
          line-height: 1.5;
        }
        
        .post-footer {
          text-align: right;
        }
        
        .read-more {
          color: var(--primary-color);
          font-weight: 500;
          text-decoration: none;
          transition: var(--transition);
        }
        
        .read-more:hover {
          text-decoration: underline;
        }
        
        .loader-container {
          display: flex;
          justify-content: center;
          padding: 50px 0;
        }
        
        .no-posts {
          text-align: center;
          padding: 50px 0;
          background-color: var(--white-color);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
        }
        
        @media (max-width: 992px) {
          .posts-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 576px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .posts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Posts;