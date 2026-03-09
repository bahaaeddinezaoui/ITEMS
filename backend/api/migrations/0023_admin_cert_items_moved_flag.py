from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0022_remaining_digital_copy_paths"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE public.administrative_certificate
                ADD COLUMN IF NOT EXISTS are_items_moved boolean NOT NULL DEFAULT false;
            """,
            reverse_sql="""
                ALTER TABLE public.administrative_certificate
                DROP COLUMN IF EXISTS are_items_moved;
            """,
        ),
    ]
