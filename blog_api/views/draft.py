from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework import permissions, status, views

from blog_api import serializers
from blog_api import models


class DraftsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Create a new draft",
        description="Create a new empty draft post for the authenticated user. The draft can be edited and later published.",
        responses={
            201: serializers.DraftSerializer
        }, 
        tags=['Drafts']
    )
    def post(self, request: views.Request):
        draft = request.user.profile.post_set.create(title="", content="", image=None, draft=True)
        serializer = serializers.DraftSerializer(draft)
        return views.Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(
        summary="List user's drafts",
        description="Retrieve all draft posts for the authenticated user. Supports pagination with page and page_size parameters.",
        parameters=[
            OpenApiParameter("page", int, OpenApiParameter.QUERY, description="Page number (default: 1)"),
            OpenApiParameter("page_size", int, OpenApiParameter.QUERY, description="Number of items per page (default: 20, max: 100)")
        ],
        responses={
            200: serializers.DraftSerializer(many=True)
        }, 
        tags=['Drafts']
    )
    def get(self, request: views.Request):
        drafts = request.user.profile.post_set.filter(draft=True).order_by('-id')
        
        # Apply pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = min(int(request.query_params.get('page_size', 20)), 100)
        paginated_drafts = paginator.paginate_queryset(drafts, request)
        
        serializer = serializers.DraftSerializer(paginated_drafts, many=True)
        return paginator.get_paginated_response(serializer.data)


class DraftInstanceView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get a specific draft",
        description="Retrieve a specific draft post by ID. Only the draft owner can access their drafts.",
        parameters=[OpenApiParameter("draft_id", int, OpenApiParameter.PATH, description="Unique identifier of the draft")],
        responses={
            200: serializers.DraftSerializer,
            404: OpenApiResponse(description="Draft not found or not owned by user")
        },
        tags=['Drafts']
    )
    def get(self, request: views.Request, draft_id: int):
        try:
            draft = request.user.profile.post_set.get(id=draft_id, draft=True)
        except models.Post.DoesNotExist:
            return views.Response({'detail': 'Draft not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = serializers.DraftSerializer(draft)
        return views.Response(serializer.data)
    
    @extend_schema(
        summary="Update a draft",
        description="Update a specific draft post. Only the draft owner can update their drafts.",
        parameters=[OpenApiParameter("draft_id", int, OpenApiParameter.PATH, description="Unique identifier of the draft")],
        request=serializers.DraftUpdateSerializer,
        responses={
            200: serializers.DraftSerializer,
            404: OpenApiResponse(description="Draft not found or not owned by user")
        },
        tags=['Drafts']
    )
    def put(self, request: views.Request, draft_id: int):
        try:
            draft = request.user.profile.post_set.get(id=draft_id, draft=True)
        except models.Post.DoesNotExist:
            return views.Response({'detail': 'Draft not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = serializers.DraftUpdateSerializer(draft, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = serializers.DraftSerializer(draft)
            return views.Response(response_serializer.data)
        return views.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Delete a draft",
        description="Delete a specific draft post. Only the draft owner can delete their drafts.",
        parameters=[OpenApiParameter("draft_id", int, OpenApiParameter.PATH, description="Unique identifier of the draft")],
        responses={
            204: OpenApiResponse(description="Draft deleted successfully"),
            404: OpenApiResponse(description="Draft not found or not owned by user")
        },
        tags=['Drafts']
    )
    def delete(self, request: views.Request, draft_id: int):
        try:
            draft = request.user.profile.post_set.get(id=draft_id, draft=True)
        except models.Post.DoesNotExist:
            return views.Response({'detail': 'Draft not found'}, status=status.HTTP_404_NOT_FOUND)
        
        draft.delete()
        return views.Response(status=status.HTTP_204_NO_CONTENT)


class DraftPublishView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Publish a draft",
        description="Convert a draft post to a published post, making it visible to all users. Only the draft owner can publish their drafts.",
        parameters=[OpenApiParameter("draft_id", int, OpenApiParameter.PATH, description="Unique identifier of the draft")],
        responses={
            200: serializers.PostSerializer,
            404: OpenApiResponse(description="Draft not found or not owned by user")
        },
        tags=['Drafts']
    )
    def post(self, request: views.Request, draft_id: int):
        try:
            draft = request.user.profile.post_set.get(id=draft_id, draft=True)
        except models.Post.DoesNotExist:
            return views.Response({'detail': 'Draft not found'}, status=status.HTTP_404_NOT_FOUND)
        draft.draft = False
        draft.save()
        serializer = serializers.PostSerializer(draft)
        return views.Response(serializer.data, status=status.HTTP_200_OK)
