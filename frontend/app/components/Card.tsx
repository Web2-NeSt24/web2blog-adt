import Card from "react-bootstrap/Card";
import type { Post } from "~/types/api";
import ProfilePicture from "./ProfilePicture";
import { getImageSrc } from "./ApiImage";


interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const redirect = post.draft ? `/post/edit/${post.id}` : `/post/${post.id}?title=${post.title.replace(/\s+/, "-")}`

  return (
    <a href={redirect} className="text-decoration-none">
      <Card className="blog-card h-100" key={post.id}>
        {post.image && (
          <Card.Img variant="top" src={getImageSrc(post.image)} className="card-img-top" />
        )}
        <Card.Body className="d-flex flex-column">
          <Card.Title className="card-title" style={{ color: post.draft ? "#FF0000" : "" }}>
            {post.title}
          </Card.Title>
          <Card.Text className="card-text flex-grow-1" dangerouslySetInnerHTML={{ __html: post.content || "No content" }}>
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
    </a>
  );
}
