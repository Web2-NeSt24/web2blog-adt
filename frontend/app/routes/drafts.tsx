import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { useAuth } from '../context/AuthContext';

interface Draft {
  draft_post_id: number;
  title?: string;
  content?: string;
  created_at?: string;
}

const DraftsPage: React.FC = () => {
  const [drafts, setDrafts] = useState<number[]>([]);
  const [draftDetails, setDraftDetails] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchDrafts();
    }
  }, [isAuthenticated]);

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/drafts/', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setDrafts(data.draft_post_ids || []);
        
        // Fetch details for each draft
        for (const draftId of data.draft_post_ids || []) {
          fetchDraftDetails(draftId);
        }
      } else {
        setError('Failed to load drafts');
      }
    } catch (error) {
      setError('Network error loading drafts');
    } finally {
      setLoading(false);
    }
  };

  const fetchDraftDetails = async (draftId: number) => {
    try {
      const response = await fetch(`/api/post/by-id/${draftId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setDraftDetails(prev => ({
          ...prev,
          [draftId]: data
        }));
      }
    } catch (error) {
      console.error(`Failed to load draft ${draftId}:`, error);
    }
  };

  const deleteDraft = async (draftId: number) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      const response = await fetch(`/api/post/by-id/${draftId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setDrafts(prev => prev.filter(id => id !== draftId));
        setDraftDetails(prev => {
          const newDetails = { ...prev };
          delete newDetails[draftId];
          return newDetails;
        });
      } else {
        setError('Failed to delete draft');
      }
    } catch (error) {
      setError('Network error deleting draft');
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          You must be <a href="/auth">logged in</a> to view your drafts.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading drafts...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Drafts</h2>
        <Button variant="primary" href="/create-post">
          <i className="bi bi-plus-circle me-1"></i>
          New Post
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {drafts.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <i className="bi bi-file-earmark-text display-4 text-muted mb-3"></i>
            <h5>No drafts yet</h5>
            <p className="text-muted">Start writing your first post!</p>
            <Button variant="primary" href="/create-post">
              Create Post
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="row">
          {drafts.map(draftId => {
            const draft = draftDetails[draftId];
            return (
              <div key={draftId} className="col-md-6 col-lg-4 mb-4">
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-warning">Draft</span>
                      <small className="text-muted">
                        ID: {draftId}
                      </small>
                    </div>
                    
                    <Card.Title className="h5">
                      {draft?.title || 'Untitled Draft'}
                    </Card.Title>
                    
                    <Card.Text className="flex-grow-1">
                      {draft?.content ? (
                        draft.content.substring(0, 150) + 
                        (draft.content.length > 150 ? '...' : '')
                      ) : (
                        <em className="text-muted">No content yet</em>
                      )}
                    </Card.Text>
                    
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <Button 
                        variant="primary" 
                        size="sm"
                        href={`/edit-post/${draftId}`}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </Button>
                      
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => deleteDraft(draftId)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
};

export default DraftsPage;
