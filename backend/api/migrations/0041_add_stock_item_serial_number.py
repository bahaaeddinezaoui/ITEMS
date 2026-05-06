import os
from django.db import migrations

SQL_PATH = os.path.join(os.path.dirname(__file__), '0041_add_stock_item_serial_number.sql')

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0040_add_purchase_order_id_to_stock_item_and_consumable'),
    ]

    operations = [
        migrations.RunSQL(
            sql=open(SQL_PATH).read(),
            reverse_sql="ALTER TABLE public.stock_item DROP COLUMN IF EXISTS stock_item_serial_number;",
        ),
    ]
