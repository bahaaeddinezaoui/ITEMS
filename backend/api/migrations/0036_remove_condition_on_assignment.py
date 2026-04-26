from django.db import migrations, connection


def forward(apps, schema_editor):
    with connection.cursor() as cursor:
        cursor.execute(
            "ALTER TABLE asset_is_assigned_to_person DROP COLUMN IF EXISTS condition_on_assignment"
        )
        cursor.execute(
            "ALTER TABLE stock_item_is_assigned_to_person DROP COLUMN IF EXISTS condition_on_assignment"
        )
        cursor.execute(
            "ALTER TABLE consumable_is_assigned_to_person DROP COLUMN IF EXISTS condition_on_assignment"
        )


def reverse(apps, schema_editor):
    with connection.cursor() as cursor:
        cursor.execute(
            "ALTER TABLE asset_is_assigned_to_person ADD COLUMN IF NOT EXISTS condition_on_assignment varchar(48)"
        )
        cursor.execute(
            "ALTER TABLE stock_item_is_assigned_to_person ADD COLUMN IF NOT EXISTS condition_on_assignment varchar(48)"
        )
        cursor.execute(
            "ALTER TABLE consumable_is_assigned_to_person ADD COLUMN IF NOT EXISTS condition_on_assignment varchar(48)"
        )


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0035_add_user_account_is_approved_and_person_assignment'),
    ]

    operations = [
        migrations.RunPython(forward, reverse),
    ]
