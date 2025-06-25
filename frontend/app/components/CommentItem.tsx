import React from 'react';
import Card from 'react-bootstrap/Card';

interface Comment {
  id: number;
  content: string;
  author_profile?: {
    user: {
      username: string;
    };
  };
  author_name?: string; // For anonymous comments
  created_at?: string;
}

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const authorName = comment.author_profile?.user.username || comment.author_name || 'Anonymous';
  
  return (
    <Card className="mb-2">
      <Card.Body className="py-2">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <strong className="text-primary me-2">{authorName}</strong>
              {comment.created_at && (
                <small className="text-muted">
                  {new Date(comment.created_at).toLocaleDateString()}
                </small>
              )}
            </div>
            <p className="mb-0">{comment.content}</p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CommentItem;
