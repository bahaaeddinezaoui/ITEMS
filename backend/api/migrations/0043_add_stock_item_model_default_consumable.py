import os
from django.db import migrations

SQL_PATH = os.path.join(os.path.dirname(__file__), '0043_add_stock_item_model_default_consumable.sql')

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0042_move_admin_cert_name_to_model'),
    ]

    operations = [
        migrations.RunSQL(
            sql=open(SQL_PATH).read(),
            reverse_sql="DROP TABLE IF EXISTS stock_item_model_default_consumable;",
        ),
    ]
