import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router';
import type { Route } from "./+types/drafts";
import Layout from '~/components/Layout';
import LoadingSpinner from '~/components/LoadingSpinner';
import { api, type Post } from '~/lib/api';
import { useAuth } from '~/hooks/useAuth';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Drafts - RustyPython" },
    { name: "description", content: "Manage your draft posts on RustyPython" },
  ];
}

export default function Drafts() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDrafts();
    }
  }, [user]);

  const loadDrafts = async () => {
    setLoading(true);
    setError(null);
    try {
      const draftsData = await api.getDrafts();
      const draftPromises = draftsData.draft_post_ids.map((id: number) => api.getPost(id));
      const draftsArray = await Promise.all(draftPromises);
      setDrafts(draftsArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (draftId: number) => {
    try {
      await api.publishDraft(draftId);
      await loadDrafts(); // Refresh the list
    } catch (error) {
      console.error('Error publishing draft:', error);
    }
  };

  const handleDelete = async (draftId: number) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    
    try {
      await api.deletePost(draftId);
      await loadDrafts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  if (!user) {
    return (
      <Layout>
        <Container>
          <Alert variant="warning">
            Please <Link to="/login">login</Link> to view your drafts.
          </Alert>
        </Container>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading your drafts..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="bi bi-file-earmark-text me-2"></i>
            My Drafts
          </h2>
          <Button variant="primary" as={Link} to="/write">
            <i className="bi bi-plus-lg me-1"></i>
            New Post
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {drafts.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-file-earmark-plus display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No drafts yet</h4>
            <p className="text-muted mb-4">
              Start writing and save your work as drafts before publishing.
            </p>
            <Button variant="primary" as={Link} to="/write">
              Create Your First Draft
            </Button>
          </div>
        ) : (
          <Row>
            {drafts.map((draft) => (
              <Col key={draft.id} lg={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0">
                        {draft.title || 'Untitled Draft'}
                      </h5>
                      <span className="badge bg-warning text-dark">Draft</span>
                    </div>
                    
                    <p className="card-text text-muted">
                      {draft.content 
                        ? draft.content.substring(0, 150) + (draft.content.length > 150 ? '...' : '')
                        : 'No content yet...'
                      }
                    </p>

                    {draft.tags && draft.tags.length > 0 && (
                      <div className="mb-3">
                        {draft.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="badge bg-secondary me-1">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-auto">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        as={Link}
                        to={`/edit/${draft.id}`}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </Button>
                      
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handlePublish(draft.id)}
                        disabled={!draft.title.trim() || !draft.content.trim()}
                      >
                        <i className="bi bi-send me-1"></i>
                        Publish
                      </Button>
                      
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(draft.id)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </Layout>
  );
}