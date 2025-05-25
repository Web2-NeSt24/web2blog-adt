from io import BytesIO

from django.http import FileResponse
from drf_spectacular.utils import extend_schema
from rest_framework import views
from rest_framework.decorators import api_view

from blog_api import models


@extend_schema(responses={ 200: None, 404: None })
@api_view(["GET"])
def image(_request: views.Request, id: int):
    try:
        image: models.Image = models.Image.objects.get(pk=id)
    except models.Image.DoesNotExist:
        return views.Response(status=views.status.HTTP_404_NOT_FOUND)

    return FileResponse(BytesIO(image.data), content_type=f"image/{image.type}")
