import enum
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from blog_api import models


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(
        help_text="Alphanumeric username (case-insensitive). Must be unique.",
        max_length=150,
        min_length=3
    )
    email = serializers.EmailField(
        help_text="Valid email address for the user account."
    )
    password = serializers.CharField(
        help_text="Password for the user account. Should be secure.",
        min_length=6,
        style={'input_type': 'password'}
    )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        help_text="Username (case-insensitive)"
    )
    password = serializers.CharField(
        help_text="User password",
        style={'input_type': 'password'}
    )


class ChangePasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(
        help_text="New password for the account",
        min_length=6,
        style={'input_type': 'password'}
    )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    post_ids = serializers.SerializerMethodField()

    class Meta:
        model = models.Profile
        fields = ["user", "biography", "profile_picture", "post_ids"]

    @extend_schema_field(serializers.ListField(child=serializers.IntegerField()))
    def get_post_ids(self, obj: models.Profile) -> list[int]:
        return list(obj.post_set.values_list('id', flat=True))  # type: ignore


class ProfileUpdateSerializer(serializers.ModelSerializer):
    biography = serializers.CharField(required=False, allow_blank=True)
    profile_picture = serializers.IntegerField(required=False, allow_null=True)

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
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    bookmark_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = models.Post
        fields = ["id", "profile", "title", "content", "image", "tags", "like_count", "comment_count", "bookmark_count", "is_liked", "is_bookmarked"]

    def get_like_count(self, obj):
        return obj.like_set.count()

    def get_comment_count(self, obj):
        return obj.comment_set.count()

    def get_bookmark_count(self, obj):
        return obj.bookmark_set.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.like_set.filter(liker_profile=request.user.profile).exists()
        return False

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmark_set.filter(creator_profile=request.user.profile).exists()
        return False


class PostUpdateSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of hashtags for the post (without # symbol). Example: ['django', 'api']",
        required=False,
        allow_empty=True
    )
    title = serializers.CharField(
        help_text="Post title. Example: 'My First Blog Post'",
        required=False,
        allow_blank=True
    )
    content = serializers.CharField(
        help_text="Post content in markdown or plain text. Example: 'This is the content of my blog post.'",
        required=False,
        allow_blank=True
    )
    image = serializers.IntegerField(
        help_text="ID of uploaded image to attach to the post. Example: 42",
        required=False,
        allow_null=True
    )

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


class BookmarkUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Bookmark
        fields = ["title"]


class BookmarkStatusSerializer(serializers.Serializer):
    bookmarked = serializers.BooleanField()


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

class PostSortingMethod(enum.Enum):
    DATE = "DATE"
    LIKES = "LIKES"

class PostFilterSerializer(serializers.Serializer):
    author_id = serializers.IntegerField(
        required=False, 
        allow_null=True,
        help_text="Filter posts by author's user ID. Example: 1"
    )
    author_name = serializers.CharField(
        required=False, 
        allow_null=True,
        help_text="Filter posts by author's username (case-insensitive). Example: 'john_doe'"
    )
    keywords = serializers.ListField(
        child=serializers.CharField(), 
        default=[],
        help_text="Search keywords in post title and content (OR logic). Example: ['django', 'tutorial']"
    )
    tags = serializers.ListField(
        child=serializers.CharField(), 
        default=[],
        help_text="Filter by hashtags (AND logic - all tags must be present). Example: ['api', 'backend']"
    )
    sort_by = serializers.ChoiceField(
        choices=[entry.value for entry in PostSortingMethod], 
        default=PostSortingMethod.DATE.value,
        help_text="Sort results by date (newest first) or likes (most popular first). Example: 'DATE'"
    )

class PostListSerializer(serializers.Serializer):
    post_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of post IDs. Example: [1, 2, 3]"
    )
