from django.urls import path

from blog_api import views

urlpatterns = [
    path("image/<int:id>", views.image),
    path("auth/register", views.register),
    path("auth/login", views.login),
]
