from django.contrib import auth
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import status, views, permissions
from rest_framework.decorators import api_view, permission_classes

from blog_api import models, serializers


@extend_schema(
    summary="Register a new user",
    description="Create a new user account with username, email, and password. Username must be alphanumeric and unique. Upon successful registration, the user is automatically logged in.",
    request=serializers.RegisterSerializer, 
    responses={
        201: OpenApiResponse(description="User created successfully and logged in"),
        400: OpenApiResponse(description="Invalid input data or username not alphanumeric"),
        409: OpenApiResponse(description="Username already exists")
    }, 
    tags=['Authentication']
)
@api_view(["POST"])
def register(request: views.Request):
    serializer = serializers.RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    credentials = serializer.validated_data
    username: str = credentials["username"].lower()
    email: str = credentials["email"]
    password: str = credentials["password"]

    if not username.isalnum():
        return views.Response({
            "error": "Username must be alphanumeric"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if models.User.objects.filter(username=username).exists():
        return views.Response({
            "error": "User already exists"
        }, status=status.HTTP_409_CONFLICT)

    user = models.User.objects.create_user(username=username, email=email, password=password)

    auth.login(request._request, user)

    return views.Response(status=status.HTTP_201_CREATED)
            

@extend_schema(
    summary="Login user",
    description="Authenticate user with username and password. Creates a session for the authenticated user. Username is case-insensitive.",
    request=serializers.LoginSerializer, 
    responses={
        200: OpenApiResponse(description="Login successful, session created"),
        403: OpenApiResponse(description="Invalid credentials")
    }, 
    tags=['Authentication']
)
@api_view(["POST"])
def login(request: views.Request):
    serializer = serializers.LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    credentials = serializer.validated_data
    username: str = credentials["username"].lower()
    password: str = credentials["password"]

    user = auth.authenticate(username=username, password=password)
    if user is not None:
        auth.login(request._request, user)
        return views.Response()
    else:
        return views.Response({
            "error": "Invalid credentials",
        }, status=status.HTTP_403_FORBIDDEN)


@extend_schema(
    summary="Change user password",
    description="Change the password for the authenticated user. User remains logged in after password change.",
    request=serializers.ChangePasswordSerializer, 
    responses={
        200: OpenApiResponse(description="Password changed successfully"),
        401: OpenApiResponse(description="Authentication required")
    }, 
    tags=['Authentication']
)
@api_view(["PUT"])
@permission_classes([permissions.IsAuthenticated])
def password(request: views.Request):
    serializer = serializers.ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    new_password: str = serializer.validated_data["new_password"]
    
    user = request.user

    user.set_password(new_password)
    user.save()

    auth.login(request._request, user)

    return views.Response()


@extend_schema(
    summary="Logout user",
    description="Log out the authenticated user and invalidate the session.",
    responses={
        200: OpenApiResponse(description="Logout successful"),
        401: OpenApiResponse(description="Authentication required")
    },
    tags=['Authentication']
)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout(request: views.Request):
    auth.logout(request._request)
    return views.Response(status=status.HTTP_200_OK)
