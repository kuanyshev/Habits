from django.contrib.auth import get_user_model

User = get_user_model()


def make_unique_username(base: str) -> str:
    candidate = (base or "user").strip().lower()
    candidate = "".join(ch for ch in candidate if ch.isalnum() or ch in "._-")
    if not candidate:
        candidate = "user"
    candidate = candidate[:150]

    if not User.objects.filter(username=candidate).exists():
        return candidate

    idx = 1
    while True:
        suffix = f"_{idx}"
        trimmed = candidate[: 150 - len(suffix)]
        next_candidate = f"{trimmed}{suffix}"
        if not User.objects.filter(username=next_candidate).exists():
            return next_candidate
        idx += 1


def make_unique_nickname(display: str) -> str:
    base = (display or "").strip() or "user"
    base = base[:64]
    if not User.objects.filter(nickname__iexact=base).exists():
        return base
    idx = 1
    while True:
        suffix = f"_{idx}"
        trimmed = base[: 64 - len(suffix)]
        cand = f"{trimmed}{suffix}"
        if not User.objects.filter(nickname__iexact=cand).exists():
            return cand
        idx += 1
