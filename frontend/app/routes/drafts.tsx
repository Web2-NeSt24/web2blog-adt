import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { Post } from "../types/api";
import { makeAuthenticatedRequest } from "../utils/auth";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router";

const DraftsPage: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated (but wait for loading to complete)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch drafts
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDrafts = async () => {
      setError(null);
      setLoading(true);
      try {
        // First get the draft IDs
        const response = await makeAuthenticatedRequest("/api/drafts/");
        if (!response.ok) throw new Error("Failed to fetch drafts");
        
        const data = await response.json();
        const draftIds: number[] = data.draft_post_ids || [];
        
        if (draftIds.length === 0) {
          setDrafts([]);
          return;
        }

        // Fetch each draft's details
        const draftPromises = draftIds.map(async (id: number) => {
          const draftResponse = await makeAuthenticatedRequest(`/api/post/by-id/${id}`);
          if (!draftResponse.ok) {
            console.warn(`Failed to fetch draft ${id}`);
            return null;
          }
          return await draftResponse.json();
        });

        const draftResults = await Promise.all(draftPromises);
        const validDrafts = draftResults.filter((draft): draft is Post => draft !== null);
        setDrafts(validDrafts);
      } catch (err: any) {
        setError(err.message || "Failed to load drafts");
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [isAuthenticated]);

  const handleEditDraft = (draftId: number) => {
    // Navigate to create page with the draft ID as a query parameter
    navigate(`/create?draft=${draftId}`);
  };

  const handleDeleteDraft = async (draftId: number) => {
    if (!confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(`/api/post/by-id/${draftId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        // Remove the deleted draft from the list
        setDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== draftId));
      } else {
        throw new Error("Failed to delete draft");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete draft");
    }
  };

  const handlePublishDraft = async (draftId: number) => {
    if (!confirm("Are you sure you want to publish this draft? It will become visible to all users.")) {
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(`/api/drafts/${draftId}/publish/`, {
        method: "POST"
      });

      if (response.ok) {
        // Remove the published draft from the list and show success
        setDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== draftId));
        alert("Draft published successfully!");
      } else {
        throw new Error("Failed to publish draft");
      }
    } catch (err: any) {
      alert(err.message || "Failed to publish draft");
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading...</p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="text-center py-5">
        <p>Redirecting to login...</p>
      </Container>
    );
  }

  return (
    <main style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '2rem' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={11} lg={10} xl={9}>
            <Card style={{ borderRadius: '15px' }}>
              <Card.Header className="bg-primary text-white text-center py-3">
                <h4 className="mb-0">My Drafts</h4>
              </Card.Header>
              <Card.Body className="p-4">
                {loading && <LoadingSpinner />}
                {error && <div className="alert alert-danger">{error}</div>}
                
                {!loading && !error && (
                  <>
                    {/* Header with user info and count */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h6 className="text-muted mb-1">Drafts by {user?.username}</h6>
                        <p className="mb-0">{drafts.length} draft posts</p>
                      </div>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="success" 
                          onClick={() => navigate("/create")}
                        >
                          Create New Post
                        </Button>
                        <Button 
                          variant="outline-primary" 
                          onClick={() => navigate("/profile")}
                        >
                          Back to Profile
                        </Button>
                      </div>
                    </div>

                    {/* Drafts List */}
                    {drafts.length === 0 ? (
                      <div className="text-center py-5">
                        <div className="mb-3">
                          <svg 
                            width="64" 
                            height="64" 
                            fill="currentColor" 
                            className="text-muted"
                            viewBox="0 0 16 16"
                          >
                            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                          </svg>
                        </div>
                        <h5 className="text-muted mb-3">No drafts yet</h5>
                        <p className="text-muted mb-4">
                          Start writing your next post. Your drafts are automatically saved as you write.
                        </p>
                        <Button variant="primary" onClick={() => navigate("/create")}>
                          Create Your First Draft
                        </Button>
                      </div>
                    ) : (
                      <Row className="g-4">
                        {drafts.map((draft) => (
                          <Col md={6} lg={4} key={draft.id}>
                            <Card 
                              className="h-100 shadow-sm" 
                              style={{ transition: 'transform 0.2s' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              {draft.image && (
                                <Card.Img 
                                  variant="top" 
                                  src={draft.image} 
                                  style={{ height: '180px', objectFit: 'cover', cursor: 'pointer' }}
                                  onClick={() => handleEditDraft(draft.id)}
                                />
                              )}
                              <Card.Body className="d-flex flex-column">
                                {/* Draft status badge */}
                                <div className="mb-2">
                                  <span className="badge bg-warning text-dark">
                                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                                      <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                                    </svg>
                                    Draft
                                  </span>
                                </div>
                                
                                <Card.Title 
                                  className="h6 mb-2" 
                                  onClick={() => handleEditDraft(draft.id)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {draft.title || "Untitled Draft"}
                                </Card.Title>
                                
                                <Card.Text 
                                  className="small text-muted flex-grow-1"
                                  onClick={() => handleEditDraft(draft.id)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {draft.content?.length > 100 
                                    ? draft.content.substring(0, 100) + "..." 
                                    : draft.content || "No content yet..."}
                                </Card.Text>
                                
                                {/* Tags if any */}
                                {draft.tags && draft.tags.length > 0 && (
                                  <div className="mb-3">
                                    <div className="d-flex gap-1 flex-wrap">
                                      {draft.tags.slice(0, 3).map((tag) => (
                                        <span 
                                          key={tag} 
                                          className="badge bg-secondary small"
                                          style={{ fontSize: '0.7rem' }}
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                      {draft.tags.length > 3 && (
                                        <span className="badge bg-light text-dark small">
                                          +{draft.tags.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Action buttons */}
                                <div className="mt-auto">
                                  <div className="d-grid gap-2">
                                    <Button 
                                      variant="primary" 
                                      size="sm"
                                      onClick={() => handleEditDraft(draft.id)}
                                    >
                                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L8.5 11.207l-3 1a.5.5 0 0 1-.64-.64l1-3L12.146.146ZM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5Zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5Z"/>
                                      </svg>
                                      Continue Writing
                                    </Button>
                                    <div className="d-flex gap-1">
                                      <Button 
                                        variant="success" 
                                        size="sm"
                                        onClick={() => handlePublishDraft(draft.id)}
                                        disabled={!draft.title?.trim() || !draft.content?.trim()}
                                        className="flex-grow-1"
                                      >
                                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
                                        </svg>
                                        Publish
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => handleDeleteDraft(draft.id)}
                                      >
                                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                          <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                        </svg>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default DraftsPage;
