from drf_spectacular.utils import extend_schema
from rest_framework import status, views, permissions, serializers as drf_serializers

from blog_api import models, serializers

class CommentView(views.APIView):
    """Handles comment listing and creation for a specific post."""
    permission_classes = [permissions.AllowAny]  # Allow anonymous comments

    @extend_schema(responses={200: serializers.CommentSerializer(many=True), 404: None})
    def get(self, _request: views.Request, post_id: int):
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        comments = models.Comment.objects.filter(post=post).order_by('-created_at')
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
        
        # Create comment with either authenticated user or anonymous name
        comment_data = {
            'post': post,
            'content': serializer.validated_data['content']
        }
        
        if request.user.is_authenticated:
            comment_data['author_profile'] = request.user.profile
        else:
            comment_data['author_name'] = serializer.validated_data.get('author_name', 'Anonymous')
        
        comment = models.Comment.objects.create(**comment_data)
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
        
        # Check if any data is provided for update
        if not request.data:
            return views.Response({"content": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = serializers.CommentCreateSerializer(comment, data=request.data, partial=True)
        try:
            serializer.is_valid(raise_exception=True)
        except drf_serializers.ValidationError as e:
            return views.Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        if "content" in serializer.validated_data:
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