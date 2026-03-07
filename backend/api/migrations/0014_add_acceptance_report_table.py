from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0013_invoice_digital_copy_path"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE TABLE IF NOT EXISTS public.acceptance_report (
                acceptance_report_id integer NOT NULL,
                delivery_note_id integer NOT NULL,
                acceptance_report_datetime timestamp without time zone,
                is_signed_by_director_of_administration_and_support boolean,
                is_signed_by_protection_and_security_bureau_chief boolean,
                is_signed_by_information_technilogy_bureau_chief boolean,
                acceptance_report_is_stock_item_and_consumable_responsible boolean,
                is_signed_by_school_headquarter boolean,
                digital_copy text,
                CONSTRAINT acceptance_report_pkey PRIMARY KEY (acceptance_report_id),
                CONSTRAINT acceptance_report_delivery_note_id_key UNIQUE (delivery_note_id),
                CONSTRAINT fk_acceptance_report_delivery_note FOREIGN KEY (delivery_note_id)
                    REFERENCES public.delivery_note (delivery_note_id)
                    ON UPDATE RESTRICT
                    ON DELETE RESTRICT
            );
            """,
            reverse_sql="""
            DROP TABLE IF EXISTS public.acceptance_report;
            """,
        )
    ]
