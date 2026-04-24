from django.db import migrations, connection


def forward(apps, schema_editor):
    with connection.cursor() as cursor:
        # Add is_approved column to user_account
        cursor.execute(
            "ALTER TABLE user_account ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT FALSE"
        )

        # Create person_assignment table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS person_assignment (
                assignment_id serial NOT NULL PRIMARY KEY,
                position_id int NOT NULL REFERENCES position(position_id),
                person_id int NOT NULL REFERENCES person(person_id),
                assignment_start_date date,
                assignment_end_date date,
                employment_type varchar(48)
            )
        """)


def reverse(apps, schema_editor):
    with connection.cursor() as cursor:
        cursor.execute("ALTER TABLE user_account DROP COLUMN IF EXISTS is_approved")
        cursor.execute("DROP TABLE IF EXISTS person_assignment")


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0034_fix_asset_incident_report_translation'),
    ]

    operations = [
        migrations.RunPython(forward, reverse),
    ]
