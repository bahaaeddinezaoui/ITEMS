from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0012_rename_facture_to_invoice"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE public.invoice
                ALTER COLUMN digital_copy TYPE text
                USING NULL::text;
            """,
            reverse_sql="""
            ALTER TABLE public.invoice
                ALTER COLUMN digital_copy TYPE bytea
                USING NULL::bytea;
            """,
        ),
    ]
