from django.contrib import admin

from .models import Follow, Post


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ("follower", "following", "created_at")
    raw_id_fields = ("follower", "following")


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("author", "text", "created_at")
    raw_id_fields = ("author",)
