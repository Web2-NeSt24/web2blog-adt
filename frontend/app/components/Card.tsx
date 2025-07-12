import Card from "react-bootstrap/Card";
import type { Post } from "~/types/api";
import ProfilePicture from "./ProfilePicture";
import { getImageSrc } from "./ApiImage";
import { useNavigate } from "react-router";


interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();
  const redirect = post.draft ? `/post/edit/${post.id}` : `/post/${post.id}?title=${post.title.replace(/\s+/, "-")}`

  // Helper function to strip HTML tags and decode HTML entities
  const stripHtmlAndDecode = (html: string): string => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Get text content and clean it up
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    // Clean up extra whitespace
    return textContent.replace(/\s+/g, ' ').trim();
  };

  // Get clean text content for display
  const cleanContent = post.content ? stripHtmlAndDecode(post.content) : '';
  const displayContent = cleanContent.length > 200 ?
    cleanContent.substring(0, 200) + "..." :
    cleanContent;

  const handleCardClick = () => {
    navigate(redirect);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (post.profile?.user?.id) {
      navigate(`/user/${post.profile.user.id}`);
    }
  };

  return (
    <div onClick={handleCardClick} style={{ cursor: 'pointer', height: "100%" }} className="text-decoration-none">
      <Card className="blog-card h-100" key={post.id}>
        {post.image && (
          <Card.Img variant="top" src={getImageSrc(post.image) || ''} className="card-img-top" />
        )}
        <Card.Body className="d-flex flex-column">
          <Card.Title className="card-title" style={{ color: post.draft ? "#FF0000" : "" }}>
            {post.title}
          </Card.Title>
          <Card.Text className="card-text flex-grow-1">
            {displayContent || "No content"}
          </Card.Text>
          <div className="tags mb-2">
            {post.tags && post.tags.length > 0 ? (
              post.tags.map((tag: string, index: number) => (
                <span className="tag" key={index}>#{tag}</span>
              ))
            ) : (
              <span className="tag">No tags</span>
            )}
          </div>
          <div className="author-section mt-auto">
            <ProfilePicture id={post.profile.profile_picture} className="author-avatar" />
            <span 
              className="author-name" 
              onClick={handleAuthorClick}
              style={{ 
                cursor: 'pointer', 
                textDecoration: 'underline',
                color: '#0d6efd'
              }}
            >
              {post.profile?.user?.username || "Unknown Author"}
            </span>
          </div>
          <div className="post-stats mt-2">
            <small className="text-muted">
              {post.like_count} likes • {post.comment_count} comments • {post.bookmark_count} bookmarks
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
