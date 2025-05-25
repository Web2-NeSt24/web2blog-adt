from io import BytesIO
from django.contrib import auth
from django.http import FileResponse
from drf_spectacular.utils import extend_schema
from rest_framework import views
from rest_framework.decorators import api_view

from blog_api import models
from blog_api.serializers import CredentialsSerializer

@api_view(["GET"])
def image(_request: views.Request, id: int):
    try:
        image: models.Image = models.Image.objects.get(pk=id)
    except models.Image.DoesNotExist:
        return views.Response(status=views.status.HTTP_404_NOT_FOUND)

    return FileResponse(BytesIO(image.data), content_type=f"image/{image.type}")

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
        })
    
    if models.User.objects.filter(username=username).exists():
        return views.Response({
            "error": "User already exists"
        })

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
        })


