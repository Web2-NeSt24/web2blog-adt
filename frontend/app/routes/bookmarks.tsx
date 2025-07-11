import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { Bookmark } from "../types/api";
import { makeAuthenticatedRequest } from "../utils/auth";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router";

const BookmarksPage: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated (but wait for loading to complete)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch bookmarks
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchBookmarks = async () => {
      setError(null);
      setLoading(true);
      try {
        const response = await makeAuthenticatedRequest("/api/bookmarks/");
        if (!response.ok) throw new Error("Failed to fetch bookmarks");
        
        const bookmarksData: Bookmark[] = await response.json();
        setBookmarks(bookmarksData);
      } catch (err: any) {
        setError(err.message || "Failed to load bookmarks");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
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
                <h4 className="mb-0">My Bookmarks</h4>
              </Card.Header>
              <Card.Body className="p-4">
                {loading && <LoadingSpinner />}
                {error && <div className="alert alert-danger">{error}</div>}
                
                {!loading && !error && (
                  <>
                    {/* Header with user info and count */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h6 className="text-muted mb-1">Saved by {user?.username}</h6>
                        <p className="mb-0">{bookmarks.length} bookmarked posts</p>
                      </div>
                      <Button 
                        variant="outline-primary" 
                        onClick={() => navigate("/profile")}
                      >
                        Back to Profile
                      </Button>
                    </div>

                    {/* Bookmarks List */}
                    {bookmarks.length === 0 ? (
                      <div className="text-center py-5">
                        <div className="mb-3">
                          <svg 
                            width="64" 
                            height="64" 
                            fill="currentColor" 
                            className="text-muted"
                            viewBox="0 0 16 16"
                          >
                            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                          </svg>
                        </div>
                        <h5 className="text-muted mb-3">No bookmarks yet</h5>
                        <p className="text-muted mb-4">
                          When you bookmark posts, they'll appear here for easy access.
                        </p>
                        <Button variant="primary" onClick={() => navigate("/")}>
                          Explore Posts
                        </Button>
                      </div>
                    ) : (
                      <Row className="g-4">
                        {bookmarks.map((bookmark) => (
                          <Col md={6} lg={4} key={bookmark.id}>
                            <Card 
                              className="h-100 shadow-sm" 
                              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              {bookmark.post.image && (
                                <Card.Img 
                                  variant="top" 
                                  src={bookmark.post.image} 
                                  style={{ height: '180px', objectFit: 'cover' }}
                                  onClick={() => navigate(`/post/${bookmark.post.id}`)}
                                />
                              )}
                              <Card.Body className="d-flex flex-column">
                                {/* Bookmark title section */}
                                {bookmark.title && (
                                  <div className="mb-2 p-2 bg-light rounded">
                                    <small className="text-muted d-block">My bookmark:</small>
                                    <strong className="text-primary">{bookmark.title}</strong>
                                  </div>
                                )}
                                
                                <div className="mb-2">
                                  <small className="text-muted">
                                    by {bookmark.post.profile.user.username}
                                  </small>
                                </div>
                                
                                <Card.Title 
                                  className="h6 mb-2" 
                                  onClick={() => navigate(`/post/${bookmark.post.id}`)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {bookmark.post.title}
                                </Card.Title>
                                
                                <Card.Text 
                                  className="small text-muted flex-grow-1"
                                  onClick={() => navigate(`/post/${bookmark.post.id}`)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {bookmark.post.content?.length > 100 
                                    ? bookmark.post.content.substring(0, 100) + "..." 
                                    : bookmark.post.content || "No content"}
                                </Card.Text>
                                
                                {/* Post stats and actions */}
                                <div className="mt-2 pt-2 border-top">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center gap-3">
                                      <span className="small text-muted">
                                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                                          <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                                        </svg>
                                        {bookmark.post.like_count}
                                      </span>
                                      <span className="small text-muted">
                                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                                          <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                        </svg>
                                        {bookmark.post.comment_count}
                                      </span>
                                    </div>
                                    
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm"
                                      onClick={() => navigate(`/post/${bookmark.post.id}`)}
                                    >
                                      Read
                                    </Button>
                                  </div>
                                  
                                  {/* Tags */}
                                  {bookmark.post.tags.length > 0 && (
                                    <div className="d-flex gap-1 flex-wrap">
                                      {bookmark.post.tags.slice(0, 3).map((tag) => (
                                        <span 
                                          key={tag} 
                                          className="badge bg-secondary small"
                                          style={{ fontSize: '0.7rem' }}
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                      {bookmark.post.tags.length > 3 && (
                                        <span className="badge bg-light text-dark small">
                                          +{bookmark.post.tags.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
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

export default BookmarksPage;
