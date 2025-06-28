import { useState, useEffect } from 'react';
import { Card, Form, Button, ListGroup, Alert, Dropdown } from 'react-bootstrap';
import { api, type Comment } from '~/lib/api';
import { useAuth } from '~/hooks/useAuth';

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const commentsData = await api.getComments(postId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || loading) return;

    setLoading(true);
    try {
      await api.createComment(postId, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim() || loading) return;

    setLoading(true);
    try {
      await api.updateComment(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent('');
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setLoading(true);
    try {
      await api.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  return (
    <Card className="mt-4" id="comments">
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-chat-dots me-2"></i>
          Comments ({comments.length})
        </h5>
      </Card.Header>
      <Card.Body>
        {/* Comment form */}
        {user ? (
          <Form onSubmit={handleSubmitComment} className="mb-4">
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <div className="d-flex justify-content-end mt-2">
              <Button 
                type="submit" 
                disabled={!newComment.trim() || loading}
                size="sm"
              >
                {loading ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </Form>
        ) : (
          <Alert variant="info" className="mb-4">
            Please <a href="/login">login</a> to leave a comment.
          </Alert>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-chat-dots fs-1 d-block mb-2"></i>
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <ListGroup variant="flush">
            {comments.map((comment) => (
              <ListGroup.Item key={comment.id} className="px-0">
                <div className="d-flex align-items-start">
                  {/* Avatar */}
                  <div className="me-3">
                    {comment.author_profile.profile_picture ? (
                      <img
                        src={api.getImageUrl(comment.author_profile.profile_picture)}
                        alt={comment.author_profile.user.username}
                        className="rounded-circle"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                        style={{ width: '40px', height: '40px' }}
                      >
                        {comment.author_profile.user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Comment content */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-1">
                        <a 
                          href={`/profile/${comment.author_profile.user.username}`}
                          className="text-decoration-none"
                        >
                          {comment.author_profile.user.username}
                        </a>
                      </h6>
                      
                      {/* Actions for comment owner */}
                      {user && user.user.id === comment.author_profile.user.id && (
                        <Dropdown>
                          <Dropdown.Toggle 
                            variant="link" 
                            size="sm" 
                            className="text-muted p-0 border-0"
                          >
                            <i className="bi bi-three-dots"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => startEditing(comment)}>
                              <i className="bi bi-pencil me-2"></i>
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-danger"
                            >
                              <i className="bi bi-trash me-2"></i>
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </div>

                    {/* Comment text or edit form */}
                    {editingComment === comment.id ? (
                      <Form onSubmit={(e) => { e.preventDefault(); handleEditComment(comment.id); }}>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          disabled={loading}
                        />
                        <div className="d-flex gap-2 mt-2">
                          <Button 
                            type="submit" 
                            size="sm" 
                            disabled={!editContent.trim() || loading}
                          >
                            Save
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={cancelEditing}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Form>
                    ) : (
                      <p className="mb-0 text-muted">{comment.content}</p>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}