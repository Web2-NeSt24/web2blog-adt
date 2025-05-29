from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from blog_api import models


class BookmarkPostViewTests(TestCase):
    
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
        
        self.bookmark_url = f"/api/post/{self.post.id}/bookmark/"
        self.nonexistent_post_url = "/api/post/999/bookmark/"
    
    def test_successful_bookmark_creation(self):
        """Test creating a bookmark returns 201 and correct data"""
        self.client.login(username="testuser", password="testpass123")
        
        bookmark_data = {"title": "My Bookmark"}
        response = self.client.post(self.bookmark_url, bookmark_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "My Bookmark")
        self.assertEqual(response.data["post"]["id"], self.post.id)
        
        # Verify bookmark was created in database
        self.assertTrue(models.Bookmark.objects.filter(
            post=self.post, 
            creator_profile=self.user.profile
        ).exists())
    
    def test_bookmark_creation_empty_title(self):
        """Test creating bookmark with empty title"""
        self.client.login(username="testuser", password="testpass123")
        
        bookmark_data = {"title": ""}
        response = self.client.post(self.bookmark_url, bookmark_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "")
    
    def test_bookmark_creation_no_title(self):
        """Test creating bookmark without title field"""
        self.client.login(username="testuser", password="testpass123")
        
        response = self.client.post(self.bookmark_url, {})
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "")
    
    def test_post_not_found(self):
        """Test attempting to bookmark non-existent post returns 404"""
        self.client.login(username="testuser", password="testpass123")
        
        bookmark_data = {"title": "Non-existent post bookmark"}
        response = self.client.post(self.nonexistent_post_url, bookmark_data)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Post not found", response.data["error"])
    
    def test_duplicate_bookmark(self):
        """Test attempting to bookmark same post twice returns 409"""
        self.client.login(username="testuser", password="testpass123")
        
        # Create first bookmark
        models.Bookmark.objects.create(
            post=self.post,
            creator_profile=self.user.profile,
            title="First bookmark"
        )
        
        # Try to create second bookmark for same post
        bookmark_data = {"title": "Second bookmark"}
        response = self.client.post(self.bookmark_url, bookmark_data)
        
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn("Post already bookmarked", response.data["error"])
    
    def test_authentication_required(self):
        """Test unauthenticated requests are rejected"""
        bookmark_data = {"title": "Unauthorized bookmark"}
        response = self.client.post(self.bookmark_url, bookmark_data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class BookmarkListViewTests(TestCase):
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        self.other_user = User.objects.create_user(username="otheruser", password="testpass123")
        
        # Create test posts
        self.post1 = models.Post.objects.create(
            profile=self.user.profile,
            title="Test Post 1",
            content="Test content 1"
        )
        self.post2 = models.Post.objects.create(
            profile=self.user.profile,
            title="Test Post 2",
            content="Test content 2"
        )
        
        self.bookmarks_url = "/api/bookmarks/"
    
    def test_list_retrieval(self):
        """Test all user bookmarks are returned"""
        self.client.login(username="testuser", password="testpass123")
        
        # Create bookmarks
        models.Bookmark.objects.create(
            post=self.post1,
            creator_profile=self.user.profile,
            title="Bookmark 1"
        )
        models.Bookmark.objects.create(
            post=self.post2,
            creator_profile=self.user.profile,
            title="Bookmark 2"
        )
        
        response = self.client.get(self.bookmarks_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # Check that correct bookmarks are returned
        bookmark_titles = [b["title"] for b in response.data]
        self.assertIn("Bookmark 1", bookmark_titles)
        self.assertIn("Bookmark 2", bookmark_titles)
    
    def test_empty_list(self):
        """Test behavior when user has no bookmarks"""
        self.client.login(username="testuser", password="testpass123")
        
        response = self.client.get(self.bookmarks_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
    
    def test_authentication_required(self):
        """Test unauthenticated requests are rejected"""
        response = self.client.get(self.bookmarks_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_user_isolation(self):
        """Test only the user's bookmarks are returned (not others')"""
        # Create bookmark for user
        models.Bookmark.objects.create(
            post=self.post1,
            creator_profile=self.user.profile,
            title="User bookmark"
        )
        
        # Create bookmark for other user
        models.Bookmark.objects.create(
            post=self.post2,
            creator_profile=self.other_user.profile,
            title="Other user bookmark"
        )
        
        self.client.login(username="testuser", password="testpass123")
        response = self.client.get(self.bookmarks_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "User bookmark")


class BookmarkInstanceViewTests(TestCase):
    
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
        
        # Create a test bookmark
        self.bookmark = models.Bookmark.objects.create(
            post=self.post,
            creator_profile=self.user.profile,
            title="Test Bookmark"
        )
        
        self.bookmark_instance_url = f"/api/bookmarks/{self.bookmark.id}/"
        self.nonexistent_bookmark_url = "/api/bookmarks/999/"
    
    def test_update_success(self):
        """Test successful title update returns 200 with updated data"""
        self.client.login(username="testuser", password="testpass123")
        
        update_data = {"title": "Updated Bookmark Title"}
        response = self.client.patch(self.bookmark_instance_url, update_data, content_type="application/json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Bookmark Title")
        
        # Verify bookmark was updated in database
        self.bookmark.refresh_from_db()
        self.assertEqual(self.bookmark.title, "Updated Bookmark Title")

    def test_delete_success(self):
        """Test successful bookmark deletion returns 204"""
        self.client.login(username="testuser", password="testpass123")
        
        response = self.client.delete(self.bookmark_instance_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify bookmark was deleted from database
        self.assertFalse(models.Bookmark.objects.filter(id=self.bookmark.id).exists())

    def test_not_found_handling_update(self):
        """Test updating non-existent bookmark returns 404"""
        self.client.login(username="testuser", password="testpass123")
        
        update_data = {"title": "Updated Title"}
        response = self.client.patch(self.nonexistent_bookmark_url, update_data, content_type="application/json")
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Bookmark not found", response.data["error"])

    def test_not_found_handling_delete(self):
        """Test deleting non-existent bookmark returns 404"""
        self.client.login(username="testuser", password="testpass123")
        
        response = self.client.delete(self.nonexistent_bookmark_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Bookmark not found", response.data["error"])

    def test_authorization_update_own_bookmark(self):
        """Test user can update their own bookmark"""
        self.client.login(username="testuser", password="testpass123")
        
        update_data = {"title": "My Updated Bookmark"}
        response = self.client.patch(self.bookmark_instance_url, update_data, content_type="application/json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "My Updated Bookmark")

    def test_authorization_update_other_user_bookmark(self):
        """Test user cannot update another user's bookmark"""
        # Create bookmark for other user
        other_bookmark = models.Bookmark.objects.create(
            post=self.post,
            creator_profile=self.other_user.profile,
            title="Other User's Bookmark"
        )
        
        self.client.login(username="testuser", password="testpass123")
        
        update_data = {"title": "Trying to update"}
        response = self.client.patch(f"/api/bookmarks/{other_bookmark.id}/", update_data, content_type="application/json")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("You can only edit your own bookmarks", response.data["error"])

    def test_authorization_delete_own_bookmark(self):
        """Test user can delete their own bookmark"""
        self.client.login(username="testuser", password="testpass123")
        
        response = self.client.delete(self.bookmark_instance_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_authorization_delete_other_user_bookmark(self):
        """Test user cannot delete another user's bookmark"""
        # Create bookmark for other user
        other_bookmark = models.Bookmark.objects.create(
            post=self.post,
            creator_profile=self.other_user.profile,
            title="Other User's Bookmark"
        )
        
        self.client.login(username="testuser", password="testpass123")
        
        response = self.client.delete(f"/api/bookmarks/{other_bookmark.id}/")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("You can only delete your own bookmarks", response.data["error"])

    def test_authentication_required_update(self):
        """Test unauthenticated update requests are rejected"""
        update_data = {"title": "Unauthorized update"}
        response = self.client.patch(self.bookmark_instance_url, update_data, content_type="application/json")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authentication_required_delete(self):
        """Test unauthenticated delete requests are rejected"""
        response = self.client.delete(self.bookmark_instance_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class BookmarkStatusViewTests(TestCase):
    """Test the GET method for checking bookmark status on BookmarkPostView"""
    
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
        
        self.bookmark_status_url = f"/api/post/{self.post.id}/bookmark/"
        self.nonexistent_post_url = "/api/post/999/bookmark/"
    
    def test_bookmark_status_true(self):
        """Test checking bookmark status returns true when bookmarked"""
        self.client.login(username="testuser", password="testpass123")
        
        # Create a bookmark
        models.Bookmark.objects.create(
            post=self.post,
            creator_profile=self.user.profile,
            title="Test Bookmark"
        )
        
        response = self.client.get(self.bookmark_status_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["bookmarked"])
    
    def test_bookmark_status_false(self):
        """Test checking bookmark status returns false when not bookmarked"""
        self.client.login(username="testuser", password="testpass123")
        
        response = self.client.get(self.bookmark_status_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["bookmarked"])
    
    def test_bookmark_status_post_not_found(self):
        """Test checking bookmark status for non-existent post returns 404"""
        self.client.login(username="testuser", password="testpass123")
        
        response = self.client.get(self.nonexistent_post_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Post not found", response.data["error"])
    
    def test_bookmark_status_authentication_required(self):
        """Test unauthenticated requests for bookmark status are rejected"""
        response = self.client.get(self.bookmark_status_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class BookmarkDeleteByPostViewTests(TestCase):
    """Test the DELETE method for removing bookmarks by post ID on BookmarkPostView"""
    
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
        
        self.bookmark_delete_url = f"/api/post/{self.post.id}/bookmark/"
        self.nonexistent_post_url = "/api/post/999/bookmark/"
    
    def test_delete_existing_bookmark(self):
        """Test deleting existing bookmark by post ID returns 204"""
        self.client.login(username="testuser", password="testpass123")
        
        # Create a bookmark
        bookmark = models.Bookmark.objects.create(
            post=self.post,
            creator_profile=self.user.profile,
            title="Test Bookmark"
        )
        
        response = self.client.delete(self.bookmark_delete_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify bookmark was deleted
        self.assertFalse(models.Bookmark.objects.filter(id=bookmark.id).exists())
    
    def test_delete_nonexistent_bookmark(self):
        """Test deleting non-existent bookmark returns 404"""
        self.client.login(username="testuser", password="testpass123")
        
        response = self.client.delete(self.bookmark_delete_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Bookmark not found", response.data["error"])
    
    def test_delete_bookmark_post_not_found(self):
        """Test deleting bookmark for non-existent post returns 404"""
        self.client.login(username="testuser", password="testpass123")
        
        response = self.client.delete(self.nonexistent_post_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Post not found", response.data["error"])
    
    def test_delete_bookmark_authentication_required(self):
        """Test unauthenticated delete requests are rejected"""
        response = self.client.delete(self.bookmark_delete_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
