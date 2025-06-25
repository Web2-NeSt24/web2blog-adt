import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";

interface Post {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  profile: {
    user: {
      id: number;
      username: string;
    };
    biography: string;
  };
  tags: string[];
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Blog Platform - Home" },
    { name: "description", content: "Discover amazing blog posts from our community" },
  ];
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getCsrfToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : null;
  };

  const fetchPosts = async (searchTerms: string[] = []) => {
    try {
      setLoading(true);
      const csrfToken = getCsrfToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add CSRF token if available (for authenticated users)
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch('/api/filter/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          keywords: searchTerms,
          tags: [],
          sort_by: "DATE"
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      
      // Fetch individual post details
      const postDetails = await Promise.all(
        data.post_ids.slice(0, 20).map(async (id: number) => {
          const postResponse = await fetch(`/api/post/by-id/${id}`, {
            credentials: 'include'
          });
          if (postResponse.ok) {
            return await postResponse.json();
          }
          return null;
        })
      );

      setPosts(postDetails.filter(Boolean));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const terms = searchQuery.trim() ? [searchQuery.trim()] : [];
    fetchPosts(terms);
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="container py-4">
      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <form onSubmit={handleSearch} className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </form>
        </div>
      </div>

      <h1 className="text-center mb-4">Latest Posts</h1>

      {loading && (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center">
          <p className="text-muted">No posts found. Be the first to create one!</p>
          <Link to="/create-post" className="btn btn-primary">
            Create Your First Post
          </Link>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="row g-4">
          {posts.map((post) => (
            <div className="col-12 col-md-6 col-lg-4" key={post.id}>
              <div className="card h-100 shadow-sm">
                {post.image_url && (
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">
                    <Link 
                      to={`/post/${post.id}`} 
                      className="text-decoration-none"
                    >
                      {post.title}
                    </Link>
                  </h5>
                  
                  <p className="card-text text-muted flex-grow-1">
                    {truncateContent(post.content)}
                  </p>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        By <Link 
                          to={`/profile/${post.profile.user.username}`}
                          className="text-decoration-none"
                        >
                          {post.profile.user.username}
                        </Link>
                      </small>
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-2">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="badge bg-secondary me-1">
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-muted small">+{post.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
