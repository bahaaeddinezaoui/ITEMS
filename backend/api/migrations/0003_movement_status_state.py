from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_add_movement_status"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AddField(
                    model_name="assetmovement",
                    name="status",
                    field=models.CharField(db_column="status", default="pending", max_length=24),
                ),
                migrations.AddField(
                    model_name="stockitemmovement",
                    name="status",
                    field=models.CharField(db_column="status", default="pending", max_length=24),
                ),
                migrations.AddField(
                    model_name="consumablemovement",
                    name="status",
                    field=models.CharField(db_column="status", default="pending", max_length=24),
                ),
            ],
        ),
    ]
