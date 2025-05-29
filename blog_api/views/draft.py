from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, views

from blog_api import serializers



class DraftsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(responses={ 200: serializers.DraftSerializer })
    def post(self, request: views.Request):
        draft = request.user.profile.post_set.create(profile=request.user.profile, title="", content="", image=None, draft=True)
        serializer = serializers.DraftSerializer(draft)
        return views.Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(responses={ 200: serializers.ProfileDraftsSerializer })
    def get(self, request: views.Request):
        serializer = serializers.ProfileDraftsSerializer(request.user.profile)
        return views.Response(serializer.data)



