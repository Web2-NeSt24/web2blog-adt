import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

function MainNavigator() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Optionally redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Navbar expand="lg" bg="dark" variant="dark" className="position-relative">
      <Container fluid>
        {/* Logo - leftside */}
        <Navbar.Brand as={Link} to="/">RustyPython</Navbar.Brand>

        {/* Hamburger menu buttonb */}
        <Navbar.Toggle aria-controls="main-navbar" />

        {/* Collapsable content */}
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

          {/* Search bar positioned in middle only on big screen */}
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

          {/* Nav buttons/links on top right */}
          <Nav className="ms-auto mt-3 mt-lg-0 d-flex align-items-center">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link href="#topics">Topics</Nav.Link>
            
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/create-post" className="ms-lg-2">
                  <i className="bi bi-plus-circle me-1"></i>
                  Create Post
                </Nav.Link>
                <Nav.Link as={Link} to="/drafts" className="ms-lg-2">
                  <i className="bi bi-file-earmark-text me-1"></i>
                  My Drafts
                </Nav.Link>
                <div className="dropdown ms-lg-2">
                  <button
                    className="btn btn-outline-light dropdown-toggle"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user?.username}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li>
                      <Link className="dropdown-item" to={`/profile/${user?.username}`}>
                        <i className="bi bi-person me-2"></i>
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/edit-profile">
                        <i className="bi bi-gear me-2"></i>
                        Edit Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/bookmarks">
                        <i className="bi bi-bookmark me-2"></i>
                        Bookmarks
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <Link 
                to="/auth"
                className="btn btn-outline-info ms-lg-5 mt-1 mt-lg-2"
              >
                Login
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavigator;
