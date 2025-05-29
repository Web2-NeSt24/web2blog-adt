from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes

from blog_api import models, serializers

class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(responses={ 200: serializers.ProfileSerializer, 404: None })
    def get(self, _request: views.Request, user_id: int):
        try:
            profile = models.User.objects.get(pk=user_id).profile
            serializer = serializers.ProfileSerializer(profile)
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
        profile.biography = serializer.validated_data["biography"]
        profile.profile_picture = serializer.validated_data["profile_picture"]
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
        200: None,  # PUT returns no data
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
