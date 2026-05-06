import os
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0039_add_condition_id_to_consumable_condition_history'),
    ]

    operations = [
        migrations.RunSQL(
            sql=open(os.path.join(os.path.dirname(__file__), '0040_add_purchase_order_id_to_stock_item_and_consumable.sql')).read(),
            reverse_sql="""
                ALTER TABLE public.stock_item DROP CONSTRAINT IF EXISTS fk_stock_item_purchase_order;
                ALTER TABLE public.consumable DROP CONSTRAINT IF EXISTS fk_consumable_purchase_order;
                DROP INDEX IF EXISTS public.idx_stock_item_purchase_order_id;
                DROP INDEX IF EXISTS public.idx_consumable_purchase_order_id;
                ALTER TABLE public.stock_item DROP COLUMN IF EXISTS purchase_order_id;
                ALTER TABLE public.consumable DROP COLUMN IF EXISTS purchase_order_id;
            """,
        ),
    ]
