import Card from "react-bootstrap/Card";
import type { Post } from "~/types/api";
import ProfilePicture from "./ProfilePicture";

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
  return (
    <Card className="blog-card h-100" key={post.id}>
      {post.image && (
        <Card.Img variant="top" src={post.image} className="card-img-top" />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title className="card-title">
          <a href={`/post/${post.id}?title=${post.title.replace(/\s+/, "-")}`} className="text-decoration-none">
            {post.title}
          </a>
        </Card.Title>
        <Card.Text className="card-text flex-grow-1" dangerouslySetInnerHTML={{__html: post.content || "No content"}}>
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
          <ProfilePicture id={post.profile?.profile_picture} width="50" height="50" />
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
