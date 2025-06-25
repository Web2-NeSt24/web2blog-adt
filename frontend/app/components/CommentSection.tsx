import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import LikeButton from './LikeButton';

interface Comment {
  id: number;
  content: string;
  author_profile?: {
    user: {
      username: string;
    };
  };
  author_name?: string;
  created_at?: string;
}

interface CommentSectionProps {
  postId: number;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  postId, 
  initialLikeCount = 0, 
  initialIsLiked = false 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showComments, setShowComments] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/post/${postId}/comments/`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        setError('Failed to load comments');
      }
    } catch (error) {
      setError('Network error loading comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, postId]);

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      setLoading(true);
    }
  };

  return (
    <Card className="mt-3">
      <Card.Body>
        {/* Like Button and Comment Toggle */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <LikeButton 
            postId={postId}
            initialLikeCount={initialLikeCount}
            initialIsLiked={initialIsLiked}
          />
          
          <Button
            variant="outline-primary"
            size="sm"
            onClick={toggleComments}
          >
            <i className="bi bi-chat me-1"></i>
            {showComments ? 'Hide Comments' : `Show Comments (${comments.length})`}
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <>
            {/* Comment Form */}
            <CommentForm 
              postId={postId}
              onCommentAdded={handleCommentAdded}
            />
            
            <hr />
            
            {/* Comments List */}
            {loading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading comments...</span>
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : comments.length === 0 ? (
              <p className="text-muted text-center py-3">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div>
                <h6 className="mb-3">{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h6>
                {comments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default CommentSection;
