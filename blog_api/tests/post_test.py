from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from blog_api import models


class PostViewTests(TestCase):
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        self.other_user = User.objects.create_user(username="otheruser", password="testpass123")
        
        # Create test hashtags
        self.tag1 = models.Hashtag.objects.create(value="django")
        self.tag2 = models.Hashtag.objects.create(value="python")
        
        # Create a test post
        self.post = models.Post.objects.create(
            profile=self.user.profile,
            title="Test Post",
            content="Test content"
        )
        self.post.tags.set([self.tag1, self.tag2])
        
        self.post_url = f"/api/post/by-id/{self.post.id}"
        self.nonexistent_post_url = "/api/post/by-id/999"
    
    def test_get_post_success(self):
        """Test retrieving a post returns 200 with correct data"""
        response = self.client.get(self.post_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Post")
        self.assertEqual(response.data["content"], "Test content")
        self.assertEqual(response.data["profile"]["user"]["username"], "testuser")
        self.assertIn("django", response.data["tags"])
        self.assertIn("python", response.data["tags"])
    
    def test_get_post_not_found(self):
        """Test retrieving non-existent post returns 404"""
        response = self.client.get(self.nonexistent_post_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Post does not exist", response.data["error"])
    
    def test_get_post_unauthenticated(self):
        """Test anonymous users can read posts"""
        response = self.client.get(self.post_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Post")
    
    def test_update_post_success(self):
        """Test successful post update returns 200"""
        self.client.force_authenticate(user=self.user)
        
        update_data = {
            "title": "Updated Title",
            "content": "Updated content",
            "image": None,
            "tags": ["newTag", "anotherTag"]
        }
        response = self.client.put(self.post_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify post was updated in database
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, "Updated Title")
        self.assertEqual(self.post.content, "Updated content")
        
        # Verify tags were updated
        tag_values = [tag.value for tag in self.post.tags.all()]
        self.assertIn("newTag", tag_values)
        self.assertIn("anotherTag", tag_values)
    
    def test_update_post_not_found(self):
        """Test updating non-existent post returns 404"""
        self.client.force_authenticate(user=self.user)
        
        update_data = {
            "title": "Updated Title",
            "content": "Updated content",
            "image": None,
            "tags": []
        }
        response = self.client.put(self.nonexistent_post_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Post does not exist", response.data["error"])
    
    def test_update_post_authorization_own_post(self):
        """Test users can update their own posts"""
        self.client.force_authenticate(user=self.user)
        
        update_data = {
            "title": "Owner Update",
            "content": "Updated by owner",
            "image": None,
            "tags": []
        }
        response = self.client.put(self.post_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_update_post_authorization_other_user_post(self):
        """Test users can't update other users' posts"""
        self.client.force_authenticate(user=self.other_user)
        
        update_data = {
            "title": "Unauthorized Update",
            "content": "Updated by non-owner",
            "image": None,
            "tags": []
        }
        response = self.client.put(self.post_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("You can only edit your own posts", response.data["error"])
    
    def test_update_post_authentication_required(self):
        """Test unauthenticated update requests are rejected"""
        update_data = {
            "title": "Unauthorized Update",
            "content": "Updated content",
            "image": None,
            "tags": []
        }
        response = self.client.put(self.post_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_post_invalid_data(self):
        """Test updating post with invalid data"""
        self.client.force_authenticate(user=self.user)
        
        # Missing required fields
        response = self.client.put(self.post_url, {''}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_delete_post_success(self):
        """Test successful post deletion returns 200"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(self.post_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify post was deleted from database
        self.assertFalse(models.Post.objects.filter(id=self.post.id).exists())
    
    def test_delete_post_not_found(self):
        """Test deleting non-existent post returns 404"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(self.nonexistent_post_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Post does not exist", response.data["error"])
    
    def test_delete_post_authorization_own_post(self):
        """Test users can delete their own posts"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(self.post_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_delete_post_authorization_other_user_post(self):
        """Test users can't delete other users' posts"""
        self.client.force_authenticate(user=self.other_user)
        
        response = self.client.delete(self.post_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("You can only delete your own posts", response.data["error"])
    
    def test_delete_post_authentication_required(self):
        """Test unauthenticated delete requests are rejected"""
        response = self.client.delete(self.post_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_tag_creation_on_update(self):
        """Test that new tags are created when updating a post"""
        self.client.force_authenticate(user=self.user)
        
        # Check initial tag count
        initial_tag_count = models.Hashtag.objects.count()
        
        update_data = {
            "title": "Updated Title",
            "content": "Updated content",
            "image": None,
            "tags": ["brandNewTag", "anotherBrandNewTag"]
        }
        response = self.client.put(self.post_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify new tags were created
        self.assertTrue(models.Hashtag.objects.filter(value="brandNewTag").exists())
        self.assertTrue(models.Hashtag.objects.filter(value="anotherBrandNewTag").exists())
        
        # Should have 2 more tags than before
        self.assertEqual(models.Hashtag.objects.count(), initial_tag_count + 2)
    
    def test_post_creation_no_duplicates(self):
        """Test that creating a post through the API creates exactly one post (no accidental duplicates)"""
        self.client.force_authenticate(user=self.user)
        
        # Check initial post count (should be 1 from setUp)
        initial_post_count = models.Post.objects.count()
        self.assertEqual(initial_post_count, 1)
        
        # Create a new draft
        drafts_url = "/api/drafts/"
        response = self.client.post(drafts_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        draft_id = response.data["draft_post_id"]
        
        # Update the draft with content
        draft_url = f"/api/post/by-id/{draft_id}"
        update_data = {
            "title": "New Post Title",
            "content": "New post content",
            "image": None,
            "tags": ["test", "api"]
        }
        response = self.client.put(draft_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Publish the draft
        response = self.client.post(draft_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify exactly one new post was created (total should be 2)
        final_post_count = models.Post.objects.count()
        self.assertEqual(final_post_count, initial_post_count + 1)
        
        # Verify the new post exists and has correct properties
        new_post = models.Post.objects.get(id=draft_id)
        self.assertEqual(new_post.title, "New Post Title")
        self.assertEqual(new_post.content, "New post content")
        self.assertEqual(new_post.profile, self.user.profile)
        self.assertFalse(new_post.draft)  # Should be published now
        
        # Verify no duplicate posts with same content were created
        posts_with_title = models.Post.objects.filter(title="New Post Title")
        self.assertEqual(posts_with_title.count(), 1)
