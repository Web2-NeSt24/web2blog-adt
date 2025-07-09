from django.urls import path

from blog_api import views

# API v1 endpoints
urlpatterns = [
    path("v1/auth/csrf-token", views.auth.csrf_token),
    path("v1/images/<int:id>", views.image.image),
    path("v1/images/", views.image.upload_image_multipart),  # Preferred multipart upload
    path("v1/images/base64/", views.image.upload_image),  # Deprecated base64 upload
    path("v1/auth/register", views.auth.register),
    path("v1/auth/login", views.auth.login),
    path("v1/auth/logout", views.auth.logout),
    path("v1/auth/password", views.auth.password),
    path("v1/users/by-id/<int:user_id>/profile", views.profile.ProfileView.as_view()),
    path("v1/users/by-name/<str:username>/profile", views.profile.username_profile_view),
    path("v1/users/me/profile", views.profile.me_profile_view),
    path("v1/posts/by-id/<int:post_id>", views.post.PostView.as_view()),
    path("v1/posts/<int:post_id>/comments/", views.comment.CommentView.as_view()),  # GET (list), POST (create)
    path("v1/comments/<int:comment_id>/", views.comment.CommentInstanceView.as_view()),  # PATCH (edit), DELETE (delete)
    path("v1/posts/<int:post_id>/bookmarks/", views.bookmark.BookmarkPostView.as_view()),  # POST (create bookmark)
    path("v1/bookmarks/", views.bookmark.BookmarkListView.as_view()),  # GET (list all bookmarks)
    path("v1/bookmarks/<int:bookmark_id>/", views.bookmark.BookmarkInstanceView.as_view()),  # PATCH (edit), DELETE (delete)
    path("v1/posts/<int:post_id>/likes/", views.like.LikeView.as_view()),  # PUT (like), DELETE (unlike), GET (check like status)
    path("v1/drafts/", views.draft.DraftsView.as_view()),  # GET (list all drafts), POST (create draft)
    path("v1/drafts/<int:draft_id>/", views.draft.DraftInstanceView.as_view()),  # GET (get draft), PUT (update draft), DELETE (delete draft)
    path("v1/drafts/<int:draft_id>/publish/", views.draft.DraftPublishView.as_view()),  # POST (publish draft)
    path("v1/posts/", views.posts.PostsView.as_view()),  # GET (list all posts with filtering)
]
