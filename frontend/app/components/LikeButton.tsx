import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../context/AuthContext';

interface LikeButtonProps {
  postId: number;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  postId, 
  initialLikeCount = 0, 
  initialIsLiked = false 
}) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const getCsrfToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : null;
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/auth';
      return;
    }

    setIsLoading(true);
    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        console.error('CSRF token not found');
        return;
      }

      const response = await fetch(`/api/post/${postId}/like/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });

      if (response.ok) {
        // Toggle like state
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      } else {
        console.error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isLiked ? "danger" : "outline-danger"}
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className="d-flex align-items-center"
    >
      <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
      {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
    </Button>
  );
};

export default LikeButton;
