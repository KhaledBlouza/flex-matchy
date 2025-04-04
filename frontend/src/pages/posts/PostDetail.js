// src/pages/posts/PostDetail.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiUser, FiCalendar, FiEye, FiMessageSquare, FiEdit, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Simuler une requête API
    setTimeout(() => {
      const mockPost = {
        _id: id,
        title: 'Conseils pour une alimentation équilibrée',
        content: `
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc sapien lacinia nunc, vitae lacinia nisl nunc sit amet nunc. Sed vitae nunc vitae nisl ultricies aliquam. Nullam auctor, nisl eget ultricies aliquam, nunc sapien lacinia nunc, vitae lacinia nisl nunc sit amet nunc.</p>
          
          <h2>Les bases d'une alimentation équilibrée</h2>
          
          <p>Sed vitae nunc vitae nisl ultricies aliquam. Nullam auctor, nisl eget ultricies aliquam, nunc sapien lacinia nunc, vitae lacinia nisl nunc sit amet nunc. Sed vitae nunc vitae nisl ultricies aliquam. Nullam auctor, nisl eget ultricies aliquam, nunc sapien lacinia nunc, vitae lacinia nisl nunc sit amet nunc.</p>
          
          <ul>
            <li>Mangez des fruits et légumes à chaque repas</li>
            <li>Privilégiez les protéines maigres</li>
            <li>Limitez les aliments transformés</li>
            <li>Buvez suffisamment d'eau</li>
          </ul>
          
          <h2>L'importance des macronutriments</h2>
          
          <p>Nullam auctor, nisl eget ultricies aliquam, nunc sapien lacinia nunc, vitae lacinia nisl nunc sit amet nunc. Sed vitae nunc vitae nisl ultricies aliquam. Nullam auctor, nisl eget ultricies aliquam, nunc sapien lacinia nunc, vitae lacinia nisl nunc sit amet nunc.</p>
        `,
        author: {
          _id: 'author1',
          firstName: 'Ahmed',
          lastName: 'Ben Ali',
          photo: null,
          role: 'coach',
          bio: 'Coach sportif certifié avec plus de 10 ans d\'expérience'
        },
        category: 'nutrition',
        tags: ['alimentation', 'nutrition', 'santé'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        viewCount: 120,
        commentCount: 8,
        comments: [
          {
            _id: 'c1',
            user: {
              _id: 'user1',
              firstName: 'Sarah',
              lastName: 'Miled',
              photo: null
            },
            content: 'Super article ! J\'ai appris beaucoup de choses utiles.',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            _id: 'c2',
            user: {
              _id: 'user2',
              firstName: 'Karim',
              lastName: 'Hmidi',
              photo: null
            },
            content: 'Merci pour ces conseils pratiques !',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      };
      
      setPost(mockPost);
      setLoading(false);
    }, 1000);
  }, [id]);
  
  // Formater la date
  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };
  
  // Vérifier si l'utilisateur est l'auteur du post
  const isAuthor = user && post && user._id === post.author._id;
  
  return (
    <div className="post-detail-page">
      <div className="container">
        {loading ? (
          <div className="loader-container">
            <Loader text="Chargement de l'article..." />
          </div>
        ) : error ? (
          <div>
            <Alert type="danger">
              {error}
            </Alert>
            <Button
              variant="outline-primary"
              onClick={() => navigate('/posts')}
              className="mt-3"
            >
              <FiChevronLeft /> Retour aux articles
            </Button>
          </div>
        ) : post ? (
          <>
            <div className="back-link">
              <Link to="/posts">
                <FiChevronLeft /> Retour aux articles
              </Link>
            </div>
            
            <article className="post-content">
              <header className="post-header">
                <div className="post-category">
                  <Badge type={
                    post.category === 'nutrition' ? 'success' :
                    post.category === 'fitness' ? 'primary' :
                    post.category === 'actualités' ? 'warning' : 'secondary'
                  }>
                    {post.category}
                  </Badge>
                </div>
                
                <h1 className="post-title">{post.title}</h1>
                
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
                  <div className="post-comments">
                    <FiMessageSquare /> {post.commentCount} commentaires
                  </div>
                </div>
                
                {isAuthor && (
                  <div className="post-actions">
                    <Button
                      variant="outline-primary"
                      size="small"
                      as={Link}
                      to={`/posts/edit/${post._id}`}
                    >
                      <FiEdit /> Modifier
                    </Button>
                  </div>
                )}
              </header>
              
              <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content }} />
              
              <footer className="post-footer">
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    <span>Tags: </span>
                    {post.tags.map((tag, index) => (
                      <Badge key={index} type="light" className="tag-badge">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </footer>
            </article>
            
            <div className="post-author-bio">
              <Card className="author-card">
                <div className="author-info">
                  <div className="author-avatar">
                    {post.author.photo ? (
                      <img src={`/img/users/${post.author.photo}`} alt={`${post.author.firstName} ${post.author.lastName}`} />
                    ) : (
                      <div className="avatar-placeholder">
                        {post.author.firstName.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="author-details">
                    <h3>{post.author.firstName} {post.author.lastName}</h3>
                    <div className="author-role">
                      {post.author.role === 'coach' ? 'Coach sportif' :
                       post.author.role === 'healthSpecialist' ? 'Spécialiste de santé' :
                       post.author.role === 'gymOwner' ? 'Propriétaire de salle' : 'Auteur'}
                    </div>
                    {post.author.bio && (
                      <p className="author-bio">{post.author.bio}</p>
                    )}
                    <Button
                      variant="outline-primary"
                      size="small"
                      as={Link}
                      to={`/user/${post.author._id}`}
                    >
                      Voir le profil
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="post-comments-section">
              <h2 className="comments-title">Commentaires ({post.comments.length})</h2>
              
              {post.comments.length > 0 ? (
                <div className="comments-list">
                  {post.comments.map((comment) => (
                    <Card key={comment._id} className="comment-card">
                      <div className="comment-header">
                        <div className="comment-author">
                          <div className="comment-avatar">
                            {comment.user.photo ? (
                              <img src={`/img/users/${comment.user.photo}`} alt={`${comment.user.firstName} ${comment.user.lastName}`} />
                            ) : (
                              <div className="avatar-placeholder">
                                {comment.user.firstName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="comment-author-info">
                            <h4>{comment.user.firstName} {comment.user.lastName}</h4>
                            <div className="comment-date">
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="comment-body">
                        <p>{comment.content}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="no-comments">Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
              )}
              
              {user ? (
                <Card className="comment-form-card">
                  <h3>Laisser un commentaire</h3>
                  <form className="comment-form">
                    <div className="form-group">
                      <textarea
                        rows="4"
                        placeholder="Votre commentaire..."
                        className="form-control"
                      ></textarea>
                    </div>
                    <Button type="submit" variant="primary">
                      Publier
                    </Button>
                  </form>
                </Card>
              ) : (
                <div className="login-to-comment">
                  <p>
                    <Link to="/login">Connectez-vous</Link> pour laisser un commentaire.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <Alert type="danger">
              Article introuvable
            </Alert>
            <Button
              variant="outline-primary"
              onClick={() => navigate('/posts')}
              className="mt-3"
            >
              <FiChevronLeft /> Retour aux articles
            </Button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .post-detail-page {
          padding: 40px 0;
        }
        
        .back-link {
          margin-bottom: 30px;
        }
        
        .back-link a {
          display: inline-flex;
          align-items: center;
          color: var(--dark-gray-color);
          text-decoration: none;
          transition: var(--transition);
        }
        
        .back-link a:hover {
          color: var(--primary-color);
        }
        
        .post-content {
          background-color: var(--white-color);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          padding: 40px;
          margin-bottom: 30px;
        }
        
        .post-header {
          margin-bottom: 30px;
        }
        
        .post-category {
          margin-bottom: 15px;
        }
        
        .post-title {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 2.5rem;
          color: var(--dark-color);
        }
        
        .post-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 20px;
          color: var(--dark-gray-color);
        }
        
        .post-author,
        .post-date,
        .post-views,
        .post-comments {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .post-actions {
          margin-top: 15px;
        }
        
        .post-body {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--dark-color);
        }
        
        .post-body h2 {
          margin: 30px 0 15px;
          color: var(--dark-color);
        }
        
        .post-body p {
          margin-bottom: 20px;
        }
        
        .post-body ul, .post-body ol {
          margin-bottom: 20px;
          padding-left: 30px;
        }
        
        .post-body li {
          margin-bottom: 10px;
        }
        
        .post-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid var(--gray-color);
        }
        
        .post-tags {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          color: var(--dark-gray-color);
        }
        
        .tag-badge {
          font-size: 0.8rem;
        }
        
        .author-card {
          padding: 30px;
        }
        
        .author-info {
          display: flex;
          align-items: flex-start;
        }
        
        .author-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 20px;
          background-color: var(--primary-color);
          color: var(--white-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: bold;
        }
        
        .author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .author-details {
          flex: 1;
        }
        
        .author-details h3 {
          margin: 0 0 5px;
          font-size: 1.3rem;
          color: var(--dark-color);
        }
        
        .author-role {
          margin-bottom: 10px;
          color: var(--dark-gray-color);
        }
        
        .author-bio {
          margin-bottom: 15px;
          line-height: 1.5;
          color: var(--dark-gray-color);
        }
        
        .comments-title {
          margin: 40px 0 20px;
          font-size: 1.5rem;
          color: var(--dark-color);
        }
        
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .comment-card {
          padding: 20px;
        }
        
        .comment-header {
          margin-bottom: 15px;
        }
        
        .comment-author {
          display: flex;
          align-items: center;
        }
        
        .comment-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 15px;
          background-color: var(--primary-color);
          color: var(--white-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
        }
        
        .comment-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .comment-author-info h4 {
          margin: 0 0 5px;
          font-size: 1rem;
          color: var(--dark-color);
        }
        
        .comment-date {
          font-size: 0.8rem;
          color: var(--dark-gray-color);
        }
        
        .comment-body p {
          margin: 0;
          color: var(--dark-color);
          line-height: 1.6;
        }
        
        .no-comments {
          text-align: center;
          padding: 30px;
          background-color: var(--white-color);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          color: var(--dark-gray-color);
        }
        
        .comment-form-card {
          padding: 20px;
        }
        
        .comment-form-card h3 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 1.2rem;
          color: var(--dark-color);
        }
        
        .comment-form .form-group {
          margin-bottom: 15px;
        }
        
        .form-control {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--gray-color);
          border-radius: var(--border-radius);
          font-family: inherit;
          font-size: 16px;
          transition: var(--transition);
        }
        
        .form-control:focus {
          outline: none;
          border-color: var(--primary-color);
        }
        
        .login-to-comment {
          text-align: center;
          padding: 20px;
          background-color: var(--white-color);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
        }
        
        .login-to-comment p {
          margin: 0;
          color: var(--dark-gray-color);
        }
        
        .login-to-comment a {
          color: var(--primary-color);
          font-weight: 500;
        }
        
        .mt-3 {
          margin-top: 15px;
        }
        
        .loader-container {
          display: flex;
          justify-content: center;
          padding: 50px 0;
        }
        
        @media (max-width: 768px) {
          .post-content {
            padding: 20px;
          }
          
          .post-title {
            font-size: 1.8rem;
          }
          
          .post-meta {
            font-size: 0.9rem;
          }
          
          .post-body {
            font-size: 1rem;
          }
          
          .author-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .author-avatar {
            margin-right: 0;
            margin-bottom: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default PostDetail;