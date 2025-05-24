from io import BytesIO
from django.http import FileResponse
from rest_framework import views

from blog_api import models

class ImageView(views.APIView):
    def get(self, _request: views.Request, id: int):
        try:
            image: models.Image = models.Image.objects.get(pk=id)
        except models.Image.DoesNotExist:
            return views.Response(status=views.status.HTTP_404_NOT_FOUND)

        return FileResponse(BytesIO(image.data), content_type=f"image/{image.type}")
