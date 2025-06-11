from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework import permissions, status, views
from rest_framework.response import Response

from blog_api import models, serializers


class PostListView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        summary="List all published posts",
        description="Retrieve a list of all published blog posts. Draft posts are excluded from this list. Posts include engagement metrics like likes, comments, and bookmarks.",
        responses={
            200: serializers.PostSerializer(many=True)
        }, 
        tags=['Posts']
    )
    def get(self, request):
        posts = models.Post.objects.filter(draft=False)
        serializer = serializers.PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)


class PostView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        summary="Retrieve a post",
        description="Get the details of a specific post by its ID. This includes the post's content, title, and engagement metrics.",
        parameters=[OpenApiParameter("post_id", int, OpenApiParameter.PATH, description="Unique identifier of the post")],
        responses={
            200: serializers.PostSerializer,
            404: OpenApiResponse(description="Post not found")
        },
        tags=['Posts']
    )
    def get(self, request: views.Request, post_id: int):
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({
                "error": "Post does not exist"
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = serializers.PostSerializer(post, context={'request': request})
        return views.Response(serializer.data)    
    @extend_schema(
        summary="Update a post",
        description="Update the content of an existing post. Only the post author can perform this operation. All fields are optional for partial updates.",
        parameters=[OpenApiParameter("post_id", int, OpenApiParameter.PATH, description="Unique identifier of the post")],
        request=serializers.PostUpdateSerializer, 
        responses={
            200: OpenApiResponse(description="Post updated successfully"),
            403: OpenApiResponse(description="Not authorized to edit this post"),
            404: OpenApiResponse(description="Post not found")
        }, 
        tags=['Posts']
    )
    def put(self, request: views.Request, post_id: int):
        serializer = serializers.PostUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({
                "error": "Post does not exist"
            }, status=status.HTTP_404_NOT_FOUND)

        if request.user.id != post.profile.user.id:
            return views.Response({
                "error": "You can only edit your own posts"
            }, status=status.HTTP_403_FORBIDDEN)

        tags = [
            models.Hashtag.objects.get_or_create(value=tag)[0]
            for tag in serializer.validated_data["tags"]
        ]

        post.title = serializer.validated_data["title"]
        post.content = serializer.validated_data["content"]
        post.image = serializer.validated_data["image"]
        post.tags.set(tags)
        post.save()

        return views.Response()
    
    @extend_schema(
        summary="Publish a draft",
        description="Publish a draft post, making it visible to all users. Only the post author can publish their drafts. Once published, the post appears in public listings.",
        parameters=[OpenApiParameter("post_id", int, OpenApiParameter.PATH, description="Unique identifier of the draft post")],
        responses={
            200: OpenApiResponse(description="Draft published successfully"),
            403: OpenApiResponse(description="Not authorized to publish this draft"),
            404: OpenApiResponse(description="Draft not found")
        }, 
        tags=['Posts']
    )
    def post(self, request: views.Request, post_id: int):
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({
                "error": "Draft does not exist"
            }, status=status.HTTP_404_NOT_FOUND)

        if request.user.id != post.profile.user.id:
            return views.Response({
                "error": "You can only publish your own drafts"
            }, status=status.HTTP_403_FORBIDDEN)

        post.draft = False
        post.save()

        return views.Response()

    @extend_schema(
        summary="Delete a post",
        description="Permanently delete a post. Only the post author can delete their own posts. This action cannot be undone.",
        parameters=[OpenApiParameter("post_id", int, OpenApiParameter.PATH, description="Unique identifier of the post")],
        responses={
            200: OpenApiResponse(description="Post deleted successfully"),
            403: OpenApiResponse(description="Not authorized to delete this post"),
            404: OpenApiResponse(description="Post not found")
        }, 
        tags=['Posts']
    )
    def delete(self, request: views.Request, post_id: int):
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({
                "error": "Post does not exist"
            }, status=status.HTTP_404_NOT_FOUND)

        if request.user.id != post.profile.user.id:
            return views.Response({
                "error": "You can only delete your own posts"
            }, status=status.HTTP_403_FORBIDDEN)

        post.delete()

        return views.Response()
