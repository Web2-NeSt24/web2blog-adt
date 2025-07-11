import React, { useEffect, useState } from 'react';
import { FaRegBookmark, FaBookmark, FaRegThumbsUp, FaThumbsUp, FaFacebook, FaTwitter } from 'react-icons/fa';

interface Profile {
  user: { id: number; username: string };
  biography: string;
  profile_picture: string | null;
}

interface Post {
  id: number;
  profile: Profile;
  title: string;
  content: string;
  image: string | null;
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
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/post/by-id/${id}`)
      .then(res => res.json())
      .then(setPost);
    fetch(`${API_BASE}/post/${id}/comments/`)
      .then(res => res.json())
      .then(setComments)
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    setLikeLoading(true);
    await fetch(`${API_BASE}/post/${id}/like/`, { method: 'POST', credentials: 'include' });
    // Refetch post
    fetch(`${API_BASE}/post/by-id/${id}`)
      .then(res => res.json())
      .then(setPost)
      .finally(() => setLikeLoading(false));
  };

  const handleBookmark = async () => {
    if (!post) return;
    setBookmarkLoading(true);
    await fetch(`${API_BASE}/post/${id}/bookmark/`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    fetch(`${API_BASE}/post/by-id/${id}`)
      .then(res => res.json())
      .then(setPost)
      .finally(() => setBookmarkLoading(false));
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await fetch(`${API_BASE}/post/${id}/comments/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText })
    });
    setCommentText('');
    fetch(`${API_BASE}/post/${id}/comments/`).then(res => res.json()).then(setComments);
    fetch(`${API_BASE}/post/by-id/${id}`).then(res => res.json()).then(setPost);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = post ? encodeURIComponent(post.title) : '';

  if (loading || !post) return <div>Loading...</div>;

  return (
    <div className="post-detail-container">
      <h1>{post.title}</h1>
      <div className="post-meta">
        <span>By {post.profile.user.username}</span>
        <span> | {post.like_count} Likes</span>
        <span> | {post.comment_count} Comments</span>
        <span> | {post.bookmark_count} Bookmarks</span>
      </div>
      {post.image && <img src={post.image} alt="Post" className="post-image" />}
      <div className="post-content">{post.content}</div>
      <div className="post-tags">
        {post.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
      </div>
      <div className="post-actions">
        <button onClick={handleLike} disabled={likeLoading} className="like-btn">
          {post.is_liked ? <FaThumbsUp /> : <FaRegThumbsUp />} Like
        </button>
        <button onClick={handleBookmark} disabled={bookmarkLoading} className="bookmark-btn">
          {post.is_bookmarked ? <FaBookmark /> : <FaRegBookmark />} Bookmark
        </button>
        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`} target="_blank" rel="noopener noreferrer" className="share-btn">
          <FaTwitter /> Share
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="share-btn">
          <FaFacebook /> Share
        </a>
      </div>
      <section className="comments-section">
        <h2>Comments</h2>
        <form onSubmit={handleComment} className="comment-form">
          <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Leave a comment..." />
          <button type="submit">Post Comment</button>
        </form>
        <ul className="comments-list">
          {comments.map(comment => (
            <li key={comment.id} className="comment-item">
              <strong>{comment.author_profile.user.username}</strong>: {comment.content}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default PostDetail;
