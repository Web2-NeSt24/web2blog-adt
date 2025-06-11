import React from "react";
import { Container, Row, Col } from "react-bootstrap";

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
            <h6>Linkek</h6>
            <ul className="list-unstyled">
              <li><a href="#about" className="text-light text-decoration-none">About Us</a></li>
              <li><a href="#contact" className="text-light text-decoration-none">Contact</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h6>Kapcsolat</h6>
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