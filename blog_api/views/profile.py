from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes

from blog_api import models, serializers

class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(responses={ 200: serializers.ProfileSerializer, 404: None })
    def get(self, request: views.Request, user_id: int):
        try:
            profile = models.User.objects.get(pk=user_id).profile
            serializer = serializers.ProfileSerializer(profile, context={'request': request})
            return views.Response(serializer.data)
        except models.User.DoesNotExist:
            return views.Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    @extend_schema(request=serializers.ProfileUpdateSerializer, responses={ 200: None, 403: None })
    def put(self, request: views.Request, user_id: int):
        if request.user.id != user_id:
            return views.Response({ 
                "error": "You can only update your own profile"
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = serializers.ProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = request.user.profile
        
        # Update biography if provided
        if "biography" in serializer.validated_data:
            profile.biography = serializer.validated_data["biography"]
        
        # Handle profile picture upload
        if "profile_picture" in serializer.validated_data and serializer.validated_data["profile_picture"]:
            uploaded_file = serializer.validated_data["profile_picture"]
            
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
            
            # Update profile picture reference
            profile.profile_picture = image
        
        profile.save()
        return views.Response()


@extend_schema(
    methods=['GET'],
    responses={ 
        200: serializers.ProfileSerializer,
        401: None, 
        404: None 
    }
)
@extend_schema(
    methods=['PUT'],
    request=serializers.ProfileUpdateSerializer,
    responses={ 
        200: None, 
        401: None, 
        403: None 
    }
)
@api_view(ProfileView().allowed_methods)
@permission_classes([permissions.IsAuthenticated])
def me_profile_view(request: views.Request):
    return ProfileView.as_view()(request._request, user_id=request.user.id)

@extend_schema(
    methods=['GET'],
    responses={ 
        200: serializers.ProfileSerializer, 
        404: None 
    }
)
@extend_schema(
    methods=['PUT'],
    request=serializers.ProfileUpdateSerializer,
    responses={ 
        200: None,
        403: None,
        404: None 
    }
)
@api_view(ProfileView().allowed_methods)
def username_profile_view(request: views.Request, username: str):
    try:
        user = models.User.objects.get(username__iexact=username)
    except models.User.DoesNotExist:
        return views.Response({
            "error": "Username does not exist"
        }, status=status.HTTP_404_NOT_FOUND)

    return ProfileView.as_view()(request._request, user_id=user.id)
