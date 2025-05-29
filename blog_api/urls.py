from django.urls import path

from blog_api import views

urlpatterns = [
    path("image/<int:id>", views.image.image),
    path("auth/register", views.auth.register),
    path("auth/login", views.auth.login),
    path("auth/password", views.auth.password),
    path("user/by-id/<int:user_id>/profile", views.profile.ProfileView.as_view()),
    path("user/by-name/<str:username>/profile", views.profile.username_profile_view),
    path("user/me/profile", views.profile.me_profile_view),
    path("post/by-id/<int:post_id>", views.post.PostView.as_view()),
    path("post/<int:post_id>/comments/", views.comment.CommentView.as_view()),  # GET (list), POST (create)
    path("comments/<int:comment_id>/", views.comment.CommentInstanceView.as_view()),  # PATCH (edit), DELETE (delete)
    path("post/<int:post_id>/bookmark/", views.bookmark.BookmarkPostView.as_view()),  # POST (create bookmark)
    path("bookmarks/", views.bookmark.BookmarkListView.as_view()),  # GET (list all bookmarks)
    path("bookmarks/<int:bookmark_id>/", views.bookmark.BookmarkInstanceView.as_view()),  # PATCH (edit), DELETE (delete)
]
