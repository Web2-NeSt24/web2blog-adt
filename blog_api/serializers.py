from django.contrib.auth.models import User
from rest_framework import serializers

from blog_api import models


class CredentialsSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    post_ids = serializers.PrimaryKeyRelatedField(many=True, read_only=True, source="post_set")

    class Meta:
        model = models.Profile
        fields = ["user", "biography", "profile_picture", "post_ids"]

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Profile
        fields = ["biography", "profile_picture"]

class PostSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    tags = serializers.SlugRelatedField(slug_field="value", read_only=True, many=True)

    class Meta:
        model = models.Post
        fields = ["id", "profile", "title", "content", "image", "tags"]

class PostUpdateSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField())

    class Meta:
        model = models.Post
        fields = ["title", "content", "image", "tags"]
