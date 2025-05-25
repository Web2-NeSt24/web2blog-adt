from django.contrib import auth
from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.decorators import api_view

from blog_api import models
from blog_api.serializers import CredentialsSerializer


@extend_schema(request=CredentialsSerializer)
@api_view(["POST"])
def register(request: views.Request):
    serializer = CredentialsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    credentials = serializer.validated_data
    username: str = credentials["username"].lower()
    password: str = credentials["password"]

    if not username.isalnum():
        return views.Response({
            "error": "Username must be alphanumeric"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if models.User.objects.filter(username=username).exists():
        return views.Response({
            "error": "User already exists"
        }, status=status.HTTP_409_CONFLICT)

    user = models.User.objects.create_user(username=username, password=password)

    auth.login(request._request, user)

    return views.Response(f"Created user {user.id}")
            

@extend_schema(request=CredentialsSerializer)
@api_view(["POST"])
def login(request: views.Request):
    serializer = CredentialsSerializer(data=request.data)
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


