from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0009_remove_quantity_invoiced_from_purchase_order_lines"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE TABLE IF NOT EXISTS public.backorder_report_stock_item_model_line (
                backorder_report_id integer NOT NULL,
                stock_item_model_id integer NOT NULL,
                quantity_ordered integer NOT NULL,
                quantity_received integer NOT NULL,
                quantity_remaining integer NOT NULL,
                PRIMARY KEY (backorder_report_id, stock_item_model_id),
                CONSTRAINT fk_brsiml_backorder_report
                    FOREIGN KEY (backorder_report_id)
                    REFERENCES public.backorder_report (backorder_report_id)
                    ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_brsiml_backorder_report_id
                ON public.backorder_report_stock_item_model_line (backorder_report_id);

            CREATE TABLE IF NOT EXISTS public.backorder_report_consumable_model_line (
                backorder_report_id integer NOT NULL,
                consumable_model_id integer NOT NULL,
                quantity_ordered integer NOT NULL,
                quantity_received integer NOT NULL,
                quantity_remaining integer NOT NULL,
                PRIMARY KEY (backorder_report_id, consumable_model_id),
                CONSTRAINT fk_brcml_backorder_report
                    FOREIGN KEY (backorder_report_id)
                    REFERENCES public.backorder_report (backorder_report_id)
                    ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_brcml_backorder_report_id
                ON public.backorder_report_consumable_model_line (backorder_report_id);
            """,
            reverse_sql="""
            DROP TABLE IF EXISTS public.backorder_report_stock_item_model_line;
            DROP TABLE IF EXISTS public.backorder_report_consumable_model_line;
            """,
        ),
    ]
