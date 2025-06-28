import { useState } from 'react';
import { Button, Container, Form, Nav, Navbar, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { api } from '~/lib/api';

function MainNavigator() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" bg="dark" variant="dark" className="shadow-sm">
      <Container fluid>
        {/* Brand */}
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-primary">
          <i className="bi bi-journal-text me-2"></i>
          RustyPython
        </Navbar.Brand>

        {/* Mobile toggle */}
        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          {/* Search bar - centered on desktop */}
          <div className="d-none d-lg-flex position-absolute start-50 translate-middle-x">
            <Form className="d-flex" onSubmit={handleSearch}>
              <Form.Control
                type="search"
                placeholder="Search posts, authors, tags..."
                className="me-2"
                style={{ width: '300px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline-light" type="submit">
                <i className="bi bi-search"></i>
              </Button>
            </Form>
          </div>

          {/* Mobile search */}
          <Form className="d-flex mt-3 d-lg-none w-100" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Search..."
              className="me-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-light" type="submit">
              <i className="bi bi-search"></i>
            </Button>
          </Form>

          {/* Navigation links */}
          <Nav className="ms-auto mt-3 mt-lg-0 d-flex align-items-center">
            <Nav.Link as={Link} to="/" className="text-light">
              <i className="bi bi-house me-1"></i>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/explore" className="text-light">
              <i className="bi bi-compass me-1"></i>
              Explore
            </Nav.Link>

            {user ? (
              <>
                <Nav.Link as={Link} to="/write" className="text-light">
                  <i className="bi bi-pencil-square me-1"></i>
                  Write
                </Nav.Link>
                <NavDropdown
                  title={
                    <span className="text-light">
                      <i className="bi bi-person-circle me-1"></i>
                      {user.user.username}
                    </span>
                  }
                  id="user-dropdown"
                  className="text-light"
                >
                  <NavDropdown.Item as={Link} to={`/profile/${user.user.username}`}>
                    <i className="bi bi-person me-2"></i>
                    My Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/drafts">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    My Drafts
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/bookmarks">
                    <i className="bi bi-bookmark me-2"></i>
                    Bookmarks
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/settings">
                    <i className="bi bi-gear me-2"></i>
                    Settings
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Button
                  variant="outline-light"
                  as={Link}
                  to="/login"
                  className="me-2"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  as={Link}
                  to="/register"
                >
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavigator;