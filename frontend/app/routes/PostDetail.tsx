import React, { useEffect, useState } from 'react';
import { FaRegBookmark, FaBookmark, FaRegThumbsUp, FaThumbsUp, FaFacebook, FaTwitter, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { ApiImage } from '~/components/ApiImage';
import ProfilePicture from '~/components/ProfilePicture';
import { useAuth } from '~/contexts/AuthContext';
import { makeAuthenticatedRequest } from '~/utils/auth';

interface Profile {
  user: { id: number; username: string };
  biography: string;
  profile_picture: number | null;
}

interface Post {
  id: number;
  profile: Profile;
  title: string;
  content: string;
  image: number | null;
  tags: string[];
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}

interface Comment {
  id: number;
  author_profile: Profile;
  content: string;
}

const API_BASE = '/api';

// Accept id as a prop injected by @react-router/dev
const PostDetail: React.FC<{ id: string }> = ({ id }) => {
  const navigate = useNavigate()
  const auth = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const isOwnPost = auth.user?.id === post?.profile?.user?.id;

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`${API_BASE}/post/by-id/${id}`),
          fetch(`${API_BASE}/post/${id}/comments/`)
        ]);

        if (!postRes.ok) {
          throw new Error('Failed to fetch post');
        }

        const postData = await postRes.json();
        setPost(postData);

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    setLikeLoading(true);
    await makeAuthenticatedRequest(`${API_BASE}/post/${id}/like/`, { method: 'POST' });
    // Refetch post
    fetch(`${API_BASE}/post/by-id/${id}`)
      .then(res => res.json())
      .then(setPost)
      .finally(() => setLikeLoading(false));
  };

  const handleBookmark = async () => {
    if (!post) return;
    setBookmarkLoading(true);

    if (!post.is_bookmarked) {
      await makeAuthenticatedRequest(`${API_BASE}/post/${id}/bookmark/`, { method: 'POST' });
    } else {
      await makeAuthenticatedRequest(`${API_BASE}/post/${id}/bookmark/`, { method: 'DELETE' });
    }

    fetch(`${API_BASE}/post/by-id/${id}`)
      .then(res => res.json())
      .then(setPost)
      .finally(() => setBookmarkLoading(false));
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await makeAuthenticatedRequest(`${API_BASE}/post/${id}/comments/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText })
    });
    setCommentText('');
    fetch(`${API_BASE}/post/${id}/comments/`).then(res => res.json()).then(setComments);
    fetch(`${API_BASE}/post/by-id/${id}`).then(res => res.json()).then(setPost);
  };

  const handleDelete = async () => {
    await makeAuthenticatedRequest(`${API_BASE}/post/by-id/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    navigate("/")
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = post ? encodeURIComponent(post.title) : '';

  if (loading || !post) {
    return (
      <div className="post-detail-container">
        <div className="post-detail-card">
          <div className="loading-skeleton">
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text-lines">
                <div className="skeleton-line skeleton-line-short"></div>
                <div className="skeleton-line skeleton-line-shorter"></div>
              </div>
            </div>
            <div className="skeleton-title"></div>
            <div className="skeleton-meta">
              <div className="skeleton-line skeleton-line-short"></div>
            </div>
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line skeleton-line-short"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-container">
        <div className="error-card">
          <h2>Post Not Found</h2>
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => window.history.back()} className="back-button">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <article className="post-detail-card">
        {/* Post Header */}
        <header className="post-header">
          <div className="post-author">
            <div className="author-avatar">
              {post.profile.profile_picture ? (
                <ProfilePicture id={post.profile.profile_picture} />
              ) : (
                <div className="avatar-placeholder">
                  {post.profile.user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="author-info">
              <h3 
                className="author-name" 
                onClick={() => navigate(`/user/${post.profile.user.id}`)}
                style={{ 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  color: '#0d6efd'
                }}
              >
                {post.profile.user.username}
              </h3>
              <p className="author-bio">{post.profile.biography}</p>
            </div>
          </div>
        </header>

        {/* Post Title */}
        <h1 className="post-title">{post.title}</h1>

        {/* Post Meta */}
        <div className="post-meta">
          <div className="meta-stats">
            <span className="stat-item">
              <FaThumbsUp className="stat-icon" />
              {post.like_count} {post.like_count === 1 ? 'Like' : 'Likes'}
            </span>
            <span className="stat-item">
              <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
              </svg>
              {post.comment_count} {post.comment_count === 1 ? 'Comment' : 'Comments'}
            </span>
            <span className="stat-item">
              <FaBookmark className="stat-icon" />
              {post.bookmark_count} {post.bookmark_count === 1 ? 'Bookmark' : 'Bookmarks'}
            </span>
          </div>
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="post-image-container">
            <ApiImage id={post.image} style={{maxWidth: "100%"}} />
          </div>
        )}

        {/* Post Content */}
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Post Tags */}
        {post.tags.length > 0 && (
          <div className="post-tags">
            <h4>Tags</h4>
            <div className="tag-list">
              {post.tags.map(tag => (
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="post-actions">
          <div className="action-buttons">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`action-btn like-btn ${post.is_liked ? 'active' : ''}`}
            >
              {post.is_liked ? <FaThumbsUp /> : <FaRegThumbsUp />}
              <span>{post.is_liked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className={`action-btn bookmark-btn ${post.is_bookmarked ? 'active' : ''}`}
            >
              {post.is_bookmarked ? <FaBookmark /> : <FaRegBookmark />}
              <span>{post.is_bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
            {isOwnPost && <>
              <button
                onClick={() => navigate(`/post/edit/${post.id}`)}
                className={`action-btn edit-btn`}
              >
                <FaEdit />
                <span>Edit</span>
              </button>

              <button
                onClick={handleDelete}
                className={`action-btn delete-btn`}
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </>}
          </div>

          <div className="share-buttons">
            <span className="share-label">Share:</span>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn twitter"
            >
              <FaTwitter />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn facebook"
            >
              <FaFacebook />
            </a>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="comments-section">
        <h2 className="comments-title">
          Comments ({post.comment_count})
        </h2>

        <form onSubmit={handleComment} className="comment-form">
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            className="comment-input"
            rows={4}
          />
          <button type="submit" className="comment-submit" disabled={!commentText.trim()}>
            Post Comment
          </button>
        </form>
        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-author">
                  <div className="comment-avatar">
                    {comment.author_profile.profile_picture ? (
                      <ProfilePicture id={comment.author_profile.profile_picture} />
                    ) : (
                      <div className="avatar-placeholder">
                        {comment.author_profile.user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="comment-details">
                    <strong 
                      className="comment-username"
                      onClick={() => navigate(`/user/${comment.author_profile.user.id}`)}
                      style={{ 
                        cursor: 'pointer', 
                        textDecoration: 'underline',
                        color: '#0d6efd'
                      }}
                    >
                      {comment.author_profile.user.username}
                    </strong>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default PostDetail;
