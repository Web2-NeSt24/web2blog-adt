from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework import status, views, permissions, serializers as drf_serializers

from blog_api import models, serializers

class CommentView(views.APIView):
    """Handles comment listing and creation for a specific post."""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        summary="List comments for a post",
        description="Retrieve all comments for a specific post. Comments are returned with author information and timestamps. Supports pagination with page and page_size parameters.",
        parameters=[
            OpenApiParameter("post_id", int, OpenApiParameter.PATH, description="Unique identifier of the post"),
            OpenApiParameter("page", int, OpenApiParameter.QUERY, description="Page number (default: 1)"),
            OpenApiParameter("page_size", int, OpenApiParameter.QUERY, description="Number of items per page (default: 20, max: 100)")
        ],
        responses={
            200: serializers.CommentSerializer(many=True),
            404: OpenApiResponse(description="Post not found")
        }, 
        tags=['Comments']
    )
    def get(self, request: views.Request, post_id: int):
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        
        comments = models.Comment.objects.filter(post=post).order_by('-id')
        
        # Apply pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = min(int(request.query_params.get('page_size', 20)), 100)
        paginated_comments = paginator.paginate_queryset(comments, request)
        
        serializer = serializers.CommentSerializer(paginated_comments, many=True)
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        summary="Create a comment",
        description="Add a new comment to a specific post. Requires authentication. The comment will be associated with the authenticated user.",
        parameters=[OpenApiParameter("post_id", int, OpenApiParameter.PATH, description="Unique identifier of the post")],
        request=serializers.CommentCreateSerializer, 
        responses={
            201: serializers.CommentSerializer,
            404: OpenApiResponse(description="Post not found"),
            401: OpenApiResponse(description="Authentication required")
        }, 
        tags=['Comments']
    )
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

    @extend_schema(
        summary="Update a comment",
        description="Update the content of an existing comment. Only the comment author can perform this operation.",
        parameters=[OpenApiParameter("comment_id", int, OpenApiParameter.PATH, description="Unique identifier of the comment")],
        request=serializers.CommentCreateSerializer, 
        responses={
            200: serializers.CommentSerializer,
            400: OpenApiResponse(description="Invalid input data"),
            403: OpenApiResponse(description="Not authorized to edit this comment"),
            404: OpenApiResponse(description="Comment not found")
        }, 
        tags=['Comments']
    )
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

    @extend_schema(
        summary="Delete a comment",
        description="Permanently delete a comment. Only the comment author can perform this operation. This action cannot be undone.",
        parameters=[OpenApiParameter("comment_id", int, OpenApiParameter.PATH, description="Unique identifier of the comment")],
        responses={
            204: OpenApiResponse(description="Comment deleted successfully"),
            403: OpenApiResponse(description="Not authorized to delete this comment"),
            404: OpenApiResponse(description="Comment not found")
        }, 
        tags=['Comments']
    )
    def delete(self, request: views.Request, comment_id: int):
        try:
            comment = models.Comment.objects.get(pk=comment_id)
        except models.Comment.DoesNotExist:
            return views.Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)
        if comment.author_profile != request.user.profile:
            return views.Response({"error": "You can only delete your own comments"}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return views.Response(status=status.HTTP_204_NO_CONTENT)