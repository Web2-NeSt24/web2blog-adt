import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import { PostCard } from "~/components/Card";
import { Container, Row, Col } from "react-bootstrap";
import type { Post } from "~/types/api";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Blog - Latest Posts" },
    { name: "description", content: "Discover the latest blog posts and articles" },
  ];
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts/');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 main-centered-container" style={{ maxWidth: '1400px' }}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4 main-centered-container" style={{ maxWidth: '1400px' }}>
        <div className="alert alert-danger" role="alert">
          Error loading posts: {error}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4 main-centered-container" style={{ maxWidth: '1400px' }}>
      <Row className="g-4">
        {posts.length === 0 ? (
          <Col xs={12}>
            <div className="text-center">
              <p>No posts available yet.</p>
            </div>
          </Col>
        ) : (
          posts.map((post, idx) => (
            <Col key={post.id} xs={12} sm={6} md={4} lg={3}>
              <PostCard post={post}/>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}
