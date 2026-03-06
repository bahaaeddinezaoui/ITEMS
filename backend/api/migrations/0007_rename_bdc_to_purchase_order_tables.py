from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0006_problem_report_included_items_add_id"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE IF EXISTS public.stock_item_model_is_found_in_bdc
                RENAME TO stock_item_model_is_found_in_purchase_order;

            COMMENT ON TABLE public.stock_item_model_is_found_in_purchase_order IS
                'Renamed from stock_item_model_is_found_in_bdc (bdc = bon_de_commande)';

            ALTER TABLE IF EXISTS public.consumable_model_is_found_in_bdc
                RENAME TO consumable_model_is_found_in_purchase_order;

            COMMENT ON TABLE public.consumable_model_is_found_in_purchase_order IS
                'Renamed from consumable_model_is_found_in_bdc (bdc = bon_de_commande)';
            """,
            reverse_sql="""
            ALTER TABLE IF EXISTS public.stock_item_model_is_found_in_purchase_order
                RENAME TO stock_item_model_is_found_in_bdc;

            COMMENT ON TABLE public.stock_item_model_is_found_in_bdc IS
                'Renamed from stock_item_model_is_found_in_purchase_order';

            ALTER TABLE IF EXISTS public.consumable_model_is_found_in_purchase_order
                RENAME TO consumable_model_is_found_in_bdc;

            COMMENT ON TABLE public.consumable_model_is_found_in_bdc IS
                'Renamed from consumable_model_is_found_in_purchase_order';
            """,
        ),
    ]
