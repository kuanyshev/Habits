from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils.dateparse import parse_date

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .forms import HabitForm
from .models import Habit


def _map_frontend_category(frontend_label: str) -> str:
    if not frontend_label:
        return "sport"
    m = {
        "Fitness": "sport",
        "Sport": "sport",
        "Health": "health",
        "Learning": "study",
        "Study": "study",
        "Productivity": "study",
        "Education": "study",
        "Reading": "study",
        "Nutrition": "health",
        "Meditation": "health",
        "Mindfulness": "health",
        "Water": "health",
        "Sleep": "health",
        "Creativity": "sport",
        "Social": "sport",
    }
    return m.get(frontend_label.strip(), "sport")


def _habit_to_dict(h: Habit) -> dict:
    return {
        "id": h.id,
        "name": h.name,
        "habitName": h.name,
        "description": h.description,
        "category": h.category,
        "category_label": h.category_label or h.get_category_display(),
        "category_display": h.get_category_display(),
        "start_date": h.start_date.isoformat() if h.start_date else None,
        "end_date": h.end_date.isoformat() if h.end_date else None,
        "xp": h.xp,
        "xp_max": h.xp_max,
        "level": h.level,
        "status": h.status,
        "created_at": h.created_at.isoformat(),
    }


@login_required
def create_habit(request):
    if request.method == "POST":
        form = HabitForm(request.POST)
        if form.is_valid():
            habit = form.save(commit=False)
            habit.user = request.user
            habit.save()
            return redirect("habit_list")
    else:
        form = HabitForm()

    return render(request, "habits/create_habit.html", {"form": form})


@login_required
def habit_list(request):
    habits = Habit.objects.filter(user=request.user)
    return render(request, "habits/habit_list.html", {"habits": habits})


# --- API для React (JSON, через DRF + JWT) ---

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def api_habits(request):
    """
    GET /habits/api/habits/  — список привычек текущего пользователя.
    POST /habits/api/habits/ — создать привычку (JSON: name, description?, category).
    """
    if request.method == "GET":
        habits = Habit.objects.filter(user=request.user).order_by("-created_at")
        return Response({"habits": [_habit_to_dict(h) for h in habits]})

    # POST
    body = request.data
    name = (body.get("name") or body.get("habitName") or "").strip()
    if not name:
        return Response({"error": "name is required"}, status=400)

    raw_cat = body.get("category") or "sport"
    if raw_cat in dict(Habit.CATEGORY_CHOICES):
        category = raw_cat
        category_label = (body.get("category_label") or "").strip()
    else:
        category_label = str(raw_cat).strip()
        category = _map_frontend_category(category_label)

    desc = (body.get("description") or "").strip()
    start_raw = body.get("start_date") or body.get("startDate")
    end_raw = body.get("end_date") or body.get("endDate")
    start_date = parse_date(str(start_raw)) if start_raw else None
    end_date = parse_date(str(end_raw)) if end_raw else None

    habit = Habit.objects.create(
        user=request.user,
        name=name,
        description=desc,
        category=category,
        category_label=category_label,
        start_date=start_date,
        end_date=end_date,
        xp=int(body.get("xp", 0) or 0),
        xp_max=int(body.get("xp_max", body.get("xpMax", 1000)) or 1000),
        level=int(body.get("level", 1) or 1),
        status=(body.get("status") or "Active").strip() or "Active",
    )
    return Response(_habit_to_dict(habit), status=201)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def api_habit_detail(request, pk):
    habit = get_object_or_404(Habit, pk=pk, user=request.user)
    body = request.data
    if "xp" in body:
        habit.xp = int(body["xp"] or 0)
    if "xp_max" in body or "xpMax" in body:
        habit.xp_max = int(body.get("xp_max", body.get("xpMax")) or 1000)
    if "level" in body:
        habit.level = int(body["level"] or 1)
    if "status" in body:
        habit.status = str(body["status"] or "Active").strip() or "Active"
    if "name" in body and str(body["name"]).strip():
        habit.name = str(body["name"]).strip()
    if "habitName" in body and str(body["habitName"]).strip():
        habit.name = str(body["habitName"]).strip()
    if "description" in body:
        habit.description = str(body.get("description") or "").strip()
    habit.save()
    return Response(_habit_to_dict(habit))