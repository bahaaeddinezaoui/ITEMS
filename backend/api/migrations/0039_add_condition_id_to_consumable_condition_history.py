# Add condition_id FK to consumable_condition_history table

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0038_add_maintenance_step_status_lookup'),
    ]

    operations = [
        migrations.AddField(
            model_name='consumableconditionhistory',
            name='condition',
            field=models.ForeignKey(
                db_column='condition_id',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='+',
                to='api.physicalcondition',
            ),
            preserve_default=False,
        ),
    ]
