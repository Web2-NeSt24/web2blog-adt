import enum
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from blog_api import models


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = models.Profile
        fields = ["user", "biography", "profile_picture"]



class ProfileUpdateSerializer(serializers.ModelSerializer):
    biography = serializers.CharField(required=False, allow_blank=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    def validate(self, data):
        if not data.get("biography") and not data.get("profile_picture"):
            raise serializers.ValidationError("At least one field (biography or profile_picture) must be provided.")
        return data

    class Meta:
        model = models.Profile
        fields = ["biography", "profile_picture"]


class CommentSerializer(serializers.ModelSerializer):
    author_profile = ProfileSerializer(read_only=True)

    class Meta:
        model = models.Comment
        fields = ["id", "post", "author_profile", "content"]


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Comment
        fields = ["content"]


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


class BookmarkSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    creator_profile = ProfileSerializer(read_only=True)

    class Meta:
        model = models.Bookmark
        fields = ["id", "post", "creator_profile", "title"]


class BookmarkCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Bookmark
        fields = ["title"]


class LikeStatusSerializer(serializers.Serializer):
    liked = serializers.BooleanField()
