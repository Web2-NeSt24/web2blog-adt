import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { makeAuthenticatedRequest } from "../utils/auth";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router";
import { PostCard } from "~/components/Card";
import type { Post, Profile } from "~/types/api";
interface Bookmark {
  id: number,
  post: Post,
  creator_profile: Profile,
  title: string,
}

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
                              <PostCard post={bookmark.post} />
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
