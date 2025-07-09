from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from blog_api import models


class ProfileViewTests(TestCase):
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        self.other_user = User.objects.create_user(username="otheruser", password="testpass123")
        
        # Update profile data
        self.user.profile.biography = "Test biography"
        self.user.profile.save()
        
        # Create some posts for the user
        self.post1 = models.Post.objects.create(
            profile=self.user.profile,
            title="Post 1",
            content="Content 1"
        )
        self.post2 = models.Post.objects.create(
            profile=self.user.profile,
            title="Post 2",
            content="Content 2"
        )
        
        self.profile_url = f"/api/user/by-id/{self.user.id}/profile"
        self.other_profile_url = f"/api/user/by-id/{self.other_user.id}/profile"
        self.nonexistent_profile_url = "/api/user/by-id/999/profile"
        self.me_profile_url = "/api/user/me/profile"
        self.username_profile_url = f"/api/user/by-name/{self.user.username}/profile"
        self.nonexistent_username_url = "/api/user/by-name/nonexistentuser/profile"
    
    def test_get_profile_success(self):
        """Test retrieving a profile returns 200 with correct data"""
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["username"], "testuser")
        self.assertEqual(response.data["biography"], "Test biography")
        self.assertEqual(len(response.data["post_ids"]), 2)
        self.assertIn(self.post1.id, response.data["post_ids"])
        self.assertIn(self.post2.id, response.data["post_ids"])
    
    def test_get_profile_not_found(self):
        """Test retrieving non-existent profile returns 404"""
        response = self.client.get(self.nonexistent_profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("User not found", response.data["error"])
    
    def test_get_profile_unauthenticated(self):
        """Test anonymous users can read profiles"""
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["username"], "testuser")
    
    def test_update_profile_success(self):
        """Test updating a profile successfully"""
        self.client.login(username="testuser", password="testpass123")
        update_data = {
            "biography": "Updated biography",
            "profile_picture": None
        }
        response = self.client.put(self.profile_url, update_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.biography, "Updated biography")

    def test_update_profile_authorization_own_profile(self):
        """Test users can update their own profile"""
        self.client.force_authenticate(user=self.user)
        
        update_data = {
            "biography": "Updated by owner",
            "profile_picture": None
        }
        response = self.client.put(self.profile_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_update_profile_authorization_other_user_profile(self):
        """Test users can't update other users' profiles"""
        self.client.force_authenticate(user=self.other_user)
        
        update_data = {
            "biography": "Unauthorized update",
            "profile_picture": None
        }
        response = self.client.put(self.profile_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("You can only update your own profile", response.data["error"])
    
    def test_update_profile_authentication_required(self):
        """Test unauthenticated update requests are rejected"""
        update_data = {
            "biography": "Unauthorized update",
            "profile_picture": None
        }
        response = self.client.put(self.profile_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_profile_invalid_data(self):
        """Test updating profile with invalid data"""
        self.client.force_authenticate(user=self.user)
        
        # Missing required fields
        response = self.client.put(self.profile_url, {''}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        self.client.login(username="testuser", password="testpass123")
        update_data = {}
        response = self.client.put(self.profile_url, update_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("At least one field (biography or profile_picture) must be provided.", response.data["non_field_errors"])
        


class MeProfileViewTests(TestCase):
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        self.me_profile_url = "/api/user/me/profile"
    
    def test_get_me_profile_success(self):
        """Test retrieving own profile via /me endpoint returns 200"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(self.me_profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["username"], "testuser")
    
    def test_get_me_profile_authentication_required(self):
        """Test /me endpoint requires authentication"""
        response = self.client.get(self.me_profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_me_profile_success(self):
        """Test updating own profile via /me endpoint"""
        self.client.force_authenticate(user=self.user)
        
        update_data = {
            "biography": "Updated via me endpoint",
            "profile_picture": None
        }
        response = self.client.put(self.me_profile_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify profile was updated
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.biography, "Updated via me endpoint")
    
    def test_update_me_profile_authentication_required(self):
        """Test /me endpoint update requires authentication"""
        update_data = {
            "biography": "Unauthorized update",
            "profile_picture": None
        }
        response = self.client.put(self.me_profile_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UsernameProfileViewTests(TestCase):
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        self.other_user = User.objects.create_user(username="otheruser", password="testpass123")
        
        self.username_profile_url = f"/api/user/by-name/{self.user.username}/profile"
        self.nonexistent_username_url = "/api/user/by-name/nonexistentuser/profile"
    
    def test_get_profile_by_username_success(self):
        """Test retrieving profile by username returns 200"""
        response = self.client.get(self.username_profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["username"], "testuser")
    
    def test_get_profile_by_username_not_found(self):
        """Test retrieving profile by non-existent username returns 404"""
        response = self.client.get(self.nonexistent_username_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Username does not exist", response.data["error"])
    
    def test_get_profile_by_username_case_insensitive(self):
        """Test username lookup is case insensitive"""
        uppercase_url = f"/api/user/by-name/{self.user.username.upper()}/profile"
        response = self.client.get(uppercase_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["username"], "testuser")
    
    def test_update_profile_by_username_success(self):
        """Test updating profile via username endpoint"""
        self.client.force_authenticate(user=self.user)
        
        update_data = {
            "biography": "Updated via username endpoint",
            "profile_picture": None
        }
        response = self.client.put(self.username_profile_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify profile was updated
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.biography, "Updated via username endpoint")
    
    def test_update_profile_by_username_authorization(self):
        """Test users can't update other users' profiles via username endpoint"""
        self.client.force_authenticate(user=self.other_user)
        
        update_data = {
            "biography": "Unauthorized update",
            "profile_picture": None
        }
        response = self.client.put(self.username_profile_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("You can only update your own profile", response.data["error"])
    
    def test_update_profile_by_username_not_found(self):
        """Test updating profile for non-existent username returns 404"""
        self.client.force_authenticate(user=self.user)
        
        update_data = {
            "biography": "Update non-existent",
            "profile_picture": None
        }
        response = self.client.put(self.nonexistent_username_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Username does not exist", response.data["error"])
