from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="MaintenanceStepAttributeChange",
            fields=[
                (
                    "maintenance_step_attribute_change_id",
                    models.BigAutoField(
                        primary_key=True,
                        serialize=False,
                        db_column="maintenance_step_attribute_change_id",
                    ),
                ),
                (
                    "target_type",
                    models.CharField(max_length=20, db_column="target_type"),
                ),
                (
                    "target_id",
                    models.IntegerField(blank=True, null=True, db_column="target_id"),
                ),
                (
                    "attribute_definition_id",
                    models.IntegerField(db_column="attribute_definition_id"),
                ),
                (
                    "value_string",
                    models.CharField(max_length=1024, blank=True, null=True, db_column="value_string"),
                ),
                (
                    "value_bool",
                    models.BooleanField(blank=True, null=True, db_column="value_bool"),
                ),
                (
                    "value_date",
                    models.DateField(blank=True, null=True, db_column="value_date"),
                ),
                (
                    "value_number",
                    models.DecimalField(
                        max_digits=18,
                        decimal_places=6,
                        blank=True,
                        null=True,
                        db_column="value_number",
                    ),
                ),
                (
                    "created_at_datetime",
                    models.DateTimeField(auto_now_add=True, db_column="created_at_datetime"),
                ),
                (
                    "created_by_user_id",
                    models.IntegerField(blank=True, null=True, db_column="created_by_user_id"),
                ),
                (
                    "applied_at_datetime",
                    models.DateTimeField(blank=True, null=True, db_column="applied_at_datetime"),
                ),
                (
                    "maintenance_step",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="attribute_changes",
                        db_column="maintenance_step_id",
                        to="api.maintenancestep",
                    ),
                ),
            ],
            options={
                "db_table": "maintenance_step_attribute_change",
            },
        ),
    ]
