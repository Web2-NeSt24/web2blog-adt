from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, views

from blog_api import serializers
from blog_api import models


class DraftsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    @extend_schema(responses={ 201: serializers.DraftSerializer }, tags=['Drafts'])
    def post(self, request: views.Request):
        draft = request.user.profile.post_set.create(title="", content="", image=None, draft=True)
        serializer = serializers.DraftSerializer(draft)
        return views.Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(responses={ 200: serializers.ProfileDraftsSerializer }, tags=['Drafts'])
    def get(self, request: views.Request):
        serializer = serializers.ProfileDraftsSerializer(request.user.profile)
        return views.Response(serializer.data)

class DraftPublishView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: serializers.PostSerializer}, tags=['Drafts'])
    def post(self, request: views.Request, draft_id: int):
        try:
            draft = request.user.profile.post_set.get(id=draft_id, draft=True)
        except models.Post.DoesNotExist:
            return views.Response({'detail': 'Draft not found'}, status=status.HTTP_404_NOT_FOUND)
        draft.draft = False
        draft.save()
        serializer = serializers.PostSerializer(draft)
        return views.Response(serializer.data, status=status.HTTP_200_OK)
