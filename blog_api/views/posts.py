from django.db.models import Q, Count
from drf_spectacular.utils import extend_schema
from rest_framework import views, permissions
from rest_framework.response import Response

from blog_api import models, serializers


class PostsView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        summary="List and filter published posts",
        description="""
        Retrieve a list of all published blog posts with optional filtering and searching.
        
        **Query Parameters:**
        - `author`: Filter by author user ID (e.g., `?author=1`)
        - `author_name`: Filter by username (case-insensitive, e.g., `?author_name=john`)
        - `tags`: Filter by hashtags (comma-separated, all must be present, e.g., `?tags=api,backend`)
        - `keywords`: Search in title and content (comma-separated, any match, e.g., `?keywords=django,tutorial`)
        - `sort_by`: Sort by `DATE` (newest first) or `LIKES` (most popular first)
        - `page`: Page number for pagination (default: 1)
        - `page_size`: Number of items per page (default: 20, max: 100)
        """,
        responses={
            200: serializers.PostSerializer(many=True)
        }, 
        tags=['Posts']
    )
    def get(self, request):
        queryset = models.Post.objects.filter(draft=False)
        
        # Apply filters based on query parameters
        author_id = request.query_params.get('author')
        if author_id:
            try:
                author_id = int(author_id)
                queryset = queryset.filter(profile__user__id=author_id)
            except ValueError:
                return Response({"error": "Invalid author ID"}, status=400)
        
        author_name = request.query_params.get('author_name')
        if author_name:
            queryset = queryset.filter(profile__user__username__iexact=author_name)
        
        tags = request.query_params.get('tags')
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            for tag in tag_list:
                queryset = queryset.filter(tags__value__iexact=tag)
        
        keywords = request.query_params.get('keywords')
        if keywords:
            keyword_list = [kw.strip() for kw in keywords.split(',') if kw.strip()]
            for keyword in keyword_list:
                queryset = queryset.filter(Q(title__icontains=keyword) | Q(content__icontains=keyword))
        
        queryset = queryset.distinct()
        
        # Apply sorting
        sort_by = request.query_params.get('sort_by', 'DATE')
        if sort_by.upper() == 'LIKES':
            queryset = queryset.annotate(like_count=Count("like")).order_by("-like_count")
        else:
            queryset = queryset.order_by("-id")
        
        # Apply pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = min(int(request.query_params.get('page_size', 20)), 100)
        paginated_posts = paginator.paginate_queryset(queryset, request)
        
        serializer = serializers.PostSerializer(paginated_posts, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

