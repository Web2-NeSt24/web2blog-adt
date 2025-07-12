import type { Route } from "./+types/home";
import { useState, useEffect, useCallback } from "react";
import { PostCard } from "~/components/Card";
import { TagInput } from "~/components/TagInput";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import type { Post, PostFilter } from "~/types/api";
import { PostSortingMethod } from "~/types/api";
import { makeAuthenticatedRequest } from "~/utils/auth";
import { useSearchParams } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Blog - Latest Posts" },
    { name: "description", content: "Discover the latest blog posts and articles" },
  ];
}

export default function Home() {
  const [queryParams, _setQueryParams] = useSearchParams()
  const querySearch = queryParams.get("search")

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keywordFilter, setKeywordFilter] = useState<string[]>([]);
  const [authorFilter, setAuthorFilter] = useState("");
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<PostSortingMethod>(PostSortingMethod.DATE);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await makeAuthenticatedRequest("/api/filter/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sort_by: sortBy,
          ...( keywordFilter.length !== 0 ? { keywords: keywordFilter } : {} ),
          ...( tagsFilter.length !== 0 ? { tags: tagsFilter } : {} ),
          ...( authorFilter ? { author_name: authorFilter } : {} ),
        })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      let data = await response.json();

      data = await Promise.all(data.post_ids.map(async (id: number) => {
        const response = await fetch(`/api/post/by-id/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        return await response.json();
      }))

      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const keywords = querySearch ? querySearch.split(" ").filter(Boolean) : [];
    setKeywordFilter(keywords);
  }, [querySearch]);

  useEffect(() => {
    // Only fetch posts on initial load
    fetchPosts();
  }, []); // Only run once on mount

  const handleSearch = () => {
    // Create a fresh fetchPosts call with current filter values
    const searchPosts = async () => {
      try {
        setLoading(true);

        const response = await makeAuthenticatedRequest("/api/filter/", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sort_by: sortBy,
            ...( keywordFilter.length !== 0 ? { keywords: keywordFilter } : {} ),
            ...( tagsFilter.length !== 0 ? { tags: tagsFilter } : {} ),
            ...( authorFilter ? { author_name: authorFilter } : {} ),
          })
        });
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        let data = await response.json();

        data = await Promise.all(data.post_ids.map(async (id: number) => {
          const response = await fetch(`/api/post/by-id/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch posts');
          }
          return await response.json();
        }))

        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    searchPosts();
  };

  const handleReset = () => {
    setKeywordFilter([]);
    setAuthorFilter("");
    setTagsFilter([]);
    setSortBy(PostSortingMethod.DATE);
    // Fetch posts with cleared filters
    setTimeout(() => {
      handleSearch();
    }, 0);
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
      {/* Slim toolbar filter ------------------------------------------------ */}
      <div className="filter-bar bg-light rounded p-2 mb-4 d-flex flex-wrap gap-2">
        {/* Author */}
        <Form.Control
          size="sm"
          type="text"
          placeholder="Author"
          className="flex-grow-1 flex-basis-150"
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
        />

        {/* Tags */}
        <div className="flex-grow-1 flex-basis-200 position-relative">
          <div className="tag-scroll-inner overflow-auto flex-column">
            <TagInput
              tags={tagsFilter}
              onTagsChange={setTagsFilter}
              size="sm"
              placeholder="Tags…"
            />
          </div>
        </div>

        {/* Sort */}
        <Form.Select
          size="sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as PostSortingMethod)}
          className="flex-basis-120"
        >
          <option value={PostSortingMethod.DATE}>Newest</option>
          <option value={PostSortingMethod.LIKES}>Popular</option>
        </Form.Select>

        {/* Actions */}
        <Button size="sm" variant="primary" onClick={handleSearch}>
          Filter
        </Button>
        <Button size="sm" variant="outline-secondary" onClick={handleReset}>
          Clear
        </Button>
      </div>
      {/* ------------------------------------------------------------------- */}

      {posts.length === 0 ? (
        <div className="text-center">
          <p>No posts available yet.</p>
        </div>
      ) : (
        <Row className="g-4">
          {posts.map((post) => (
            <Col key={post.id} xs={12} sm={6} md={4} lg={3}>
              <PostCard post={post} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
