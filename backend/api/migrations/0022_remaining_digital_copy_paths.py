from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0021_admin_cert_and_receipt_report_digital_copy_path"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE public.maintenance
                ALTER COLUMN digital_copy TYPE text
                USING NULL::text;

            ALTER TABLE public.external_maintenance_document
                ALTER COLUMN digital_copy TYPE text
                USING NULL::text;

            ALTER TABLE public.company_asset_request
                ALTER COLUMN digital_copy TYPE text
                USING NULL::text;
            """,
            reverse_sql="""
            ALTER TABLE public.maintenance
                ALTER COLUMN digital_copy TYPE bytea
                USING NULL::bytea;

            ALTER TABLE public.external_maintenance_document
                ALTER COLUMN digital_copy TYPE bytea
                USING NULL::bytea;

            ALTER TABLE public.company_asset_request
                ALTER COLUMN digital_copy TYPE bytea
                USING NULL::bytea;
            """,
        ),
    ]
