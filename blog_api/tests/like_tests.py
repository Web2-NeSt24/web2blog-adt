from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from blog_api import models


class LikeViewTests(APITestCase):
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        self.other_user = User.objects.create_user(username="otheruser", password="testpass123")
        
        # Create a test post
        self.post = models.Post.objects.create(
            profile=self.user.profile,
            title="Test Post",
            content="Test content"
        )
        
        self.like_url = f"/api/post/{self.post.id}/like/"
        self.nonexistent_post_url = "/api/post/999/like/"
    
    def test_create_like(self):
        """Test liking a post returns 201"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(self.like_url)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(models.Like.objects.filter(
            post=self.post, 
            liker_profile=self.user.profile
        ).exists())
    
    def test_toggle_like_unlike(self):
        """Test unliking a previously liked post returns 200"""
        self.client.force_authenticate(user=self.user)
        
        # First like the post
        models.Like.objects.create(post=self.post, liker_profile=self.user.profile)
        
        response = self.client.post(self.like_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(models.Like.objects.filter(
            post=self.post, 
            liker_profile=self.user.profile
        ).exists())
    
    def test_check_liked_status_true(self):
        """Test correct response when post is liked"""
        self.client.force_authenticate(user=self.user)
        
        # Create a like
        models.Like.objects.create(post=self.post, liker_profile=self.user.profile)
        
        response = self.client.get(self.like_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["liked"])
    
    def test_check_liked_status_false(self):
        """Test correct response when post is not liked"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(self.like_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["liked"])
    
    def test_post_not_found_like(self):
        """Test behavior with non-existent post IDs for POST"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(self.nonexistent_post_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Post not found", response.data["error"])
    
    def test_post_not_found_get(self):
        """Test behavior with non-existent post IDs for GET"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(self.nonexistent_post_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Post not found", response.data["error"])
    
    def test_authentication_required_post(self):
        """Test unauthenticated POST requests are rejected"""
        response = self.client.post(self.like_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_authentication_required_get(self):
        """Test unauthenticated GET requests are rejected"""
        response = self.client.get(self.like_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_multiple_users_like_same_post(self):
        """Test multiple users can like the same post"""
        self.client.force_authenticate(user=self.user)
        
        # First user likes
        response = self.client.post(self.like_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Second user likes
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(self.like_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Both likes should exist
        self.assertEqual(models.Like.objects.filter(post=self.post).count(), 2)
    
    def test_user_isolation(self):
        """Test that like status is user-specific"""
        # User 1 likes the post
        models.Like.objects.create(post=self.post, liker_profile=self.user.profile)
        
        # User 2 checks like status
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(self.like_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["liked"])  # Should be False for other_user
