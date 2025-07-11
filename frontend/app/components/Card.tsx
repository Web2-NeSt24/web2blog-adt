import Card from "react-bootstrap/Card";
import type { Post } from "~/types/api";

const cardVariants = [
  "primary",
  "secondary", 
  "success",
  "danger",
  "warning",
  "info",
  "dark",
  "light",
];

function getRandomVariant(idx: number) {
  return cardVariants[idx % cardVariants.length];
}

interface RandomCardProps {
  post: Post;
  idx: number;
}

export function RandomCard({ post, idx }: RandomCardProps) {
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

  return (
    <Card className="blog-card h-100" key={post.id}>
      {post.image && (
        <Card.Img variant="top" src={post.image} className="card-img-top" />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title className="card-title">
          <a href={`/post/${post.id}`} className="text-decoration-none">
            {post.title}
          </a>
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
          {post.profile?.profile_picture ? (
            <img
              className="author-avatar"
              src={post.profile.profile_picture}
              alt={post.profile?.user?.username || "author"}
            />
          ) : (
            <div
              className="author-avatar"
              style={{ background: "#eee" }}
            />
          )}
          <span className="author-name">{post.profile?.user?.username || "Unknown Author"}</span>
        </div>
        <div className="post-stats mt-2">
          <small className="text-muted">
            {post.like_count} likes • {post.comment_count} comments • {post.bookmark_count} bookmarks
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}
