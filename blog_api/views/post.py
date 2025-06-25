from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, views

from blog_api import models, serializers


class PostView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(responses={ 200: serializers.PostSerializer, 404: None })
    def get(self, request: views.Request, post_id: int):
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({
                "error": "Post does not exist"
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = serializers.PostSerializer(post, context={'request': request})
        return views.Response(serializer.data)
    
    @extend_schema(request=serializers.PostUpdateSerializer, responses={ 200: None, 404: None, 403: None })
    def put(self, request: views.Request, post_id: int):
        # Handle FormData parsing
        if hasattr(request.data, 'getlist'):
            # This is FormData - handle tags as list
            data = {}
            for key, value in request.data.items():
                if key == 'tags':
                    # Get all tag values as a list
                    data[key] = request.data.getlist(key)
                else:
                    data[key] = value
        else:
            # This is JSON data
            data = request.data
            
        serializer = serializers.PostUpdateSerializer(data=data)
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
        post.draft = serializer.validated_data.get("draft", True)
        
        # Handle image upload
        if "image" in serializer.validated_data and serializer.validated_data["image"]:
            uploaded_file = serializer.validated_data["image"]
            
            # Determine image type from file extension
            file_extension = uploaded_file.name.split('.')[-1].lower()
            if file_extension in ['jpg', 'jpeg']:
                image_type = models.Image.ImageType.JPEG
            elif file_extension == 'png':
                image_type = models.Image.ImageType.PNG
            elif file_extension == 'svg':
                image_type = models.Image.ImageType.SVG
            else:
                return views.Response({
                    "error": "Unsupported image format. Please use JPG, PNG, or SVG."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new Image object
            image = models.Image.objects.create(
                type=image_type,
                data=uploaded_file.read()
            )
            
            # Update post image reference
            post.image = image
        
        post.tags.set(tags)
        post.save()

        return views.Response({"message": "Post updated successfully"})
    
    @extend_schema(description="Publish a draft", responses={ 200: None, 404: None, 403: None })
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
