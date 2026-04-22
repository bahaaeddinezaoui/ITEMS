# Add note column to maintenance_step table

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_add_brand_translation_tables'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE public.maintenance_step ADD COLUMN note varchar(1024) NULL;",
            reverse_sql="ALTER TABLE public.maintenance_step DROP COLUMN note;",
        ),
    ]
