from django.urls import path

from blog_api import views

urlpatterns = [
    path("image/<int:id>", views.image.image),
    path("auth/register", views.auth.register),
    path("auth/login", views.auth.login),
    path("user/by-id/<int:user_id>/profile", views.profile.ProfileView.as_view()),
    path("user/by-name/<str:username>/profile", views.profile.username_profile_view),
    path("user/me/profile", views.profile.me_profile_view),
    path("post/<int:post_id>/comments", views.comment.CommentView.as_view()),  # GET (list), POST (create)
    path("post/<int:post_id>/comments/<int:comment_id>", views.comment.CommentView.as_view()),  # PUT, DELETE
]
