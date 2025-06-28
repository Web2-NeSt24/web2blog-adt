import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Container, Row, Col, Card, Button, Badge, Dropdown, Alert } from 'react-bootstrap';
import type { Route } from "../+types/detail";
import Layout from '~/components/Layout';
import CommentSection from '~/components/CommentSection';
import LoadingSpinner from '~/components/LoadingSpinner';
import ErrorAlert from '~/components/ErrorAlert';
import { api, type Post } from '~/lib/api';
import { useAuth } from '~/hooks/useAuth';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Post ${params.postId} - RustyPython` },
    { name: "description", content: "Read this amazing blog post on RustyPython" },
  ];
}

export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
      if (user) {
        checkLikeStatus();
        checkBookmarkStatus();
      }
    }
  }, [postId, user]);

  const loadPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const postData = await api.getPost(Number(postId));
      setPost(postData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const status = await api.getLikeStatus(Number(postId));
      setLiked(status.liked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const status = await api.getBookmarkStatus(Number(postId));
      setBookmarked(status.bookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleLike = async () => {
    if (!user || actionLoading) return;
    
    setActionLoading(true);
    try {
      await api.toggleLike(Number(postId));
      setLiked(!liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user || actionLoading || !post) return;
    
    setActionLoading(true);
    try {
      if (bookmarked) {
        await api.deleteBookmarkByPost(Number(postId));
        setBookmarked(false);
      } else {
        await api.createBookmark(Number(postId), post.title);
        setBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${postId}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await api.deletePost(Number(postId));
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || 'Check out this post';
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading post..." />
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <Container>
          <ErrorAlert error={error || 'Post not found'} />
          <div className="text-center mt-4">
            <Button variant="primary" as={Link} to="/">
              Back to Home
            </Button>
          </div>
        </Container>
      </Layout>
    );
  }

  const isOwner = user && user.user.id === post.profile.user.id;

  return (
    <Layout>
      <Container>
        <Row>
          <Col lg={8} className="mx-auto">
            {/* Post Header */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="flex-grow-1">
                  <h1 className="display-5 fw-bold mb-3">{post.title}</h1>
                  
                  {/* Author Info */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3">
                      {post.profile.profile_picture ? (
                        <img
                          src={api.getImageUrl(post.profile.profile_picture)}
                          alt={post.profile.user.username}
                          className="rounded-circle"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                          style={{ width: '48px', height: '48px' }}
                        >
                          {post.profile.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h6 className="mb-0">
                        <Link 
                          to={`/profile/${post.profile.user.username}`}
                          className="text-decoration-none"
                        >
                          {post.profile.user.username}
                        </Link>
                      </h6>
                      {post.profile.biography && (
                        <small className="text-muted">{post.profile.biography}</small>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-3">
                      {post.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          bg="secondary" 
                          className="me-2 mb-1"
                          as={Link}
                          to={`/tag/${tag}`}
                          style={{ textDecoration: 'none' }}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="d-flex gap-2">
                  {user && (
                    <>
                      <Button
                        variant={liked ? "danger" : "outline-danger"}
                        onClick={handleLike}
                        disabled={actionLoading}
                      >
                        <i className={`bi bi-heart${liked ? '-fill' : ''} me-1`}></i>
                        {liked ? 'Liked' : 'Like'}
                      </Button>
                      <Button
                        variant={bookmarked ? "warning" : "outline-warning"}
                        onClick={handleBookmark}
                        disabled={actionLoading}
                      >
                        <i className={`bi bi-bookmark${bookmarked ? '-fill' : ''} me-1`}></i>
                        {bookmarked ? 'Saved' : 'Save'}
                      </Button>
                    </>
                  )}

                  {/* Share Dropdown */}
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary">
                      <i className="bi bi-share me-1"></i>
                      Share
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleShare('twitter')}>
                        <i className="bi bi-twitter me-2"></i>
                        Twitter
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleShare('facebook')}>
                        <i className="bi bi-facebook me-2"></i>
                        Facebook
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleShare('copy')}>
                        <i className="bi bi-link me-2"></i>
                        Copy Link
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  {/* Owner Actions */}
                  {isOwner && (
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-primary">
                        <i className="bi bi-three-dots"></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={handleEdit}>
                          <i className="bi bi-pencil me-2"></i>
                          Edit Post
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleDelete} className="text-danger">
                          <i className="bi bi-trash me-2"></i>
                          Delete Post
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {post.image && (
              <div className="mb-4">
                <img
                  src={api.getImageUrl(post.image)}
                  alt={post.title}
                  className="img-fluid rounded shadow-sm"
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Post Content */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div 
                  className="post-content"
                  style={{ 
                    fontSize: '1.1rem', 
                    lineHeight: '1.7',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {post.content}
                </div>
              </Card.Body>
            </Card>

            {/* Comments Section */}
            <CommentSection postId={Number(postId)} />
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}