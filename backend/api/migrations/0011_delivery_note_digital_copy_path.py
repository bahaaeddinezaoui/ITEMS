from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0010_add_backorder_report_remaining_snapshots"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE public.delivery_note
                ALTER COLUMN digital_copy TYPE text
                USING NULL::text;
            """,
            reverse_sql="""
            ALTER TABLE public.delivery_note
                ALTER COLUMN digital_copy TYPE bytea
                USING NULL::bytea;
            """,
        ),
    ]
