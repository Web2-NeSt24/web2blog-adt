from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from rest_framework import status, views, permissions
from blog_api import models
from blog_api.serializers import LikeStatusSerializer

class LikeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Like a post",
        description="Like a post. This operation is idempotent - calling it multiple times has the same effect as calling it once.",
        parameters=[OpenApiParameter("post_id", int, OpenApiParameter.PATH)],
        responses={
            201: OpenApiResponse(description="Post liked"),
            200: OpenApiResponse(description="Post already liked"),
            404: OpenApiResponse(description="Post not found")
        },
        tags=['Likes']
    )
    def put(self, request: views.Request, post_id: int) -> views.Response:
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        
        like, created = models.Like.objects.get_or_create(
            post=post, 
            liker_profile=request.user.profile
        )
        
        if created:
            return views.Response(status=status.HTTP_201_CREATED)
        else:
            return views.Response(status=status.HTTP_200_OK)

    @extend_schema(
        summary="Unlike a post",
        description="Remove like from a post. This operation is idempotent - calling it multiple times has the same effect as calling it once.",
        parameters=[OpenApiParameter("post_id", int, OpenApiParameter.PATH)],
        responses={
            204: OpenApiResponse(description="Post unliked"),
            404: OpenApiResponse(description="Post not found")
        },
        tags=['Likes']
    )
    def delete(self, request: views.Request, post_id: int) -> views.Response:
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        
        models.Like.objects.filter(post=post, liker_profile=request.user.profile).delete()
        return views.Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Check if user liked a post",
        description="Returns whether the authenticated user has liked the given post.",
        parameters=[OpenApiParameter("post_id", int, OpenApiParameter.PATH)],
        responses={
            200: OpenApiResponse(response=LikeStatusSerializer),
            404: OpenApiResponse(description="Post not found")
        },
        tags=['Likes']
    )
    def get(self, request: views.Request, post_id: int) -> views.Response:
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        exists = models.Like.objects.filter(post=post, liker_profile=request.user.profile).exists()
        serializer = LikeStatusSerializer({"liked": exists})
        return views.Response(serializer.data, status=status.HTTP_200_OK)
