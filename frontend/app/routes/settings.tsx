import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import type { Route } from "./+types/settings";
import Layout from '~/components/Layout';
import { api } from '~/lib/api';
import { useAuth } from '~/hooks/useAuth';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings - RustyPython" },
    { name: "description", content: "Manage your account settings on RustyPython" },
  ];
}

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    biography: '',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        biography: user.biography || '',
      });
    }
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.updateProfile(user.user.id, {
        biography: profileData.biography,
        profile_picture: null, // TODO: Add image upload
      });
      setSuccess('Profile updated successfully!');
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await api.changePassword(passwordData.newPassword);
      setSuccess('Password changed successfully!');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Layout>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>
                <i className="bi bi-gear me-2"></i>
                Account Settings
              </h2>
              <Button variant="outline-secondary" href={`/profile/${user.user.username}`}>
                <i className="bi bi-person me-1"></i>
                View Profile
              </Button>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <Tabs defaultActiveKey="profile" className="border-bottom">
                  <Tab eventKey="profile" title="Profile Settings">
                    <div className="p-4">
                      <Form onSubmit={handleProfileSubmit}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Username</Form.Label>
                              <Form.Control
                                type="text"
                                value={user.user.username}
                                disabled
                                className="bg-light"
                              />
                              <Form.Text className="text-muted">
                                Username cannot be changed
                              </Form.Text>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>User ID</Form.Label>
                              <Form.Control
                                type="text"
                                value={user.user.id}
                                disabled
                                className="bg-light"
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-4">
                          <Form.Label>Biography</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="biography"
                            value={profileData.biography}
                            onChange={handleProfileChange}
                            placeholder="Tell us about yourself..."
                            disabled={loading}
                          />
                          <Form.Text className="text-muted">
                            This will be displayed on your public profile
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label>Profile Picture</Form.Label>
                          <div className="d-flex align-items-center gap-3">
                            {user.profile_picture ? (
                              <img
                                src={api.getImageUrl(user.profile_picture)}
                                alt="Profile"
                                className="rounded-circle"
                                style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div 
                                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                                style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}
                              >
                                {user.user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <Button variant="outline-primary" size="sm" disabled>
                                <i className="bi bi-camera me-1"></i>
                                Change Picture
                              </Button>
                              <div className="small text-muted mt-1">
                                Image upload coming soon
                              </div>
                            </div>
                          </div>
                        </Form.Group>

                        <Button
                          type="submit"
                          variant="primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-lg me-1"></i>
                              Update Profile
                            </>
                          )}
                        </Button>
                      </Form>
                    </div>
                  </Tab>

                  <Tab eventKey="security" title="Security">
                    <div className="p-4">
                      <h5 className="mb-3">Change Password</h5>
                      <Form onSubmit={handlePasswordSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                            required
                            disabled={loading}
                            minLength={6}
                          />
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm new password"
                            required
                            disabled={loading}
                            className={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? 'is-invalid' : ''}
                          />
                          {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                            <div className="invalid-feedback">
                              Passwords do not match
                            </div>
                          )}
                        </Form.Group>

                        <Button
                          type="submit"
                          variant="primary"
                          disabled={loading || passwordData.newPassword !== passwordData.confirmPassword || !passwordData.newPassword}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Changing...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-shield-check me-1"></i>
                              Change Password
                            </>
                          )}
                        </Button>
                      </Form>
                    </div>
                  </Tab>

                  <Tab eventKey="preferences" title="Preferences">
                    <div className="p-4">
                      <h5 className="mb-3">Account Preferences</h5>
                      <div className="text-muted">
                        <p>Additional preferences and settings will be available here in future updates.</p>
                        <ul>
                          <li>Email notifications</li>
                          <li>Privacy settings</li>
                          <li>Theme preferences</li>
                          <li>Language settings</li>
                        </ul>
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}