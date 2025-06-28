import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import type { Route } from "./+types/explore";
import Layout from '~/components/Layout';
import PostCard from '~/components/PostCard';
import LoadingSpinner from '~/components/LoadingSpinner';
import ErrorAlert from '~/components/ErrorAlert';
import { api, type Post } from '~/lib/api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Explore - RustyPython" },
    { name: "description", content: "Discover amazing posts and authors on RustyPython" },
  ];
}

export default function Explore() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'DATE' | 'LIKES'>('LIKES');
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    loadPosts();
  }, [sortBy, selectedTag]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = { sort_by: sortBy };
      if (selectedTag) {
        filters.tags = [selectedTag];
      }
      
      const result = await api.filterPosts(filters);
      const postPromises = result.post_ids.map((id: number) => api.getPost(id));
      const postsData = await Promise.all(postPromises);
      setPosts(postsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Extract popular tags from posts
  const popularTags = posts.reduce((tags: string[], post) => {
    if (post.tags) {
      tags.push(...post.tags);
    }
    return tags;
  }, []);
  
  const uniqueTags = [...new Set(popularTags)].slice(0, 10);

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Discovering amazing content..." />
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
      <Container>
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold mb-3">
            <i className="bi bi-compass me-3"></i>
            Explore Amazing Content
          </h1>
          <p className="lead text-muted">
            Discover trending posts, popular authors, and interesting topics
          </p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Sort By</Form.Label>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'DATE' | 'LIKES')}
                  >
                    <option value="LIKES">Most Popular</option>
                    <option value="DATE">Most Recent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Label className="fw-semibold">Filter by Tag</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant={selectedTag === '' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setSelectedTag('')}
                  >
                    All Posts
                  </Button>
                  {uniqueTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                    >
                      #{tag}
                    </Button>
                  ))}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-journal-x display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No posts found</h4>
            <p className="text-muted">
              {selectedTag 
                ? `No posts found with the tag "${selectedTag}"`
                : "No posts available at the moment"
              }
            </p>
            {selectedTag && (
              <Button variant="primary" onClick={() => setSelectedTag('')}>
                View All Posts
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>
                {selectedTag ? `Posts tagged with #${selectedTag}` : 'All Posts'}
                <span className="text-muted ms-2">({posts.length})</span>
              </h4>
            </div>
            
            <Row>
              {posts.map((post) => (
                <Col key={post.id} lg={4} md={6} className="mb-4">
                  <PostCard post={post} onLikeChange={loadPosts} onBookmarkChange={loadPosts} />
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* Call to Action */}
        <Card className="bg-primary text-white border-0 mt-5">
          <Card.Body className="text-center py-5">
            <h3>Ready to Share Your Story?</h3>
            <p className="mb-4">
              Join our community of writers and share your unique perspective with the world.
            </p>
            <Button variant="light" size="lg" href="/write">
              Start Writing Today
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  );
}