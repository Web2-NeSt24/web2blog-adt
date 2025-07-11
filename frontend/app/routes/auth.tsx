import React, { useState } from 'react';
import { Tab, Nav, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import {
  FaFacebookF,
  FaGoogle,
  FaTwitter,
  FaGithub,
} from 'react-icons/fa';
import { loginUser, registerUser, validateUsername, validatePassword, validateEmail } from '../utils/auth';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const AuthTabs: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeKey, setActiveKey] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login form state
  const [loginData, setLoginData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false,
  });

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginUser(loginData.username, loginData.password);
      
      if (result.user) {
        login(result.user);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/'); // Redirect to home page
        }, 1000);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Client-side validation
    const usernameValidation = validateUsername(registerData.username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.error!);
      setIsLoading(false);
      return;
    }

    const emailValidation = validateEmail(registerData.email);
    if (!emailValidation.valid) {
      setError(emailValidation.error!);
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(registerData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error!);
      setIsLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!registerData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerUser(
        registerData.username,
        registerData.email,
        registerData.password
      );

      if (result.user) {
        login(result.user);
        setSuccess('Registration successful! You are now logged in. Redirecting...');
        setTimeout(() => {
          navigate('/'); // Redirect to home page
        }, 1000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginChange = (field: keyof LoginFormData, value: string | boolean) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user types
  };

  const handleRegisterChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user types
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">
      <div className="col-md-6 col-lg-4">
        <div className="card shadow">
          <div className="card-body p-5">
            <h2 className="text-center mb-4">Welcome</h2>
            
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert variant="success">
                {success}
              </Alert>
            )}

            <Tab.Container activeKey={activeKey} onSelect={(k) => k && setActiveKey(k)}>
              {/* Pills navs */}
              <Nav variant="pills" className="nav-justified mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="login">Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="register">Register</Nav.Link>
                </Nav.Item>
              </Nav>

              {/* Pills content */}
              <Tab.Content>
                {/* Login Pane */}
                <Tab.Pane eventKey="login">
                  <Form onSubmit={handleLoginSubmit}>
                    <div className="text-center mb-3">
                      <p>Sign in with:</p>
                      {[FaFacebookF, FaGoogle, FaTwitter, FaGithub].map((Icon, idx) => (
                        <Button
                          key={idx}
                          variant="link"
                          className="btn-floating mx-1"
                          type="button"
                          disabled
                          title="Social login not implemented yet"
                        >
                          <Icon />
                        </Button>
                      ))}
                    </div>

                    <p className="text-center">or:</p>

                    <Form.Group controlId="loginName" className="form-outline mb-4">
                      <Form.Label>Username</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => handleLoginChange('username', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>

                    <Form.Group controlId="loginPassword" className="form-outline mb-4">
                      <Form.Label>Password</Form.Label>
                      <Form.Control 
                        type="password" 
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => handleLoginChange('password', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>

                    <Row className="mb-4">
                      <Col md={6} className="d-flex justify-content-center">
                        <Form.Check
                          type="checkbox"
                          label="Remember me"
                          id="loginCheck"
                          checked={loginData.rememberMe}
                          onChange={(e) => handleLoginChange('rememberMe', e.target.checked)}
                          disabled={isLoading}
                        />
                      </Col>
                      <Col md={6} className="d-flex justify-content-center">
                        <Button variant="link" className="p-0" disabled>
                          Forgot password?
                        </Button>
                      </Col>
                    </Row>

                    <Button 
                      type="submit" 
                      className="btn-primary w-100 mb-4"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>

                    <div className="text-center">
                      <p>
                        Not a member?{' '}
                        <Button 
                          variant="link" 
                          className="p-0" 
                          onClick={() => setActiveKey('register')}
                          disabled={isLoading}
                        >
                          Register
                        </Button>
                      </p>
                    </div>
                  </Form>
                </Tab.Pane>

                {/* Register Pane */}
                <Tab.Pane eventKey="register">
                  <Form onSubmit={handleRegisterSubmit}>
                    <div className="text-center mb-3">
                      <p>Sign up with:</p>
                      {[FaFacebookF, FaGoogle, FaTwitter, FaGithub].map((Icon, idx) => (
                        <Button
                          key={idx}
                          variant="link"
                          className="btn-floating mx-1"
                          type="button"
                          disabled
                          title="Social login not implemented yet"
                        >
                          <Icon />
                        </Button>
                      ))}
                    </div>

                    <p className="text-center">or:</p>

                    <Form.Group controlId="registerUsername" className="form-outline mb-4">
                      <Form.Label>Username</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Choose a username"
                        value={registerData.username}
                        onChange={(e) => handleRegisterChange('username', e.target.value)}
                        required
                        minLength={3}
                        maxLength={150}
                        pattern="[a-zA-Z0-9]+"
                        title="Username must be alphanumeric and 3-150 characters long"
                        disabled={isLoading}
                      />
                      <Form.Text className="text-muted">
                        Must be alphanumeric, 3-150 characters
                      </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="registerEmail" className="form-outline mb-4">
                      <Form.Label>Email</Form.Label>
                      <Form.Control 
                        type="email" 
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => handleRegisterChange('email', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>

                    <Form.Group controlId="registerPassword" className="form-outline mb-4">
                      <Form.Label>Password</Form.Label>
                      <Form.Control 
                        type="password" 
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => handleRegisterChange('password', e.target.value)}
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                      <Form.Text className="text-muted">
                        Minimum 6 characters
                      </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="registerRepeatPassword" className="form-outline mb-4">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control 
                        type="password" 
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                        required
                        disabled={isLoading}
                        className={registerData.password && registerData.confirmPassword && 
                          registerData.password !== registerData.confirmPassword ? 'is-invalid' : ''}
                      />
                      {registerData.password && registerData.confirmPassword && 
                        registerData.password !== registerData.confirmPassword && (
                        <div className="invalid-feedback">
                          Passwords do not match
                        </div>
                      )}
                    </Form.Group>

                    <Form.Check
                      type="checkbox"
                      id="registerCheck"
                      label="I have read and agree to the terms"
                      className="d-flex justify-content-center mb-4"
                      checked={registerData.agreeToTerms}
                      onChange={(e) => handleRegisterChange('agreeToTerms', e.target.checked)}
                      required
                      disabled={isLoading}
                    />

                    <Button 
                      type="submit" 
                      className="btn-primary w-100 mb-3"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Sign up'}
                    </Button>
                  </Form>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTabs;
