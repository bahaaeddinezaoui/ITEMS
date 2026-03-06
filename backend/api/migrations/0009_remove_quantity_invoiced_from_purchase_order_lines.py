from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0008_rename_french_order_tables"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE IF EXISTS public.stock_item_model_is_found_in_purchase_order
                DROP COLUMN IF EXISTS quantity_invoiced;

            ALTER TABLE IF EXISTS public.consumable_model_is_found_in_purchase_order
                DROP COLUMN IF EXISTS quantity_invoiced;
            """,
            reverse_sql="""
            ALTER TABLE IF EXISTS public.stock_item_model_is_found_in_purchase_order
                ADD COLUMN IF NOT EXISTS quantity_invoiced integer;

            ALTER TABLE IF EXISTS public.consumable_model_is_found_in_purchase_order
                ADD COLUMN IF NOT EXISTS quantity_invoiced integer;
            """,
        ),
    ]
