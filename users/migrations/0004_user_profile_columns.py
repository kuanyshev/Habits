from django.db import migrations, models


def _ensure_columns(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'users_user'
                      AND column_name = 'about'
                ) THEN
                    ALTER TABLE users_user ADD COLUMN about text NOT NULL DEFAULT '';
                ELSE
                    ALTER TABLE users_user ALTER COLUMN about SET DEFAULT '';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'users_user'
                      AND column_name = 'avatar'
                ) THEN
                    ALTER TABLE users_user ADD COLUMN avatar text NOT NULL DEFAULT '';
                ELSE
                    ALTER TABLE users_user ALTER COLUMN avatar SET DEFAULT '';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'users_user'
                      AND column_name = 'location'
                ) THEN
                    ALTER TABLE users_user ADD COLUMN location varchar(255) NOT NULL DEFAULT '';
                ELSE
                    ALTER TABLE users_user ALTER COLUMN location SET DEFAULT '';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'users_user'
                      AND column_name = 'phone'
                ) THEN
                    ALTER TABLE users_user ADD COLUMN phone varchar(50) NOT NULL DEFAULT '';
                ELSE
                    ALTER TABLE users_user ALTER COLUMN phone SET DEFAULT '';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'users_user'
                      AND column_name = 'status_text'
                ) THEN
                    ALTER TABLE users_user ADD COLUMN status_text varchar(200) NOT NULL DEFAULT '';
                ELSE
                    ALTER TABLE users_user ALTER COLUMN status_text SET DEFAULT '';
                END IF;
            END $$;
            """
        )


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0003_user_email_unique_nullable"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="user",
                    name="about",
                    field=models.TextField(blank=True, default=""),
                ),
                migrations.AddField(
                    model_name="user",
                    name="avatar",
                    field=models.TextField(blank=True, default=""),
                ),
                migrations.AddField(
                    model_name="user",
                    name="location",
                    field=models.CharField(blank=True, default="", max_length=255),
                ),
                migrations.AddField(
                    model_name="user",
                    name="phone",
                    field=models.CharField(blank=True, default="", max_length=50),
                ),
                migrations.AddField(
                    model_name="user",
                    name="status_text",
                    field=models.CharField(blank=True, default="", max_length=200),
                ),
            ],
            database_operations=[
                migrations.RunPython(_ensure_columns, migrations.RunPython.noop),
            ],
        ),
    ]
