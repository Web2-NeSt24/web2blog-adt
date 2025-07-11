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
  const randomVariant = getRandomVariant(idx);

  return (
    <Card border={randomVariant} style={{ width: "18rem" }} key={post.id}>
      {post.image !== null && <Card.Img variant="top" src={post.image.data} />}
      <Card.Body>
        <Card.Title>{post.title}</Card.Title>
        <Card.Text>{post.content || "Nincs tartalom"}</Card.Text>
        <Card.Text className="d-flex gap-3">
          {post.tags && post.tags.length > 0 ? (
            post.tags.map((tag: any) => (
              <span className="p-1" key={tag.id}>
                #{tag.value}
              </span>
            ))
          ) : (
            <span>No tags</span>
          )}
        </Card.Text>
        <div className="d-flex gap-3 mb-3">
          {post.image?.data ? (
            <Card.Img
              style={{ width: 50, borderRadius: 90, height: 50 }}
              src={post.image.data}
              alt={post.profile?.profile_picture?.data || ""}
            />
          ) : (
            <div
              style={{
                width: 50,
                height: 50,
                background: "#eee",
                borderRadius: 90,
              }}
            />
          )}
          <div>{post.profile?.user?.username || "Ismeretlen szerző"}</div>
        </div>
      </Card.Body>
    </Card>
  );
}
