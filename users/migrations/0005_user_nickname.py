from django.db import migrations, models


def fill_nicknames(apps, schema_editor):
    User = apps.get_model("users", "User")
    for u in User.objects.all().order_by("pk"):
        if u.nickname:
            continue
        base = (u.username or "")[:50] or f"user{u.pk}"
        nick = base[:64]
        n = 0
        while (
            User.objects.filter(nickname__iexact=nick).exclude(pk=u.pk).exists()
        ):
            n += 1
            suffix = f"_{n}"
            nick = f"{base[: max(1, 64 - len(suffix))]}{suffix}"[:64]
        u.nickname = nick
        u.save(update_fields=["nickname"])


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0004_user_profile_columns"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="nickname",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.RunPython(fill_nicknames, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="user",
            name="nickname",
            field=models.CharField(max_length=64, unique=True),
        ),
    ]
