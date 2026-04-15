from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # Публичное имя в UI и поиск в Community; уникально (без учёта регистра при проверке в сериализаторе).
    nickname = models.CharField(max_length=64, unique=True)

    # Email must be unique per account. We keep it nullable to avoid breaking
    # existing rows that may have empty email during migration.
    email = models.EmailField(unique=True, null=True, blank=True)
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    onboarding_completed = models.BooleanField(default=False)

    # Profile fields (must match DB NOT NULL columns; empty string when unset)
    about = models.TextField(blank=True, default="")
    avatar = models.TextField(blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    status_text = models.CharField(max_length=200, blank=True, default="")
