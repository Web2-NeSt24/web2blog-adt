from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from blog_api import models

class DraftsViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="draftuser", password="testpass123")
        self.client.force_authenticate(user=self.user)
        self.drafts_url = "/api/drafts/"  

    def test_create_draft(self):
        response = self.client.post(self.drafts_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(models.Post.objects.filter(profile=self.user.profile, draft=True).exists())

    def test_get_drafts(self):

        models.Post.objects.create(profile=self.user.profile, title="Draft", content="", draft=True)
        response = self.client.get(self.drafts_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("draft_post_ids", response.data)

    def test_authentication_required(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.drafts_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
