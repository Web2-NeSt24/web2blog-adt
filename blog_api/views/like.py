from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from rest_framework import status, views, permissions
from blog_api import models
from blog_api.serializers import LikeStatusSerializer

class LikeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Like or unlike a post",
        description="Toggles like status for the authenticated user on the given post. Returns 201 if liked, 200 if unliked.",
        parameters=[OpenApiParameter("post_id", int, OpenApiParameter.PATH)],
        responses={
            201: OpenApiResponse(description="Post liked"),
            200: OpenApiResponse(description="Post unliked"),
            404: OpenApiResponse(description="Post not found")
        }
    )
    def post(self, request: views.Request, post_id: int) -> views.Response:
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        like = models.Like.objects.filter(post=post, liker_profile=request.user.profile).first()
        if like:
            like.delete()
            return views.Response(status=status.HTTP_200_OK)
        models.Like.objects.create(post=post, liker_profile=request.user.profile)
        return views.Response(status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Check if user liked a post",
        description="Returns whether the authenticated user has liked the given post.",
        parameters=[OpenApiParameter("post_id", int, OpenApiParameter.PATH)],
        responses={
            200: OpenApiResponse(response=LikeStatusSerializer),
            404: OpenApiResponse(description="Post not found")
        }
    )
    def get(self, request: views.Request, post_id: int) -> views.Response:
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        exists = models.Like.objects.filter(post=post, liker_profile=request.user.profile).exists()
        serializer = LikeStatusSerializer({"liked": exists})
        return views.Response(serializer.data, status=status.HTTP_200_OK)
