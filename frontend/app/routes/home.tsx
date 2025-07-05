import type { Route } from "./+types/home";
import { dummyPosts } from "~/dummy";
import { RandomCard } from "~/components/Card";
import { Container, Row, Col } from "react-bootstrap";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <Container className="py-4 main-centered-container" style={{ maxWidth: '1400px' }}>
      <Row className="g-4">
        {dummyPosts.map((post, idx) => (
          <Col key={post.id || idx} xs={12} sm={6} md={4} lg={3}>
            <RandomCard post={post} idx={idx}/>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
