import os
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0030_add_typical_step_translation_fields'),
    ]

    operations = [
        migrations.RunSQL(
            sql=open(os.path.join(os.path.dirname(__file__), '0031_add_maintenance_id_to_movements.sql')).read(),
            reverse_sql="""
                ALTER TABLE public.asset_movement DROP CONSTRAINT IF EXISTS fk_asset_movement_maintenance;
                ALTER TABLE public.stock_item_movement DROP CONSTRAINT IF EXISTS fk_stock_item_movement_maintenance;
                ALTER TABLE public.consumable_movement DROP CONSTRAINT IF EXISTS fk_consumable_movement_maintenance;
                DROP INDEX IF EXISTS public.idx_asset_movement_maintenance_id;
                DROP INDEX IF EXISTS public.idx_stock_item_movement_maintenance_id;
                DROP INDEX IF EXISTS public.idx_consumable_movement_maintenance_id;
                ALTER TABLE public.asset_movement DROP COLUMN IF EXISTS maintenance_id;
                ALTER TABLE public.stock_item_movement DROP COLUMN IF EXISTS maintenance_id;
                ALTER TABLE public.consumable_movement DROP COLUMN IF EXISTS maintenance_id;
            """,
        ),
    ]
