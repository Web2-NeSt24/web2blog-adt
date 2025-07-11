import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { changePassword } from "../utils/auth";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useNavigate } from "react-router";

const SettingsPage: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Redirect if not authenticated (but wait for loading to complete)
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handlePasswordChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear message when user starts typing
    if (message) setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'danger', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'danger', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await changePassword(passwordData.newPassword);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: 'danger', text: result.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = passwordData.newPassword.length >= 6 && 
                     passwordData.newPassword === passwordData.confirmPassword;

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading...</p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="text-center py-5">
        <p>Redirecting to login...</p>
      </Container>
    );
  }

  return (
    <main style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '2rem' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card style={{ borderRadius: '15px' }}>
              <Card.Header className="bg-primary text-white text-center py-3">
                <h4 className="mb-0">Account Settings</h4>
              </Card.Header>
              <Card.Body className="p-4">
                {/* User Info Section */}
                <section className="mb-4">
                  <h5 className="text-muted mb-3">Account Information</h5>
                  <div className="p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Username:</strong> {user?.username}
                      </div>
                      <Button variant="outline-secondary" size="sm" onClick={() => navigate("/profile")}>
                        View Profile
                      </Button>
                    </div>
                  </div>
                </section>

                {/* Password Change Section */}
                <section>
                  <h5 className="text-muted mb-3">Change Password</h5>
                  
                  {message && (
                    <Alert variant={message.type} className="mb-3">
                      {message.text}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="newPassword" className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your new password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        required
                        minLength={6}
                        disabled={loading}
                      />
                      <Form.Text className="text-muted">
                        Minimum 6 characters
                      </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="confirmPassword" className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm your new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        required
                        disabled={loading}
                        className={passwordData.newPassword && passwordData.confirmPassword && 
                          passwordData.newPassword !== passwordData.confirmPassword ? 'is-invalid' : ''}
                      />
                      {passwordData.newPassword && passwordData.confirmPassword && 
                        passwordData.newPassword !== passwordData.confirmPassword && (
                        <div className="invalid-feedback">
                          Passwords do not match
                        </div>
                      )}
                    </Form.Group>

                    <div className="d-grid gap-2">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={loading || !isFormValid}
                        className="py-2"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Changing Password...
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => navigate("/profile")}
                        disabled={loading}
                      >
                        Back to Profile
                      </Button>
                    </div>
                  </Form>
                </section>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default SettingsPage;
