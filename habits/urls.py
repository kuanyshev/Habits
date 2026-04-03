from django.urls import path
from . import views

urlpatterns = [
    path('', views.habit_list, name='habit_list'),        # список привычек
    path('create/', views.create_habit, name='create_habit'),  # создать привычку
    path('api/habits/', views.api_habits),
    path('api/habits/<int:pk>/', views.api_habit_detail),
]
