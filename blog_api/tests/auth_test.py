from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status


class AuthenticationTests(TestCase):
    
    def setUp(self):
        """Test Data"""
        self.register_url = "/api/auth/register"
        self.login_url = "/api/auth/login"
        self.valid_credentials = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123"
        }
        self.invalid_credentials = {
            "username": "testuser",
            "password": "wrongpass"
        }
    
    def test_successful_registration(self):
        """Test that a valid username/password creates a user and returns 201"""
        response = self.client.post(self.register_url, self.valid_credentials)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="testuser").exists())
        # Verify user is authenticated after registration
        self.assertTrue(response.wsgi_request.user.is_authenticated)
    
    def test_username_validation_non_alphanumeric(self):
        """Test that non-alphanumeric usernames are rejected with 400"""
        invalid_data = {
            "username": "test@user",
            "email": "test@example.com",
            "password": "testpass123"
        }
        response = self.client.post(self.register_url, invalid_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Username must be alphanumeric", response.data["error"])
        self.assertFalse(User.objects.filter(username="test@user").exists())
    
    def test_duplicate_username(self):
        """Test that attempting to register an existing username returns 409"""
        # Create user first
        User.objects.create_user(username="testuser", password="pass123")
        
        response = self.client.post(self.register_url, self.valid_credentials)
        
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn("User already exists", response.data["error"])
    
    def test_case_insensitivity_registration(self):
        """Test that usernames are properly converted to lowercase"""
        uppercase_data = {
            "username": "TESTUSER",
            "email": "test@example.com",
            "password": "testpass123"
        }
        response = self.client.post(self.register_url, uppercase_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # User should be stored with lowercase username
        self.assertTrue(User.objects.filter(username="testuser").exists())
        self.assertFalse(User.objects.filter(username="TESTUSER").exists())
    
    def test_invalid_registration_data(self):
        """Test handling of missing fields in registration"""
        # Missing password
        invalid_data = {"username": "testuser"}
        response = self.client.post(self.register_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Missing username
        invalid_data = {"password": "testpass123"}
        response = self.client.post(self.register_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_successful_login(self):
        """Test that valid credentials authenticate user and return 200"""
        # Create user first
        User.objects.create_user(username="testuser", password="testpass123")
        
        response = self.client.post(self.login_url, self.valid_credentials)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify user is authenticated after login
        self.assertTrue(response.wsgi_request.user.is_authenticated)
    
    def test_invalid_credentials(self):
        """Test that wrong password returns 403"""
        # Create user first
        User.objects.create_user(username="testuser", password="testpass123")
        
        response = self.client.post(self.login_url, self.invalid_credentials)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("Invalid credentials", response.data["error"])
    
    def test_nonexistent_user_login(self):
        """Test that login attempt for nonexistent user returns 403"""
        response = self.client.post(self.login_url, self.valid_credentials)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("Invalid credentials", response.data["error"])
    
    def test_case_insensitivity_login(self):
        """Test that username case doesn't affect authentication"""
        # Create user with lowercase username
        User.objects.create_user(username="testuser", password="testpass123")
        
        # Try login with uppercase username
        uppercase_data = {
            "username": "TESTUSER",
            "password": "testpass123"
        }
        response = self.client.post(self.login_url, uppercase_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.wsgi_request.user.is_authenticated)
    
    def test_invalid_login_data(self):
        """Test handling of malformed login requests"""
        # Missing password
        invalid_data = {"username": "testuser"}
        response = self.client.post(self.login_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Missing username
        invalid_data = {"password": "testpass123"}
        response = self.client.post(self.login_url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
