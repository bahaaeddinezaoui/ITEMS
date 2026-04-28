# Add maintenance_step_status lookup table, its translation table,
# and status_id FK on maintenance_step

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0037_remove_condition_on_assignment_state'),
    ]

    operations = [
        # Create the lookup table model
        migrations.CreateModel(
            name='MaintenanceStepStatus',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(db_column='code', max_length=60, unique=True)),
                ('sort_order', models.IntegerField(db_column='sort_order', default=0)),
            ],
            options={
                'db_table': 'maintenance_step_status',
                'managed': False,
            },
        ),

        # Create the translation table model
        migrations.CreateModel(
            name='MaintenanceStepStatusTranslation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(db_column='language_code', max_length=5)),
                ('maintenance_step_status_label', models.CharField(db_column='maintenance_step_status_label', max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_column='created_at')),
                ('updated_at', models.DateTimeField(auto_now=True, db_column='updated_at')),
                ('maintenance_step_status', models.ForeignKey(
                    db_column='maintenance_step_status_id',
                    on_delete=django.db.models.deletion.CASCADE,
                    to='api.maintenancestepstatus',
                )),
            ],
            options={
                'db_table': 'maintenance_step_status_translation',
                'managed': False,
                'unique_together': {('maintenance_step_status', 'language_code')},
            },
        ),

        # Add status_id FK to maintenance_step
        migrations.AddField(
            model_name='maintenancestep',
            name='status',
            field=models.ForeignKey(
                blank=True,
                db_column='status_id',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='steps',
                to='api.maintenancestepstatus',
            ),
        ),
    ]
