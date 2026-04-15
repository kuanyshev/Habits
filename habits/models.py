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
    category_label = models.CharField(max_length=100, blank=True, default="")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    xp = models.IntegerField(default=0)
    xp_max = models.IntegerField(default=1000)
    level = models.IntegerField(default=1)
    status = models.CharField(max_length=50, default="Active")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    """Задача внутри цели (привычки)."""

    habit = models.ForeignKey(
        Habit,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    text = models.TextField(blank=True, default="")
    scheduled_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    xp = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["scheduled_date", "start_time", "id"]

    def __str__(self):
        return f"{self.habit_id}: {self.text[:40]}"
