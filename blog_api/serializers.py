from django.contrib.auth.models import User
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
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

class DraftSerializer(serializers.ModelSerializer):
    draft_post_id = serializers.IntegerField(source="id")

    class Meta:
        model = models.Post
        fields = ["draft_post_id"]

class ProfileDraftsSerializer(serializers.ModelSerializer):
    draft_post_ids = serializers.SerializerMethodField()

    class Meta:
        model = models.Profile
        fields = ["draft_post_ids"]
    
    @extend_schema_field(list[int])
    def get_draft_post_ids(self, profile):
        return profile.post_set.filter(draft=True).values_list("id", flat=True).all()
