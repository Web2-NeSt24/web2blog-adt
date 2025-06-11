import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

function MainNavigator() {
  return (
    <Navbar expand="lg" bg="dark" variant="dark" className="position-relative">
      <Container fluid>
        {/* Bal oldal - logó */}
        <Navbar.Brand href="#">RustyPython</Navbar.Brand>

        {/* Hamburger menü gomb */}
        <Navbar.Toggle aria-controls="main-navbar" />

        {/* Összecsukható tartalom */}
        <Navbar.Collapse id="main-navbar" className="position-relative w-100">
          {/* Kereső mobilon (normál flow) */}
          <Form className="d-flex mt-3 d-lg-none w-100">
            <Form.Control
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
            />
            <Button variant="outline-light">Search</Button>
          </Form>

          {/* Középen igazított kereső csak nagy képernyőn */}
          <div
            className="d-none d-lg-flex position-absolute start-50 translate-middle-x"
            style={{ zIndex: 1 }}
          >
            <Form className="d-flex">
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
              />
              <Button variant="outline-light">Search</Button>
            </Form>
          </div>

          {/* Jobb oldali linkek/gombok */}
          <Nav className="ms-auto mt-3 mt-lg-0 d-flex align-items-center">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#topics">Topics</Nav.Link>
            <Button variant="outline-info" className="ms-lg-5 mt-1 mt-lg-2">
              Login
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavigator;
