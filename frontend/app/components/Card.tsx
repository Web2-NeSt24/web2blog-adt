import Card from "react-bootstrap/Card";

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
    <Card className="blog-card h-100" key={post.id}>
      {post.image !== null && (
        <Card.Img variant="top" src={post.image.data} className="card-img-top" />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title className="card-title">{post.title}</Card.Title>
        <Card.Text className="card-text flex-grow-1">
          {post.content ?
            (post.content.length > 150 ?
              post.content.substring(0, 150) + "..." :
              post.content
            ) :
            "No content"
          }
        </Card.Text>
        <div className="tags mb-2">
          {post.tags && post.tags.length > 0 ? (
            post.tags.map((tag: any) => (
              <span className="tag" key={tag.id}>#{tag.value}</span>
            ))
          ) : (
            <span className="tag">No tags</span>
          )}
        </div>
        <div className="author-section mt-auto">
          {post.profile?.profile_picture?.data ? (
            <img
              className="author-avatar"
              src={post.profile.profile_picture.data}
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
      </Card.Body>
    </Card>
  );
}
