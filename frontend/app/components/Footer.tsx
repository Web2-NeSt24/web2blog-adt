import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5>RustyPython</h5>
            <p className="mb-0">
              An inspiring dev community.
            </p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <h6>Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/about" className="text-light text-decoration-none">About Us</Link></li>
              <li><a href="mailto:team@web2blog.com" className="text-light text-decoration-none">Contact</a></li>
              <li><Link to="/privacy" className="text-light text-decoration-none">Privacy policy</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h6>Contact</h6>
            <p className="mb-1">📧 support@rustypython.dev</p>
            <p>📍 Your basement</p>
          </Col>
        </Row>
        <hr className="border-secondary" />
        <p className="text-center mb-0">
          &copy; {new Date().getFullYear()} RustyPython. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
