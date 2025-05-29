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