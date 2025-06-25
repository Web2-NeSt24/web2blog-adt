import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

interface Post {
  id: number;
  profile: {
    user: {
      id: number;
      username: string;
    };
    biography: string;
    profile_picture: string | null;
  };
  title: string;
  content: string;
  image: string | null;
  tags: string[];
}

interface Bookmark {
  id: number;
  post: Post;
  creator_profile: {
    user: {
      id: number;
      username: string;
    };
  };
  title: string;
}

export default function BookmarksPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/bookmarks/', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookmarks');
        }

        const bookmarksData = await response.json();
        setBookmarks(bookmarksData);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        setError('Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [isAuthenticated, navigate]);

  const handleDeleteBookmark = async (bookmarkId: number) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}/`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
      } else {
        console.error('Failed to delete bookmark');
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="bi bi-bookmark me-2"></i>
              My Bookmarks
            </h2>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {bookmarks.length === 0 ? (
            <div className="text-center">
              <i className="bi bi-bookmark display-1 text-muted"></i>
              <h3 className="mt-3 text-muted">No bookmarks yet</h3>
              <p className="text-muted">
                Bookmark posts you want to read later by clicking the bookmark icon on any post.
              </p>
              <a href="/" className="btn btn-primary">
                Browse Posts
              </a>
            </div>
          ) : (
            <div className="row">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">
                        <a 
                          href={`/post/${bookmark.post.id}`} 
                          className="text-decoration-none"
                        >
                          {bookmark.post.title}
                        </a>
                      </h5>
                      
                      <div className="mb-2">
                        <small className="text-muted">
                          by{" "}
                          <a 
                            href={`/profile/${bookmark.post.profile.user.username}`}
                            className="text-decoration-none"
                          >
                            {bookmark.post.profile.user.username}
                          </a>
                        </small>
                      </div>

                      <p className="card-text flex-grow-1">
                        {bookmark.post.content.length > 150 
                          ? `${bookmark.post.content.substring(0, 150)}...` 
                          : bookmark.post.content
                        }
                      </p>

                      {bookmark.post.tags.length > 0 && (
                        <div className="mb-2">
                          {bookmark.post.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="badge bg-secondary me-1">
                              #{tag}
                            </span>
                          ))}
                          {bookmark.post.tags.length > 3 && (
                            <span className="text-muted small">
                              +{bookmark.post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {bookmark.title && (
                        <div className="mb-2">
                          <small className="text-muted">
                            <strong>Note:</strong> {bookmark.title}
                          </small>
                        </div>
                      )}

                      <div className="d-flex justify-content-between">
                        <a 
                          href={`/post/${bookmark.post.id}`} 
                          className="btn btn-primary btn-sm"
                        >
                          Read Post
                        </a>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                          title="Remove bookmark"
                        >
                          <i className="bi bi-bookmark-dash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
