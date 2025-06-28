import { useState } from 'react';
import { Card, Button, Badge, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router';
import { api, type Post } from '~/lib/api';
import { useAuth } from '~/hooks/useAuth';

interface PostCardProps {
  post: Post;
  onLikeChange?: () => void;
  onBookmarkChange?: () => void;
  showActions?: boolean;
}

export default function PostCard({ 
  post, 
  onLikeChange, 
  onBookmarkChange, 
  showActions = true 
}: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!user || loading) return;
    
    setLoading(true);
    try {
      await api.toggleLike(post.id);
      setLiked(!liked);
      onLikeChange?.();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user || loading) return;
    
    setLoading(true);
    try {
      if (bookmarked) {
        await api.deleteBookmarkByPost(post.id);
        setBookmarked(false);
      } else {
        await api.createBookmark(post.id, post.title);
        setBookmarked(true);
      }
      onBookmarkChange?.();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card className="h-100 shadow-sm border-0 hover-shadow">
      {post.image && (
        <Card.Img
          variant="top"
          src={api.getImageUrl(post.image)}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      
      <Card.Body className="d-flex flex-column">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                bg="secondary" 
                className="me-1 mb-1"
                as={Link}
                to={`/tag/${tag}`}
                style={{ textDecoration: 'none' }}
              >
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge bg="light" text="dark" className="me-1">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Title */}
        <Card.Title className="mb-2">
          <Link 
            to={`/post/${post.id}`} 
            className="text-decoration-none text-dark hover-primary"
          >
            {post.title}
          </Link>
        </Card.Title>

        {/* Content preview */}
        <Card.Text className="text-muted flex-grow-1">
          {truncateContent(post.content)}
        </Card.Text>

        {/* Author info */}
        <div className="d-flex align-items-center mb-3">
          <div className="me-2">
            {post.profile.profile_picture ? (
              <img
                src={api.getImageUrl(post.profile.profile_picture)}
                alt={post.profile.user.username}
                className="rounded-circle"
                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
              />
            ) : (
              <div 
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                style={{ width: '32px', height: '32px' }}
              >
                {post.profile.user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <small className="text-muted">
              By{' '}
              <Link 
                to={`/profile/${post.profile.user.username}`}
                className="text-decoration-none"
              >
                {post.profile.user.username}
              </Link>
            </small>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              {user && (
                <>
                  <Button
                    variant={liked ? "danger" : "outline-danger"}
                    size="sm"
                    onClick={handleLike}
                    disabled={loading}
                  >
                    <i className={`bi bi-heart${liked ? '-fill' : ''}`}></i>
                  </Button>
                  <Button
                    variant={bookmarked ? "warning" : "outline-warning"}
                    size="sm"
                    onClick={handleBookmark}
                    disabled={loading}
                  >
                    <i className={`bi bi-bookmark${bookmarked ? '-fill' : ''}`}></i>
                  </Button>
                </>
              )}
              <Button
                variant="outline-primary"
                size="sm"
                as={Link}
                to={`/post/${post.id}#comments`}
              >
                <i className="bi bi-chat"></i>
              </Button>
            </div>

            {/* Share dropdown */}
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                <i className="bi bi-share"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/post/' + post.id)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                >
                  <i className="bi bi-twitter me-2"></i>
                  Share on Twitter
                </Dropdown.Item>
                <Dropdown.Item 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/post/' + post.id)}`}
                  target="_blank"
                >
                  <i className="bi bi-facebook me-2"></i>
                  Share on Facebook
                </Dropdown.Item>
                <Dropdown.Item 
                  onClick={() => navigator.clipboard.writeText(window.location.origin + '/post/' + post.id)}
                >
                  <i className="bi bi-link me-2"></i>
                  Copy Link
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}