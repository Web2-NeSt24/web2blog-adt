from django.test import TestCase
from django.contrib.auth.models import User
from blog_api import models


class ModelStringRepresentationTests(TestCase):
    """Test string representations of models to improve coverage."""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        
    def test_image_str_representation(self):
        """Test Image __str__ method"""
        image = models.Image.objects.create(type="PNG", data=b"test image data")
        expected = f"Image(type=PNG, size={len(b'test image data')})"
        self.assertEqual(str(image), expected)
        
    def test_profile_str_representation(self):
        """Test Profile __str__ method"""
        profile = self.user.profile
        self.assertEqual(str(profile), str(self.user))
        
    def test_hashtag_str_representation(self):
        """Test Hashtag __str__ method"""
        hashtag = models.Hashtag.objects.create(value="django")
        self.assertEqual(str(hashtag), "#django")
        
    def test_post_str_representation(self):
        """Test Post __str__ method"""
        post = models.Post.objects.create(
            profile=self.user.profile,
            title="Test Post"
        )
        expected = f"Post(id={post.id}, profile={self.user.profile}, title=Test Post)"
        self.assertEqual(str(post), expected)
