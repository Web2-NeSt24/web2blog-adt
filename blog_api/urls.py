from django.urls import path

from . import views

urlpatterns = [
    path("image/<int:id>", views.ImageView.as_view()),
]
