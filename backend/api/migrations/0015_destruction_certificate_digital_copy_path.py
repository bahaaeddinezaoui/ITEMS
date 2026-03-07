from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0014_add_acceptance_report_table"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE public.destruction_certificate
                ALTER COLUMN digital_copy TYPE text
                USING NULL::text;
            """,
            reverse_sql="""
            ALTER TABLE public.destruction_certificate
                ALTER COLUMN digital_copy TYPE bytea
                USING NULL::bytea;
            """,
        ),
    ]
