from drf_spectacular.utils import extend_schema
from rest_framework import status, views, permissions

from blog_api import models, serializers

class CommentView(views.APIView):
    """Handles comment listing and creation for a specific post."""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(responses={200: serializers.CommentSerializer(many=True), 404: None})
    def get(self, _request: views.Request, post_id: int):
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        comments = models.Comment.objects.filter(post=post)
        serializer = serializers.CommentSerializer(comments, many=True)
        return views.Response(serializer.data)

    @extend_schema(request=serializers.CommentCreateSerializer, responses={201: serializers.CommentSerializer, 404: None})
    def post(self, request: views.Request, post_id: int):
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = serializers.CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = models.Comment.objects.create(
            post=post,
            author_profile=request.user.profile,
            content=serializer.validated_data["content"]
        )
        return views.Response(serializers.CommentSerializer(comment).data, status=status.HTTP_201_CREATED)

class CommentInstanceView(views.APIView):
    """Handles updating and deleting individual comments."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=serializers.CommentCreateSerializer, responses={200: serializers.CommentSerializer, 403: None, 404: None})
    def patch(self, request: views.Request, comment_id: int):
        try:
            comment = models.Comment.objects.get(pk=comment_id)
        except models.Comment.DoesNotExist:
            return views.Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)
        if comment.author_profile != request.user.profile:
            return views.Response({"error": "You can only edit your own comments"}, status=status.HTTP_403_FORBIDDEN)
        serializer = serializers.CommentCreateSerializer(comment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        comment.content = serializer.validated_data["content"]
        comment.save()
        return views.Response(serializers.CommentSerializer(comment).data)

    @extend_schema(responses={204: None, 403: None, 404: None})
    def delete(self, request: views.Request, comment_id: int):
        try:
            comment = models.Comment.objects.get(pk=comment_id)
        except models.Comment.DoesNotExist:
            return views.Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)
        if comment.author_profile != request.user.profile:
            return views.Response({"error": "You can only delete your own comments"}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return views.Response(status=status.HTTP_204_NO_CONTENT)