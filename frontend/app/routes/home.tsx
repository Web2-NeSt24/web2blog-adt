import { useState, useEffect } from 'react';
import { Row, Col, Container, Card, Button, Badge } from 'react-bootstrap';
import type { Route } from "./+types/home";
import Layout from '~/components/Layout';
import PostCard from '~/components/PostCard';
import LoadingSpinner from '~/components/LoadingSpinner';
import ErrorAlert from '~/components/ErrorAlert';
import { api, type Post } from '~/lib/api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RustyPython - Modern Blog Platform" },
    { name: "description", content: "Discover amazing stories, insights, and ideas from our community of writers." },
  ];
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'DATE' | 'LIKES'>('DATE');

  useEffect(() => {
    loadPosts();
  }, [sortBy]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.filterPosts({ sort_by: sortBy });
      const postPromises = result.post_ids.map((id: number) => api.getPost(id));
      const postsData = await Promise.all(postPromises);
      setPosts(postsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading latest posts..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorAlert error={error} onDismiss={() => setError(null)} />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-5 rounded">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-3">
                Welcome to RustyPython
              </h1>
              <p className="lead mb-4">
                Discover amazing stories, insights, and ideas from our community of passionate writers.
                Share your thoughts and connect with like-minded individuals.
              </p>
              <div className="d-flex gap-3">
                <Button variant="light" size="lg" href="/explore">
                  Explore Posts
                </Button>
                <Button variant="outline-light" size="lg" href="/register">
                  Join Community
                </Button>
              </div>
            </Col>
            <Col lg={4} className="text-center">
              <i className="bi bi-journal-text display-1"></i>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Featured Stats */}
      <Row className="mb-5">
        <Col md={4}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <i className="bi bi-people-fill text-primary fs-1"></i>
              <h3 className="mt-2">Growing Community</h3>
              <p className="text-muted">Join thousands of writers and readers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <i className="bi bi-lightning-fill text-warning fs-1"></i>
              <h3 className="mt-2">Easy Publishing</h3>
              <p className="text-muted">Share your ideas with our simple editor</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <i className="bi bi-heart-fill text-danger fs-1"></i>
              <h3 className="mt-2">Engage & Connect</h3>
              <p className="text-muted">Like, comment, and bookmark your favorites</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Posts Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Latest Posts</h2>
        <div className="d-flex gap-2">
          <Button
            variant={sortBy === 'DATE' ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => setSortBy('DATE')}
          >
            <i className="bi bi-clock me-1"></i>
            Recent
          </Button>
          <Button
            variant={sortBy === 'LIKES' ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => setSortBy('LIKES')}
          >
            <i className="bi bi-heart me-1"></i>
            Popular
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-journal-x display-1 text-muted"></i>
          <h3 className="mt-3 text-muted">No posts yet</h3>
          <p className="text-muted">Be the first to share your story!</p>
          <Button variant="primary" href="/write">
            Write First Post
          </Button>
        </div>
      ) : (
        <Row>
          {posts.map((post) => (
            <Col key={post.id} lg={4} md={6} className="mb-4">
              <PostCard post={post} onLikeChange={loadPosts} onBookmarkChange={loadPosts} />
            </Col>
          ))}
        </Row>
      )}

      {/* Call to Action */}
      <Card className="bg-light border-0 mt-5">
        <Card.Body className="text-center py-5">
          <h3>Ready to Share Your Story?</h3>
          <p className="text-muted mb-4">
            Join our community and start writing today. Your voice matters.
          </p>
          <Button variant="primary" size="lg" href="/write">
            Start Writing
          </Button>
        </Card.Body>
      </Card>
    </Layout>
  );
}