from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0020_managed_locations"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE public.receipt_report
                ALTER COLUMN digital_copy TYPE text
                USING NULL::text;

            ALTER TABLE public.administrative_certificate
                ALTER COLUMN digital_copy TYPE text
                USING NULL::text;
            """,
            reverse_sql="""
            ALTER TABLE public.receipt_report
                ALTER COLUMN digital_copy TYPE bytea
                USING NULL::bytea;

            ALTER TABLE public.administrative_certificate
                ALTER COLUMN digital_copy TYPE bytea
                USING NULL::bytea;
            """,
        ),
    ]
