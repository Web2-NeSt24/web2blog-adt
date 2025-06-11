from django.db.models import Q, Count
from drf_spectacular.utils import extend_schema
from rest_framework import views

from blog_api import models, serializers


class PostFilterView(views.APIView):
    @extend_schema(request=serializers.PostFilterSerializer, responses={ 200: serializers.PostListSerializer })
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
