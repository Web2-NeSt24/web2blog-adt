import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import type { Route } from "./+types/tag";
import Layout from '~/components/Layout';
import PostCard from '~/components/PostCard';
import LoadingSpinner from '~/components/LoadingSpinner';
import ErrorAlert from '~/components/ErrorAlert';
import { api, type Post } from '~/lib/api';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `#${params.tag} - RustyPython` },
    { name: "description", content: `Explore posts tagged with #${params.tag} on RustyPython` },
  ];
}

export default function TagPage() {
  const { tag } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tag) {
      loadTagPosts();
    }
  }, [tag]);

  const loadTagPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.filterPosts({ 
        tags: [tag!],
        sort_by: 'DATE'
      });
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
        <LoadingSpinner text={`Loading posts tagged with #${tag}...`} />
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
        {/* Tag Header */}
        <div className="text-center mb-5">
          <Badge bg="primary" className="fs-1 px-4 py-3 mb-3">
            #{tag}
          </Badge>
          <h2 className="mb-3">Posts tagged with #{tag}</h2>
          <p className="text-muted">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
          </p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-tag display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No posts found</h4>
            <p className="text-muted">
              No posts have been tagged with #{tag} yet.
            </p>
          </div>
        ) : (
          <Row>
            {posts.map((post) => (
              <Col key={post.id} lg={4} md={6} className="mb-4">
                <PostCard post={post} onLikeChange={loadTagPosts} onBookmarkChange={loadTagPosts} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </Layout>
  );
}