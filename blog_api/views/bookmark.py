from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from rest_framework import status, views, permissions
from django.db import IntegrityError

from blog_api import models, serializers


class BookmarkPostView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Create a bookmark for a post",
        description="Creates a bookmark for the authenticated user on the given post.",
        parameters=[OpenApiParameter("post_id", int, OpenApiParameter.PATH)],
        request=serializers.BookmarkCreateSerializer,
        responses={
            201: serializers.BookmarkSerializer,
            404: OpenApiResponse(description="Post not found"),
            409: OpenApiResponse(description="Post already bookmarked"),
        },
    )
    def post(self, request: views.Request, post_id: int):
        try:
            post = models.Post.objects.get(pk=post_id)
        except models.Post.DoesNotExist:
            return views.Response(
                {"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = serializers.BookmarkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            bookmark = models.Bookmark.objects.create(
                post=post,
                creator_profile=request.user.profile,
                title=serializer.validated_data.get("title", ""),
            )
            return views.Response(
                serializers.BookmarkSerializer(bookmark).data,
                status=status.HTTP_201_CREATED,
            )
        except IntegrityError:
            return views.Response(
                {"error": "Post already bookmarked"},
                status=status.HTTP_409_CONFLICT,
            )


class BookmarkListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="List all bookmarks for the authenticated user",
        description="Returns all bookmarks for the authenticated user.",
        responses={200: serializers.BookmarkSerializer(many=True)},
    )
    def get(self, request: views.Request):
        bookmarks = models.Bookmark.objects.filter(
            creator_profile=request.user.profile
        )
        serializer = serializers.BookmarkSerializer(bookmarks, many=True)
        return views.Response(serializer.data)


class BookmarkInstanceView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Edit a bookmark title",
        description="Updates the title of a bookmark for the authenticated user.",
        parameters=[OpenApiParameter("bookmark_id", int, OpenApiParameter.PATH)],
        request=serializers.BookmarkUpdateSerializer,
        responses={
            200: serializers.BookmarkSerializer,
            403: OpenApiResponse(description="Forbidden"),
            404: OpenApiResponse(description="Bookmark not found"),
        },
    )
    def patch(self, request: views.Request, bookmark_id: int):
        try:
            bookmark = models.Bookmark.objects.get(pk=bookmark_id)
        except models.Bookmark.DoesNotExist:
            return views.Response(
                {"error": "Bookmark not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if bookmark.creator_profile != request.user.profile:
            return views.Response(
                {"error": "You can only edit your own bookmarks"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = serializers.BookmarkUpdateSerializer(
            bookmark, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        bookmark.title = serializer.validated_data.get("title", bookmark.title)
        bookmark.save()
        return views.Response(serializers.BookmarkSerializer(bookmark).data)

    @extend_schema(
        summary="Delete a bookmark",
        description="Deletes a bookmark for the authenticated user.",
        parameters=[OpenApiParameter("bookmark_id", int, OpenApiParameter.PATH)],
        responses={
            204: OpenApiResponse(description="Bookmark deleted"),
            403: OpenApiResponse(description="Forbidden"),
            404: OpenApiResponse(description="Bookmark not found"),
        },
    )
    def delete(self, request: views.Request, bookmark_id: int):
        try:
            bookmark = models.Bookmark.objects.get(pk=bookmark_id)
        except models.Bookmark.DoesNotExist:
            return views.Response(
                {"error": "Bookmark not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if bookmark.creator_profile != request.user.profile:
            return views.Response(
                {"error": "You can only delete your own bookmarks"},
                status=status.HTTP_403_FORBIDDEN,
            )

        bookmark.delete()
        return views.Response(status=status.HTTP_204_NO_CONTENT)
