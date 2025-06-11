from django.db.models import Q, Count
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import views, permissions

from blog_api import models, serializers


class PostFilterView(views.APIView):
    permission_classes = [permissions.AllowAny]  # Public filtering functionality
    
    @extend_schema(
        summary="Filter and search posts",
        description="""
        Advanced post filtering and search functionality. Filter posts by multiple criteria:
        
        - **author_id**: Filter by specific user ID
        - **author_name**: Filter by username (case-insensitive)
        - **tags**: Filter by hashtags (all specified tags must be present)
        - **keywords**: Search in title and content (any keyword match)
        - **sort_by**: Sort results by date (newest first) or popularity (most liked first)
        
        All filters are combined with AND logic, except keywords which use OR logic.
        Only published posts are included in results.
        """,
        request=serializers.PostFilterSerializer, 
        responses={
            200: serializers.PostListSerializer
        }, 
        tags=['Filters']
    )
    def post(self, request: views.Request):
        serializer = serializers.PostFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        queryset = models.Post.objects.filter(draft=False)

        if serializer.validated_data.get("author_id") is not None:
            queryset = queryset.filter(profile__user__id=serializer.validated_data["author_id"])

        if serializer.validated_data.get("author_name") is not None:
            queryset = queryset.filter(profile__user__username__iexact=serializer.validated_data["author_name"])

        for tag in serializer.validated_data["tags"]:
            queryset = queryset.filter(tags__value__iexact=tag)

        for keyword in serializer.validated_data["keywords"]:
            queryset = queryset.filter(Q(title__icontains=keyword) | Q(content__icontains=keyword))
        
        queryset = queryset.distinct()

        match serializer.validated_data["sort_by"]:
            case serializers.PostSortingMethod.DATE.value:
                queryset = queryset.order_by("-id")
            case serializers.PostSortingMethod.LIKES.value:
                queryset = queryset.annotate(like_count=Count("like")).order_by("-like_count")

        queryset = queryset.values_list("id", flat=True)

        list_serializer = serializers.PostListSerializer({ "post_ids": queryset })

        return views.Response(list_serializer.data)
