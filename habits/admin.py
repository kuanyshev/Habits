from django.contrib import admin
from .models import Habit, Task


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    pass


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("id", "habit", "scheduled_date", "text")
    list_filter = ("completed",)
    raw_id_fields = ("habit",)