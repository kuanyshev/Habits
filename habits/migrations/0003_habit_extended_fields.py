from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("habits", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="habit",
            name="category_label",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="habit",
            name="start_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="habit",
            name="end_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="habit",
            name="xp",
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name="habit",
            name="xp_max",
            field=models.IntegerField(default=1000),
        ),
        migrations.AddField(
            model_name="habit",
            name="level",
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name="habit",
            name="status",
            field=models.CharField(default="Active", max_length=50),
        ),
    ]
