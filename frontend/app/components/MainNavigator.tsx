import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Dropdown from "react-bootstrap/Dropdown";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { logoutUser } from "../utils/auth";
import { useState } from "react";

function MainNavigator() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerms, setSearchTerms] = useState("")

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      logout();
      navigate('/');
    }
  };

  return (
    <Navbar expand="lg" bg="dark" variant="dark" className="position-relative">
      <Container fluid>
        {/* Bal oldal - logó */}
        <Navbar.Brand as={Link} to="/">RustyPython</Navbar.Brand>

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
                onChange={(e) => setSearchTerms(e.target.value)}
              />
              <Button variant="outline-light" onClick={() => navigate(`/?search=${encodeURIComponent(searchTerms)}`, { replace: true })}>Search</Button>
            </Form>
          </div>

          {/* Jobb oldali linkek/gombok */}
          <Nav className="ms-auto mt-3 mt-lg-0 d-flex align-items-center">
            <Nav.Link 
              as={Link} 
              to="/"
              className={location.pathname === "/" ? "active" : ""}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/about"
              className={location.pathname === "/about" ? "active" : ""}
            >
              About
            </Nav.Link>
            
            {isAuthenticated ? (
              <Dropdown align="end" className="ms-lg-3">
                <Dropdown.Toggle variant="outline-info" id="user-dropdown">
                  {user?.username}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/likes">Likes</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/bookmarks">Bookmarks</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/drafts">Drafts</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">Settings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link to="/auth" className="ms-lg-5 mt-1 mt-lg-2">
                <Button variant="outline-info">
                  Login
                </Button>
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavigator;
