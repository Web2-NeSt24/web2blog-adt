from drf_spectacular.utils import extend_schema
from rest_framework import status, views, permissions
from django.db import IntegrityError

from blog_api import models, serializers


class BookmarkPostView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=serializers.BookmarkCreateSerializer, responses={201: serializers.BookmarkSerializer, 404: None, 409: None})
    def post(self, request: views.Request, post_id: int):
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = serializers.BookmarkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            bookmark = models.Bookmark.objects.create(
                post=post,
                creator_profile=request.user.profile,
                title=serializer.validated_data.get("title", "")
            )
            return views.Response(serializers.BookmarkSerializer(bookmark).data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return views.Response({"error": "Post already bookmarked"}, status=status.HTTP_409_CONFLICT)


class BookmarkListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: serializers.BookmarkSerializer(many=True)})
    def get(self, request: views.Request):
        bookmarks = models.Bookmark.objects.filter(creator_profile=request.user.profile)
        serializer = serializers.BookmarkSerializer(bookmarks, many=True)
        return views.Response(serializer.data)


class BookmarkInstanceView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=serializers.BookmarkUpdateSerializer, responses={200: serializers.BookmarkSerializer, 403: None, 404: None})
    def patch(self, request: views.Request, bookmark_id: int):
        try:
            bookmark = models.Bookmark.objects.get(pk=bookmark_id)
        except models.Bookmark.DoesNotExist:
            return views.Response({"error": "Bookmark not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if bookmark.creator_profile != request.user.profile:
            return views.Response({"error": "You can only edit your own bookmarks"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = serializers.BookmarkUpdateSerializer(bookmark, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        bookmark.title = serializer.validated_data.get("title", bookmark.title)
        bookmark.save()
        return views.Response(serializers.BookmarkSerializer(bookmark).data)

    @extend_schema(responses={204: None, 403: None, 404: None})
    def delete(self, request: views.Request, bookmark_id: int):
        try:
            bookmark = models.Bookmark.objects.get(pk=bookmark_id)
        except models.Bookmark.DoesNotExist:
            return views.Response({"error": "Bookmark not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if bookmark.creator_profile != request.user.profile:
            return views.Response({"error": "You can only delete your own bookmarks"}, status=status.HTTP_403_FORBIDDEN)
        
        bookmark.delete()
        return views.Response(status=status.HTTP_204_NO_CONTENT)
