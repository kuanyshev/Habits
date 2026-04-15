from django.urls import path

from . import views

urlpatterns = [
    path("search/", views.search_by_nickname),
    path("subscribe/", views.subscribe),
    path("subscribe/<int:user_id>/", views.unsubscribe),
    path("friends/", views.list_friends),
    path("friends/<int:user_id>/", views.unfriend),
    path("profile/<int:user_id>/", views.user_profile),
    path("posts/", views.posts_feed),
]
