# Task model — синхронизация с БД: таблица могла быть без scheduled_date и других полей

import django.db.models.deletion
from django.db import migrations, models


def _column_exists(cursor, table, column):
    cursor.execute(
        """
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = %s
          AND column_name = %s
        """,
        [table, column],
    )
    return cursor.fetchone() is not None


def _ensure_task_schema(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    table = "habits_task"
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = %s
            )
            """,
            [table],
        )
        if not cursor.fetchone()[0]:
            cursor.execute(
                """
                CREATE TABLE habits_task (
                    id BIGSERIAL NOT NULL PRIMARY KEY,
                    habit_id BIGINT NOT NULL
                        REFERENCES habits_habit(id)
                        ON DELETE CASCADE
                        DEFERRABLE INITIALLY DEFERRED,
                    text TEXT NOT NULL DEFAULT '',
                    scheduled_date DATE NULL,
                    start_time TIME NULL,
                    end_time TIME NULL,
                    completed BOOLEAN NOT NULL DEFAULT FALSE,
                    xp INTEGER NOT NULL DEFAULT 100,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )
            return

        alters = [
            ("scheduled_date", "DATE NULL"),
            ("start_time", "TIME NULL"),
            ("end_time", "TIME NULL"),
            ("completed", "BOOLEAN NOT NULL DEFAULT FALSE"),
            ("xp", "INTEGER NOT NULL DEFAULT 100"),
            ("created_at", "TIMESTAMPTZ NOT NULL DEFAULT NOW()"),
        ]
        for col, ddl in alters:
            if not _column_exists(cursor, table, col):
                cursor.execute(
                    f'ALTER TABLE habits_task ADD COLUMN "{col}" {ddl}'
                )


def _noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("habits", "0003_habit_extended_fields"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name="Task",
                    fields=[
                        (
                            "id",
                            models.BigAutoField(
                                auto_created=True,
                                primary_key=True,
                                serialize=False,
                                verbose_name="ID",
                            ),
                        ),
                        ("text", models.TextField(blank=True, default="")),
                        (
                            "scheduled_date",
                            models.DateField(blank=True, null=True),
                        ),
                        (
                            "start_time",
                            models.TimeField(blank=True, null=True),
                        ),
                        (
                            "end_time",
                            models.TimeField(blank=True, null=True),
                        ),
                        (
                            "completed",
                            models.BooleanField(default=False),
                        ),
                        ("xp", models.IntegerField(default=100)),
                        (
                            "created_at",
                            models.DateTimeField(auto_now_add=True),
                        ),
                        (
                            "habit",
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="tasks",
                                to="habits.habit",
                            ),
                        ),
                    ],
                    options={
                        "ordering": ["scheduled_date", "start_time", "id"],
                    },
                ),
            ],
            database_operations=[
                migrations.RunPython(_ensure_task_schema, _noop_reverse),
            ],
        ),
    ]
