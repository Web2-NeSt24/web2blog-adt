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
import { PostCard } from "~/components/Card";

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
                          onClick={() => navigate("/post/edit/new")}
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
                        <Button variant="primary" onClick={() => navigate("/post/edit/new")}>
                          Create Your First Draft
                        </Button>
                      </div>
                    ) : (
                      <Row className="g-4">
                        {drafts.map((draft) => (
                          <Col md={6} lg={4} key={draft.id}>
                              <PostCard post={draft} redirect={`/post/edit/${draft.id}`} />
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
