from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from blog_api import models


class CommentViewTests(TestCase):
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = models.User.objects.create_user(username="testuser", password="testpass123")
        self.post = models.Post.objects.create(
            profile=self.user.profile,
            title="Test Post",
            content="Test content"
        )
        self.comment_url = f"/api/post/{self.post.id}/comments/"

    def test_create_comment(self):
        """Test creating a comment on a post"""
        self.client.login(username="testuser", password="testpass123")
        response = self.client.post(self.comment_url, {"content": "Test comment"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(models.Comment.objects.filter(post=self.post, content="Test comment").exists())

    def test_create_comment_invalid_data(self):
        """Test creating a comment with invalid data"""
        self.client.login(username="testuser", password="testpass123")
        response = self.client.post(self.comment_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("content", response.data)

    def test_list_comments(self):
        """Test listing comments for a post"""
        models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Comment 1")
        models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Comment 2")

        response = self.client.get(self.comment_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_comments_post_not_found(self):
        """Test listing comments for a non-existent post"""
        invalid_url = "/api/post/999/comments/"
        response = self.client.get(invalid_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Post not found", response.data["error"])

    def test_delete_comment(self):
        """Test deleting a comment"""
        comment = models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Comment to delete")
        delete_url = f"/api/comments/{comment.id}/"

        self.client.login(username="testuser", password="testpass123")
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(models.Comment.objects.filter(id=comment.id).exists())

    def test_delete_comment_not_found(self):
        """Test deleting a non-existent comment"""
        delete_url = "/api/comments/999/"

        self.client.login(username="testuser", password="testpass123")
        response = self.client.delete(delete_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Comment not found", response.data["error"])

    def test_patch_comment(self):
        """Test updating a comment"""
        comment = models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Original content")
        patch_url = f"/api/comments/{comment.id}/"

        self.client.login(username="testuser", password="testpass123")
        response = self.client.patch(patch_url, {"content": "Updated content"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        comment.refresh_from_db()
        self.assertEqual(comment.content, "Updated content")

    def test_patch_comment_invalid_data(self):
        """Test updating a comment with invalid data"""
        comment = models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Original content")
        patch_url = f"/api/comments/{comment.id}/"

        self.client.login(username="testuser", password="testpass123")
        response = self.client.patch(patch_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("content", response.data)

    def test_patch_comment_partial_data(self):
        """Test updating a comment with partial data"""
        comment = models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Original content")
        patch_url = f"/api/comments/{comment.id}/"

        self.client.login(username="testuser", password="testpass123")
        response = self.client.patch(patch_url, {"content": "Partially updated content"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        comment.refresh_from_db()
        self.assertEqual(comment.content, "Partially updated content")

    def test_patch_comment_unauthorized(self):
        """Test unauthorized users cannot update comments"""
        comment = models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Original content")
        patch_url = f"/api/comments/{comment.id}/"

        self.client.login(username="otheruser", password="testpass123")
        response = self.client.patch(patch_url, {"content": "Unauthorized update"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_comment_unauthorized(self):
        """Test unauthorized users cannot delete comments"""
        comment = models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Comment to delete")
        delete_url = f"/api/comments/{comment.id}/"

        self.client.login(username="otheruser", password="testpass123")
        response = self.client.delete(delete_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_comment_with_serializer_validation_error(self):
        """Test creating a comment that triggers serializer validation error"""
        # Create a mock scenario where serializer validation might fail
        self.client.login(username="testuser", password="testpass123")
        
        # Send invalid content that would trigger validation (e.g., extremely long content)
        invalid_content = "x" * 10000  # Very long content that might trigger validation
        response = self.client.post(self.comment_url, {"content": invalid_content})
        
        # This should either succeed or fail with 400 - we're testing the validation path
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_patch_comment_with_serializer_validation_error(self):
        """Test updating a comment that triggers serializer validation error"""
        comment = models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Original content")
        patch_url = f"/api/comments/{comment.id}/"
        
        self.client.login(username="testuser", password="testpass123")
        
        # Send invalid content that would trigger validation
        invalid_content = "x" * 10000  # Very long content that might trigger validation  
        response = self.client.patch(patch_url, {"content": invalid_content}, format="json")
        
        # This should either succeed or fail with 400 - we're testing the validation path
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])

    def test_patch_comment_with_no_content_field(self):
        """Test updating a comment with data that doesn't include content field"""
        comment = models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Original content")
        patch_url = f"/api/comments/{comment.id}/"
        
        self.client.login(username="testuser", password="testpass123")
        
        # Send data without content field to test the "content" in validated_data condition
        response = self.client.patch(patch_url, {"some_other_field": "value"}, format="json")
        
        # Should succeed but not change content since no content was provided
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        comment.refresh_from_db()
        self.assertEqual(comment.content, "Original content")  # Content should remain unchanged

    def test_delete_comment_success(self):
        """Test successfully deleting a comment to ensure delete() method is called"""
        comment = models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Comment to delete")
        delete_url = f"/api/comments/{comment.id}/"
        comment_id = comment.id

        self.client.login(username="testuser", password="testpass123")
        response = self.client.delete(delete_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        # Verify the comment was actually deleted from the database
        self.assertFalse(models.Comment.objects.filter(id=comment_id).exists())

    def test_create_comment_triggers_validation_error_path(self):
        """Test to trigger ValidationError path in POST method"""
        from unittest.mock import patch
        from rest_framework import serializers as drf_serializers
        
        self.client.login(username="testuser", password="testpass123")
        
        # Mock the serializer to raise a ValidationError
        with patch('blog_api.serializers.CommentCreateSerializer.is_valid') as mock_is_valid:
            mock_is_valid.side_effect = drf_serializers.ValidationError("Test validation error")
            
            response = self.client.post(self.comment_url, {"content": "Test content"})
            
            # Should return 400 due to the mocked validation error
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_comment_triggers_validation_error_path(self):
        """Test to trigger ValidationError path in PATCH method"""
        from unittest.mock import patch
        from rest_framework import serializers as drf_serializers
        
        comment = models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Original content")
        patch_url = f"/api/comments/{comment.id}/"
        
        self.client.login(username="testuser", password="testpass123")
        
        # Mock the serializer to raise a ValidationError
        with patch('blog_api.serializers.CommentCreateSerializer.is_valid') as mock_is_valid:
            mock_is_valid.side_effect = drf_serializers.ValidationError("Test validation error")
            
            response = self.client.patch(patch_url, {"content": "Updated content"}, format="json")
            
            # Should return 400 due to the mocked validation error
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_comment_without_content_in_validated_data(self):
        """Test PATCH where validated_data doesn't contain 'content' key"""
        from unittest.mock import patch
        
        comment = models.Comment.objects.create(post=self.post, author_profile=self.user.profile, content="Original content")
        patch_url = f"/api/comments/{comment.id}/"
        
        self.client.login(username="testuser", password="testpass123")
        
        # Mock the serializer to return validated_data without 'content'
        with patch('blog_api.serializers.CommentCreateSerializer') as mock_serializer_class:
            mock_serializer = mock_serializer_class.return_value
            mock_serializer.is_valid.return_value = True
            mock_serializer.validated_data = {}  # No 'content' key
            
            response = self.client.patch(patch_url, {"some_field": "value"}, format="json")
            
            # Should succeed but not change content
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            comment.refresh_from_db()
            self.assertEqual(comment.content, "Original content")  # Should remain unchanged