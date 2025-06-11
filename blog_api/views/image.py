from io import BytesIO
import base64

from django.http import FileResponse
from drf_spectacular.utils import extend_schema
from rest_framework import views, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response

from blog_api import models


@extend_schema(responses={ 200: None, 404: None }, tags=['Images'])
@api_view(["GET"])
def image(_request: views.Request, id: int):
    try:
        image: models.Image = models.Image.objects.get(pk=id)
    except models.Image.DoesNotExist:
        return views.Response(status=views.status.HTTP_404_NOT_FOUND)

    return FileResponse(BytesIO(image.data), content_type=f"image/{image.type}")


@extend_schema(responses={ 201: None, 400: None }, tags=['Images'])
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def upload_image(request: views.Request):
    """Upload a new image"""
    try:
        img_type = request.data.get('type')
        img_data_b64 = request.data.get('data')
        
        if not img_type or not img_data_b64:
            return Response({'error': 'type and data fields required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if img_type not in ['PNG', 'JPEG', 'SVG']:
            return Response({'error': 'Invalid image type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Decode base64 data
        img_data = base64.b64decode(img_data_b64)
        
        # Create image record
        image = models.Image.objects.create(
            type=img_type,
            data=img_data
        )
        
        return Response({'id': image.id}, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
