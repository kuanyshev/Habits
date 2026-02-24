from django.db import models
from django.conf import settings


class Habit(models.Model):

    CATEGORY_CHOICES = [
        ('sport', 'Sport'),
        ('health', 'Health'),
        ('study', 'Study'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
