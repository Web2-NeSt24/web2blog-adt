from django.urls import path

from blog_api import views

urlpatterns = [
    path("image/<int:id>", views.image.image),
    path("auth/register", views.auth.register),
    path("auth/login", views.auth.login),
]
