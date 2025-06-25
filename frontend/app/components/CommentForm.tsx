import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { useAuth } from '../context/AuthContext';

interface CommentFormProps {
  postId: number;
  onCommentAdded: (comment: any) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();

  const getCsrfToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }

    if (!isAuthenticated && !authorName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        setError('Unable to get CSRF token. Please refresh the page.');
        return;
      }
      
      const requestBody = {
        content: content.trim(),
        ...(isAuthenticated ? {} : { author_name: authorName.trim() })
      };

      const response = await fetch(`/api/post/${postId}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const newComment = await response.json();
        onCommentAdded(newComment);
        setContent('');
        if (!isAuthenticated) {
          setAuthorName('');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to post comment');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-3">
      {error && <Alert variant="danger">{error}</Alert>}
      
      {!isAuthenticated && (
        <Form.Group className="mb-3">
          <Form.Label>Your Name</Form.Label>
          <Form.Control
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </Form.Group>
      )}
      
      <Form.Group className="mb-3">
        <Form.Label>
          {isAuthenticated ? `Comment as ${user?.username}` : 'Your Comment'}
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment here..."
          required
        />
      </Form.Group>
      
      <Button 
        type="submit" 
        variant="primary"
        disabled={isLoading}
      >
        {isLoading ? 'Posting...' : 'Post Comment'}
      </Button>
    </Form>
  );
};

export default CommentForm;
