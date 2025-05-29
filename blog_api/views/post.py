from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, views

from blog_api import models, serializers


class PostView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(responses={ 200: serializers.PostSerializer, 404: None })
    def get(self, _request: views.Request, post_id: int):
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({
                "error": "Post does not exist"
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = serializers.PostSerializer(post)
        return views.Response(serializer.data)
    
    @extend_schema(request=serializers.PostUpdateSerializer, responses={ 200: None, 404: None, 403: None })
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

    @extend_schema(responses={ 200: None, 404: None, 403: None })
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
