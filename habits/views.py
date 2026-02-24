from django.shortcuts import render, redirect
from .forms import HabitForm
from django.contrib.auth.decorators import login_required
from .models import Habit

# @login_required
def create_habit(request):
    if request.method == 'POST':
        form = HabitForm(request.POST)
        if form.is_valid():
            habit = form.save(commit=False)
            habit.user = request.user
            habit.save()
            return redirect('habit_list')
    else:
        form = HabitForm()  
        
    return render(request, 'habits/create_habit.html', {'form': form})

# @login_required
def habit_list(request):
    habits = Habit.objects.filter(user=request.user)
    return render(request, 'habits/habit_list.html', {'habits': habits})