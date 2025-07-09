from io import BytesIO
import base64

from django.http import FileResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework import views, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from blog_api import models


class UploadRateThrottle(UserRateThrottle):
    scope = 'upload'


@extend_schema(
    summary="Retrieve an image",
    description="Get an image file by its ID. Returns the image in its original format (PNG, JPEG, or SVG).",
    parameters=[OpenApiParameter("id", int, OpenApiParameter.PATH, description="Unique identifier of the image")],
    responses={
        200: OpenApiResponse(description="Image file returned"),
        404: OpenApiResponse(description="Image not found")
    }, 
    tags=['Images']
)
@api_view(["GET"])
def image(_request: views.Request, id: int):
    try:
        image: models.Image = models.Image.objects.get(pk=id)
    except models.Image.DoesNotExist:
        return views.Response(status=views.status.HTTP_404_NOT_FOUND)

    return FileResponse(BytesIO(image.data), content_type=f"image/{image.type}")


@extend_schema(
    summary="Upload an image",
    description="Upload a new image file. Accepts base64-encoded image data for PNG, JPEG, or SVG formats. Returns the image ID for use in posts or profiles.",
    request={
        "application/json": {
            "schema": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": ["PNG", "JPEG", "SVG"],
                        "description": "Image format type"
                    },
                    "data": {
                        "type": "string",
                        "format": "byte",
                        "description": "Base64-encoded image data"
                    }
                },
                "required": ["type", "data"]
            }
        }
    },
    responses={
        201: OpenApiResponse(
            description="Image uploaded successfully"
        ),
        400: OpenApiResponse(description="Invalid input data or unsupported image type"),
        401: OpenApiResponse(description="Authentication required")
    }, 
    tags=['Images']
)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def upload_image(request: views.Request):
    """Upload a new image"""
    # Apply rate limiting
    throttle = UploadRateThrottle()
    if not throttle.allow_request(request, None):
        return Response({'error': 'Rate limit exceeded'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
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


@extend_schema(
    summary="Upload an image file (multipart)",
    description="Upload an image file using multipart/form-data. Supports PNG, JPEG, and SVG formats. This is the preferred method for image uploads.",
    request={
        'multipart/form-data': {
            'type': 'object',
            'properties': {
                'image': {
                    'type': 'string',
                    'format': 'binary',
                    'description': 'Image file to upload'
                }
            },
            'required': ['image']
        }
    },
    responses={
        201: OpenApiResponse(
            description="Image uploaded successfully"
        ),
        400: OpenApiResponse(description="Invalid input data or unsupported image type"),
        401: OpenApiResponse(description="Authentication required"),
        429: OpenApiResponse(description="Rate limit exceeded")
    }, 
    tags=['Images']
)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def upload_image_multipart(request: views.Request):
    """Upload a new image using multipart/form-data"""
    # Apply rate limiting
    throttle = UploadRateThrottle()
    if not throttle.allow_request(request, None):
        return Response({'error': 'Rate limit exceeded'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    try:
        if 'image' not in request.FILES:
            return Response({'error': 'image field required'}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = request.FILES['image']
        
        # Determine image type from content type
        content_type = uploaded_file.content_type
        if content_type == 'image/png':
            img_type = 'PNG'
        elif content_type in ['image/jpeg', 'image/jpg']:
            img_type = 'JPEG'
        elif content_type == 'image/svg+xml':
            img_type = 'SVG'
        else:
            return Response({'error': 'Unsupported image type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Read file data
        img_data = uploaded_file.read()
        
        # Create image record
        image = models.Image.objects.create(
            type=img_type,
            data=img_data
        )
        
        return Response({'id': image.id}, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
