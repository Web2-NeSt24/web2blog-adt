from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework import status, views
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes

from blog_api import models, serializers

class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        summary="Get user profile",
        description="Retrieve profile information for a specific user including biography and profile picture.",
        parameters=[OpenApiParameter("user_id", int, OpenApiParameter.PATH, description="Unique identifier of the user")],
        responses={
            200: serializers.ProfileSerializer,
            404: OpenApiResponse(description="User not found")
        }, 
        tags=['Profiles']
    )
    def get(self, _request: views.Request, user_id: int):
        try:
            user = models.User.objects.get(pk=user_id)
            profile = models.Profile.objects.get(user=user)
            serializer = serializers.ProfileSerializer(profile)
            return views.Response(serializer.data)
        except models.User.DoesNotExist:
            return views.Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except models.Profile.DoesNotExist:
            return views.Response({
                "error": "Profile not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    @extend_schema(
        summary="Update user profile",
        description="Update profile information for the authenticated user. Users can only update their own profiles.",
        parameters=[OpenApiParameter("user_id", int, OpenApiParameter.PATH, description="Unique identifier of the user")],
        request=serializers.ProfileUpdateSerializer, 
        responses={
            200: OpenApiResponse(description="Profile updated successfully"),
            401: OpenApiResponse(description="Authentication required"),
            403: OpenApiResponse(description="Not authorized to update this profile")
        }, 
        tags=['Profiles']
    )
    def put(self, request: views.Request, user_id: int):
        if request.user.id != user_id:
            return views.Response({ 
                "error": "You can only update your own profile"
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = serializers.ProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            profile = models.Profile.objects.get(user=request.user)
        except models.Profile.DoesNotExist:
            return views.Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        validated = serializer.validated_data if isinstance(serializer.validated_data, dict) else {}
        if validated and "biography" in validated and isinstance(validated["biography"], str):
            profile.biography = validated["biography"]
        if validated and "profile_picture" in validated:
            profile.profile_picture = validated["profile_picture"]
        profile.save()
        return views.Response()


@extend_schema(
    methods=['GET'],
    summary="Get current user profile",
    description="Retrieve profile information for the currently authenticated user.",
    responses={
        200: serializers.ProfileSerializer,
        401: OpenApiResponse(description="Authentication required")
    },
    tags=['Profiles']
)
@extend_schema(
    methods=['PUT'],
    summary="Update current user profile",
    description="Update profile information for the currently authenticated user.",
    request=serializers.ProfileUpdateSerializer,
    responses={
        200: OpenApiResponse(description="Profile updated successfully"),
        401: OpenApiResponse(description="Authentication required")
    },
    tags=['Profiles']
)
@api_view(ProfileView().allowed_methods)
@permission_classes([permissions.IsAuthenticated])
def me_profile_view(request: views.Request):
    return ProfileView.as_view()(request._request, user_id=request.user.id)

@extend_schema(
    summary="Get profile by username",
    description="Retrieve profile information for a user by their username. Username lookup is case-insensitive.",
    parameters=[OpenApiParameter("username", str, OpenApiParameter.PATH, description="Username of the user")],
    responses={
        200: serializers.ProfileSerializer, 
        404: OpenApiResponse(description="User not found")
    },
    tags=['Profiles']
)
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_profile_by_username(request: views.Request, username: str):
    try:
        user = models.User.objects.get(username__iexact=username)
        profile = models.Profile.objects.get(user=user)
        serializer = serializers.ProfileSerializer(profile)
        return views.Response(serializer.data)
    except models.User.DoesNotExist:
        return views.Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except models.Profile.DoesNotExist:
        return views.Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
    
@extend_schema(
    methods=['PUT'],
    summary="Update profile by username",
    description="Update profile information for a user by their username. Only the profile owner can update their profile.",
    parameters=[OpenApiParameter("username", str, OpenApiParameter.PATH, description="Username of the user")],
    request=serializers.ProfileUpdateSerializer,
    responses={
        200: OpenApiResponse(description="Profile updated successfully"),
        403: OpenApiResponse(description="Not authorized to update this profile"),
        404: OpenApiResponse(description="User not found")
    },
    tags=['Profiles']
)
@api_view(ProfileView().allowed_methods)
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def username_profile_view(request: views.Request, username: str):
    try:
        user = models.User.objects.get(username__iexact=username)
    except models.User.DoesNotExist:
        return views.Response({
            "error": "Username does not exist"
        }, status=status.HTTP_404_NOT_FOUND)
    user_id = getattr(user, 'id', None)
    if user_id is None:
        return views.Response({"error": "User ID not found"}, status=status.HTTP_404_NOT_FOUND)
    return ProfileView.as_view()(request._request, user_id=user_id)

# @extend_schema(
#         methods=['GET'],
#         summary="Get profile by username",
#         description="Retrieve profile information for a user by their username. Username lookup is case-insensitive.",
#         parameters=[OpenApiParameter("username", str, OpenApiParameter.PATH, description="Username of the user")],
#         responses={
#             200: serializers.ProfileSerializer,
#             404: OpenApiResponse(description="User not found")
#         },
#         tags=['Profiles']
#     )
