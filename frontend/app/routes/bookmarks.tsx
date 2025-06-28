import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router';
import type { Route } from "./+types/bookmarks";
import Layout from '~/components/Layout';
import LoadingSpinner from '~/components/LoadingSpinner';
import { api, type Bookmark } from '~/lib/api';
import { useAuth } from '~/hooks/useAuth';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Bookmarks - RustyPython" },
    { name: "description", content: "View and manage your bookmarked posts on RustyPython" },
  ];
}

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user]);

  const loadBookmarks = async () => {
    setLoading(true);
    setError(null);
    try {
      const bookmarksData = await api.getBookmarks();
      setBookmarks(bookmarksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBookmark = async (bookmarkId: number) => {
    try {
      await api.updateBookmark(bookmarkId, editTitle);
      setEditingBookmark(null);
      setEditTitle('');
      await loadBookmarks();
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: number) => {
    if (!confirm('Are you sure you want to remove this bookmark?')) return;
    
    try {
      await api.deleteBookmark(bookmarkId);
      await loadBookmarks();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const startEditing = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark.id);
    setEditTitle(bookmark.title);
  };

  const cancelEditing = () => {
    setEditingBookmark(null);
    setEditTitle('');
  };

  if (!user) {
    return (
      <Layout>
        <Container>
          <Alert variant="warning">
            Please <Link to="/login">login</Link> to view your bookmarks.
          </Alert>
        </Container>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading your bookmarks..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="bi bi-bookmark-heart me-2"></i>
            My Bookmarks
          </h2>
          <Button variant="outline-primary" as={Link} to="/explore">
            <i className="bi bi-search me-1"></i>
            Discover Posts
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {bookmarks.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-bookmark-x display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No bookmarks yet</h4>
            <p className="text-muted mb-4">
              Start bookmarking posts you want to read later or reference again.
            </p>
            <Button variant="primary" as={Link} to="/explore">
              Explore Posts to Bookmark
            </Button>
          </div>
        ) : (
          <Row>
            {bookmarks.map((bookmark) => (
              <Col key={bookmark.id} lg={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-shadow">
                  {bookmark.post.image && (
                    <Card.Img
                      variant="top"
                      src={api.getImageUrl(bookmark.post.image)}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  
                  <Card.Body className="d-flex flex-column">
                    {/* Bookmark Title */}
                    <div className="mb-2">
                      {editingBookmark === bookmark.id ? (
                        <Form onSubmit={(e) => { e.preventDefault(); handleEditBookmark(bookmark.id); }}>
                          <div className="d-flex gap-2">
                            <Form.Control
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Bookmark title..."
                              size="sm"
                            />
                            <Button type="submit" variant="success" size="sm">
                              <i className="bi bi-check"></i>
                            </Button>
                            <Button 
                              variant="outline-secondary" 
                              size="sm" 
                              onClick={cancelEditing}
                            >
                              <i className="bi bi-x"></i>
                            </Button>
                          </div>
                        </Form>
                      ) : (
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted fw-semibold">
                            {bookmark.title || 'Untitled Bookmark'}
                          </small>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-muted"
                            onClick={() => startEditing(bookmark)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Post Title */}
                    <Card.Title className="mb-2">
                      <Link 
                        to={`/post/${bookmark.post.id}`} 
                        className="text-decoration-none text-dark hover-primary"
                      >
                        {bookmark.post.title}
                      </Link>
                    </Card.Title>

                    {/* Post Content Preview */}
                    <Card.Text className="text-muted flex-grow-1">
                      {bookmark.post.content.length > 100 
                        ? bookmark.post.content.substring(0, 100) + '...'
                        : bookmark.post.content
                      }
                    </Card.Text>

                    {/* Tags */}
                    {bookmark.post.tags && bookmark.post.tags.length > 0 && (
                      <div className="mb-3">
                        {bookmark.post.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="badge bg-secondary me-1">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Author Info */}
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-2">
                        {bookmark.post.profile.profile_picture ? (
                          <img
                            src={api.getImageUrl(bookmark.post.profile.profile_picture)}
                            alt={bookmark.post.profile.user.username}
                            className="rounded-circle"
                            style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                            style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                          >
                            {bookmark.post.profile.user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <small className="text-muted">
                        By{' '}
                        <Link 
                          to={`/profile/${bookmark.post.profile.user.username}`}
                          className="text-decoration-none"
                        >
                          {bookmark.post.profile.user.username}
                        </Link>
                      </small>
                    </div>

                    {/* Actions */}
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <Button
                        variant="primary"
                        size="sm"
                        as={Link}
                        to={`/post/${bookmark.post.id}`}
                      >
                        <i className="bi bi-book me-1"></i>
                        Read Post
                      </Button>
                      
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                      >
                        <i className="bi bi-bookmark-dash me-1"></i>
                        Remove
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