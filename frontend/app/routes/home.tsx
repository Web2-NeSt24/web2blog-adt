import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import { PostCard } from "~/components/Card";
import { TagInput } from "~/components/TagInput";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import type { Post, PostFilter } from "~/types/api";
import { PostSortingMethod } from "~/types/api";
import { makeAuthenticatedRequest } from "~/utils/auth";

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
  const [authorFilter, setAuthorFilter] = useState("");
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<PostSortingMethod>(PostSortingMethod.DATE);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (useFilters = false) => {
    try {
      setLoading(true);

      let url = '/api/posts/';
      let options: RequestInit = {};

      if (useFilters) {
        url = '/api/filter/';
        const keywords: string[] = [];
        const tags = tagsFilter;
        const author_name = authorFilter.trim() || undefined;

        const filterData: PostFilter = {
          keywords,
          tags,
          sort_by: sortBy,
          ...(author_name && { author_name })
        };

        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filterData)
        };
      }

      const response = await makeAuthenticatedRequest(url, options);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      let data = await response.json();

      if (useFilters) {
        data = await Promise.all(data.post_ids.map(async (id: number) => {
          const response = await fetch(`/api/post/by-id/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch posts');
          }
          return await response.json();
        }))
      }

      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPosts(true);
  };

  const handleReset = () => {
    setAuthorFilter("");
    setTagsFilter([]);
    setSortBy(PostSortingMethod.DATE);
    fetchPosts(false);
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
      {/* Compact Filter Section */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="bg-light p-3 rounded">
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small">Author</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Username"
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small">Tags</Form.Label>
                  <TagInput
                    tags={tagsFilter}
                    onTagsChange={setTagsFilter}
                    size="sm"
                    placeholder="Type tags and press space..."
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="small">Sort</Form.Label>
                  <Form.Select
                    size="sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as PostSortingMethod)}
                  >
                    <option value={PostSortingMethod.DATE}>Newest</option>
                    <option value={PostSortingMethod.LIKES}>Popular</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="primary" onClick={handleSearch}>
                    Filter
                  </Button>
                  <Button size="sm" variant="outline-secondary" onClick={handleReset}>
                    Clear
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

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
              <PostCard post={post} />
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}
