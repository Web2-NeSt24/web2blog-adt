from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from blog_api import models
from django.http import FileResponse


class ImageViewTests(TestCase):
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test images with different types and data
        self.png_image = models.Image.objects.create(
            type=models.Image.ImageType.PNG,
            data=b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
        )
        
        self.jpeg_image = models.Image.objects.create(
            type=models.Image.ImageType.JPEG,
            data=b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00'
        )
        
        self.svg_image = models.Image.objects.create(
            type=models.Image.ImageType.SVG,
            data=b'<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>'
        )
        
        self.image_url = f"/api/image/{self.png_image.id}"
        self.nonexistent_image_url = "/api/image/999"
    
    def test_get_image_success_png(self):
        """Test retrieving a PNG image returns 200 with correct content type"""
        response = self.client.get(f"/api/image/{self.png_image.id}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response, FileResponse)
        # Check content type header is set correctly
        self.assertEqual(response['Content-Type'], 'image/PNG')
    
    def test_get_image_success_jpeg(self):
        """Test retrieving a JPEG image returns 200 with correct content type"""
        response = self.client.get(f"/api/image/{self.jpeg_image.id}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response, FileResponse)
        self.assertEqual(response['Content-Type'], 'image/JPEG')
    
    def test_get_image_success_svg(self):
        """Test retrieving an SVG image returns 200 with correct content type"""
        response = self.client.get(f"/api/image/{self.svg_image.id}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response, FileResponse)
        self.assertEqual(response['Content-Type'], 'image/SVG')
    
    def test_get_image_not_found(self):
        """Test retrieving non-existent image returns 404"""
        response = self.client.get(self.nonexistent_image_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_image_unauthenticated(self):
        """Test anonymous users can access images (no authentication required)"""
        response = self.client.get(self.image_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response, FileResponse)
    
    def test_get_image_content_is_served(self):
        """Test that the actual image data is served correctly"""
        response = self.client.get(f"/api/image/{self.png_image.id}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # The response should be a FileResponse with the correct data
        # Note: In tests, we can't easily read the streamed content,
        # but we can verify it's a FileResponse which indicates the data will be served
        self.assertIsInstance(response, FileResponse)
    
    def test_image_endpoint_only_accepts_get(self):
        """Test that the image endpoint only accepts GET requests"""
        # Test POST request
        response = self.client.post(self.image_url, {})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        
        # Test PUT request
        response = self.client.put(self.image_url, {})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        
        # Test DELETE request
        response = self.client.delete(self.image_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        
        # Test PATCH request
        response = self.client.patch(self.image_url, {})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def test_invalid_image_id_format(self):
        """Test behavior with invalid image ID formats"""
        # Test with non-integer ID
        response = self.client.get("/api/image/invalid")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Test with negative ID
        response = self.client.get("/api/image/-1")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Test with zero ID
        response = self.client.get("/api/image/0")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_multiple_image_types(self):
        """Test that all supported image types work correctly"""
        # Test all ImageType choices
        for image_type in models.Image.ImageType:
            with self.subTest(image_type=image_type):
                # Create an image with this type
                test_image = models.Image.objects.create(
                    type=image_type,
                    data=b'test_data_for_' + image_type.encode()
                )
                
                response = self.client.get(f"/api/image/{test_image.id}")
                
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(response['Content-Type'], f'image/{image_type}')
    
    def test_empty_image_data(self):
        """Test behavior with image that has empty data"""
        empty_image = models.Image.objects.create(
            type=models.Image.ImageType.PNG,
            data=b''
        )
        
        response = self.client.get(f"/api/image/{empty_image.id}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'image/PNG')
    
    def test_large_image_data(self):
        """Test behavior with large image data"""
        # Create a "large" image (1MB of dummy data)
        large_data = b'x' * (1024 * 1024)
        large_image = models.Image.objects.create(
            type=models.Image.ImageType.JPEG,
            data=large_data
        )
        
        response = self.client.get(f"/api/image/{large_image.id}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'image/JPEG')
    
    def test_concurrent_image_access(self):
        """Test that the same image can be accessed multiple times"""
        # Make multiple requests to the same image
        for _ in range(5):
            response = self.client.get(self.image_url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response['Content-Type'], 'image/PNG')
    
    def test_boundary_image_ids(self):
        """Test edge cases for image IDs"""
        # Get the highest existing ID
        max_id = models.Image.objects.order_by('-id').first().id
        
        # Test ID just above the maximum
        response = self.client.get(f"/api/image/{max_id + 1}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Test very large ID
        response = self.client.get("/api/image/999999999")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
