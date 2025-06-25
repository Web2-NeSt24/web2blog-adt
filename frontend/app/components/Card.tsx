import Card from "react-bootstrap/Card";
import { Link } from "react-router";

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
  return cardVariants[idx];
}

export function RandomCard({ post, idx }: any) {
  return (
    <Link
      to={`/post/${post.id}`}
      className="text-decoration-none"
      style={{ color: "inherit" }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "24rem",
          minHeight: "450px",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        key={post.id}
        className="h-100 hover-shadow"
        role="article"
        aria-labelledby={`card-title-${post.id}`}
      >
        {post.image !== null && (
          <Card.Img
            variant="top"
            src={post.image.data}
            style={{ height: "250px", objectFit: "cover" }}
            alt={post.title ? `Image for ${post.title}` : "Blog post image"}
          />
        )}
        <Card.Body className="d-flex flex-column">
          <Card.Title
            id={`card-title-${post.id}`}
            className="mb-3 fs-5"
            tabIndex={0}
          >
            {post.title}
          </Card.Title>
          <Card.Text
            className="flex-grow-1 mb-3"
            style={{ fontSize: "0.95rem", lineHeight: "1.5" }}
          >
            {post.content ? (
              post.content.length > 150
                ? `${post.content.substring(0, 150)}...`
                : post.content
            ) : (
              "No content available"
            )}
          </Card.Text>
          <Card.Text className="d-flex flex-wrap gap-2 mb-3">
            {post.tags && post.tags.length > 0 ? (
              post.tags.map((tag: any) => (
                <span
                  className="badge bg-secondary"
                  key={tag.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Tag: ${tag.value}`}
                >
                  #{tag.value}
                </span>
              ))
            ) : (
              <span className="text-muted">No tags</span>
            )}
          </Card.Text>
          <div className="d-flex align-items-center gap-3 mt-auto pt-2 border-top">
            {post.image?.data ? (
              <Card.Img
                style={{ width: 45, borderRadius: "50%", height: 45 }}
                src={post.image.data}
                alt={`Profile picture of ${post.profile?.user?.username || "Unknown author"}`}
              />
            ) : (
              <div
                style={{
                  width: 45,
                  height: 45,
                  background: "#eee",
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
            )}
            <div className="text-truncate">
              <div className="fw-semibold">
                {post.profile?.user?.username || "Unknown author"}
              </div>
              {post.created_at && (
                <small className="text-muted">
                  <time dateTime={post.created_at}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </time>
                </small>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
}
