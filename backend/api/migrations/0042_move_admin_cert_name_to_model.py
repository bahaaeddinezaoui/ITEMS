import os
from django.db import migrations

SQL_PATH = os.path.join(os.path.dirname(__file__), '0042_move_admin_cert_name_to_model.sql')

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0041_add_stock_item_serial_number'),
    ]

    operations = [
        migrations.RunSQL(
            sql=open(SQL_PATH).read(),
            reverse_sql="""
                -- Reverse: Add columns back to item tables
                ALTER TABLE asset ADD COLUMN IF NOT EXISTS asset_name_in_administrative_certificate VARCHAR(48);
                ALTER TABLE stock_item ADD COLUMN IF NOT EXISTS stock_item_name_in_administrative_certificate VARCHAR(48);
                ALTER TABLE consumable ADD COLUMN IF NOT EXISTS consumable_name_in_administrative_certificate VARCHAR(48);
                ALTER TABLE asset_translation ADD COLUMN IF NOT EXISTS asset_name_in_the_administrative_certificate VARCHAR(48);
                ALTER TABLE stock_item_translation ADD COLUMN IF NOT EXISTS stock_item_name_in_administrative_certificate VARCHAR(48);
                ALTER TABLE consumable_translation ADD COLUMN IF NOT EXISTS consumable_name_in_administrative_certificate VARCHAR(48);
                -- Remove columns from model tables
                ALTER TABLE asset_model DROP COLUMN IF EXISTS asset_model_name_in_administrative_certificate;
                ALTER TABLE stock_item_model DROP COLUMN IF EXISTS stock_item_model_name_in_administrative_certificate;
                ALTER TABLE consumable_model DROP COLUMN IF EXISTS consumable_model_name_in_administrative_certificate;
                ALTER TABLE asset_model_translation DROP COLUMN IF EXISTS asset_model_name_in_administrative_certificate;
                ALTER TABLE stock_item_model_translation DROP COLUMN IF EXISTS stock_item_model_name_in_administrative_certificate;
                ALTER TABLE consumable_model_translation DROP COLUMN IF EXISTS consumable_model_name_in_administrative_certificate;
            """,
        ),
    ]
