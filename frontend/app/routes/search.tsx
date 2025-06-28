import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import type { Route } from "./+types/search";
import Layout from '~/components/Layout';
import PostCard from '~/components/PostCard';
import LoadingSpinner from '~/components/LoadingSpinner';
import { api, type Post } from '~/lib/api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search - RustyPython" },
    { name: "description", content: "Search for posts, authors, and tags on RustyPython" },
  ];
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<'keywords' | 'author' | 'tags'>('keywords');
  const [sortBy, setSortBy] = useState<'DATE' | 'LIKES'>('DATE');

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query, 'keywords', 'DATE');
    }
  }, [searchParams]);

  const performSearch = async (query: string, type: string, sort: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const filters: any = { sort_by: sort };
      
      switch (type) {
        case 'keywords':
          filters.keywords = [query];
          break;
        case 'author':
          filters.author_name = query;
          break;
        case 'tags':
          filters.tags = [query];
          break;
      }

      const result = await api.filterPosts(filters);
      const postPromises = result.post_ids.map((id: number) => api.getPost(id));
      const postsData = await Promise.all(postPromises);
      setPosts(postsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      performSearch(searchQuery.trim(), searchType, sortBy);
    }
  };

  const handleFilterChange = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim(), searchType, sortBy);
    }
  };

  useEffect(() => {
    handleFilterChange();
  }, [searchType, sortBy]);

  return (
    <Layout>
      <Container>
        <Row>
          <Col lg={8} className="mx-auto">
            <h2 className="mb-4">
              <i className="bi bi-search me-2"></i>
              Search Posts
            </h2>

            {/* Search Form */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <Form onSubmit={handleSearch}>
                  <Row className="align-items-end">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Search Query</Form.Label>
                        <Form.Control
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Enter your search terms..."
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Search In</Form.Label>
                        <Form.Select
                          value={searchType}
                          onChange={(e) => setSearchType(e.target.value as any)}
                        >
                          <option value="keywords">Content & Title</option>
                          <option value="author">Author</option>
                          <option value="tags">Tags</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Sort By</Form.Label>
                        <Form.Select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                        >
                          <option value="DATE">Recent</option>
                          <option value="LIKES">Popular</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-1"></i>
                        Search
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {/* Search Results */}
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {loading ? (
              <LoadingSpinner text="Searching..." />
            ) : searchQuery && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5>
                    Search Results for "{searchQuery}"
                    {posts.length > 0 && (
                      <span className="text-muted ms-2">({posts.length} found)</span>
                    )}
                  </h5>
                </div>

                {posts.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-search display-1 text-muted"></i>
                    <h4 className="mt-3 text-muted">No results found</h4>
                    <p className="text-muted">
                      Try adjusting your search terms or search in a different category.
                    </p>
                  </div>
                ) : (
                  <Row>
                    {posts.map((post) => (
                      <Col key={post.id} lg={6} className="mb-4">
                        <PostCard post={post} />
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}

            {/* Search Tips */}
            {!searchQuery && (
              <Card className="border-0 bg-light">
                <Card.Body>
                  <h6 className="mb-3">
                    <i className="bi bi-lightbulb me-2"></i>
                    Search Tips
                  </h6>
                  <ul className="mb-0 small text-muted">
                    <li>Use specific keywords to find relevant content</li>
                    <li>Search by author name to find posts by specific users</li>
                    <li>Use tags to discover posts on specific topics</li>
                    <li>Sort by popularity to find the most liked posts</li>
                  </ul>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}