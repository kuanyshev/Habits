# Идемпотентно добавляет недостающие колонки в habits_task (если 0004 была применена
# в другом виде или схема расходилась с БД).

from django.db import migrations


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


def _ensure_columns(apps, schema_editor):
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


def _noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("habits", "0004_task"),
    ]

    operations = [
        migrations.RunPython(_ensure_columns, _noop),
    ]
