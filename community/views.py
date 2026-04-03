from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Follow, Post

User = get_user_model()


def _i_follow(a, b) -> bool:
    return Follow.objects.filter(follower=a, following=b).exists()


def _are_friends(a, b) -> bool:
    if a.pk == b.pk:
        return True
    return _i_follow(a, b) and _i_follow(b, a)


def _mutual_friend_ids(user):
    following = set(
        Follow.objects.filter(follower=user).values_list("following_id", flat=True)
    )
    followers = set(
        Follow.objects.filter(following=user).values_list("follower_id", flat=True)
    )
    return following & followers


def _profile_payload(viewer, target):
    return {
        "id": target.id,
        "username": target.username,
        "xp": target.xp,
        "level": target.level,
        "date_joined": target.date_joined.isoformat() if target.date_joined else None,
        "email": target.email if viewer.pk == target.pk else None,
        "i_follow": _i_follow(viewer, target),
        "follows_me": _i_follow(target, viewer),
        "is_friend": _are_friends(viewer, target),
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_by_email(request):
    email = (request.query_params.get("email") or "").strip().lower()
    if not email:
        return Response({"error": "email query required"}, status=400)
    if "@" not in email:
        return Response({"error": "invalid email"}, status=400)

    user = (
        User.objects.filter(email__iexact=email)
        .exclude(pk=request.user.pk)
        .first()
    )
    if not user:
        return Response({"found": False})

    return Response(
        {
            "found": True,
            "user": _profile_payload(request.user, user),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def subscribe(request):
    try:
        uid = int(request.data.get("user_id"))
    except (TypeError, ValueError):
        return Response({"error": "user_id required"}, status=400)

    if uid == request.user.pk:
        return Response({"error": "cannot subscribe to yourself"}, status=400)

    target = User.objects.filter(pk=uid).first()
    if not target:
        return Response({"error": "user not found"}, status=404)

    Follow.objects.get_or_create(follower=request.user, following=target)
    return Response(_profile_payload(request.user, target))


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def unsubscribe(request, user_id):
    if user_id == request.user.pk:
        return Response({"error": "invalid"}, status=400)
    target = User.objects.filter(pk=user_id).first()
    if not target:
        return Response({"error": "user not found"}, status=404)

    Follow.objects.filter(follower=request.user, following=target).delete()
    return Response(_profile_payload(request.user, target))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_friends(request):
    ids = _mutual_friend_ids(request.user)
    users = User.objects.filter(pk__in=ids).order_by("username")
    return Response(
        {
            "friends": [
                {
                    "id": u.id,
                    "username": u.username,
                    "xp": u.xp,
                    "level": u.level,
                }
                for u in users
            ]
        }
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def unfriend(request, user_id):
    target = User.objects.filter(pk=user_id).first()
    if not target:
        return Response({"error": "user not found"}, status=404)

    Follow.objects.filter(follower=request.user, following=target).delete()
    Follow.objects.filter(follower=target, following=request.user).delete()
    return Response({"ok": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request, user_id):
    """Карточка пользователя: email только у себя; остальное видно любому авторизованному."""
    target = User.objects.filter(pk=user_id).first()
    if not target:
        return Response({"error": "user not found"}, status=404)

    return Response(_profile_payload(request.user, target))


def _serialize_posts(qs):
    return [
        {
            "id": p.id,
            "text": p.text,
            "created_at": p.created_at.isoformat(),
            "author_id": p.author_id,
            "author_username": p.author.username,
        }
        for p in qs
    ]


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def posts_feed(request):
    if request.method == "GET":
        scope = (request.query_params.get("scope") or "friends").strip().lower()
        user = request.user

        if scope == "global":
            qs = (
                Post.objects.all()
                .select_related("author")
                .order_by("-created_at")[:200]
            )
        elif scope == "mine":
            qs = (
                Post.objects.filter(author=user)
                .select_related("author")
                .order_by("-created_at")[:200]
            )
        elif scope == "subscriptions":
            following_ids = set(
                Follow.objects.filter(follower=user).values_list(
                    "following_id", flat=True
                )
            )
            friend_ids = _mutual_friend_ids(user)
            author_ids = following_ids | friend_ids
            qs = (
                Post.objects.filter(author_id__in=author_ids)
                .select_related("author")
                .order_by("-created_at")[:200]
            )
        else:
            # friends: mutual friends + self (same as previous default feed)
            friend_ids = _mutual_friend_ids(user)
            friend_ids.add(user.pk)
            qs = (
                Post.objects.filter(author_id__in=friend_ids)
                .select_related("author")
                .order_by("-created_at")[:200]
            )

        return Response({"posts": _serialize_posts(qs)})

    text = (request.data.get("text") or "").strip()
    if not text:
        return Response({"error": "text required"}, status=400)
    post = Post.objects.create(author=request.user, text=text)
    return Response(
        {
            "id": post.id,
            "text": post.text,
            "created_at": post.created_at.isoformat(),
            "author_id": post.author_id,
            "author_username": post.author.username,
        },
        status=201,
    )
