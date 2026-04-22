# Add maintenance_type, operation_type, maintenance_domain columns to typical step translation tables

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0029_add_maintenance_step_note'),
    ]

    operations = [
        migrations.AddField(
            model_name='externalmaintenancetypicalstep',
            name='operation_type',
            field=models.CharField(blank=True, db_column='operation_type', max_length=24, null=True),
        ),
        migrations.CreateModel(
            name='MaintenanceTypicalStepTranslation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(db_column='language_code', max_length=5)),
                ('description', models.CharField(db_column='description', max_length=256)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_column='created_at')),
                ('updated_at', models.DateTimeField(auto_now=True, db_column='updated_at')),
                ('maintenance_typical_step', models.ForeignKey(db_column='maintenance_typical_step_id', on_delete=models.deletion.CASCADE, to='api.maintenancetypicalstep')),
            ],
            options={
                'managed': False,
                'db_table': 'maintenance_typical_step_translation',
                'unique_together': {('maintenance_typical_step', 'language_code')},
            },
        ),
        migrations.CreateModel(
            name='ExternalMaintenanceTypicalStepTranslation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(db_column='language_code', max_length=5)),
                ('description', models.CharField(db_column='description', max_length=256)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_column='created_at')),
                ('updated_at', models.DateTimeField(auto_now=True, db_column='updated_at')),
                ('external_maintenance_typical_step', models.ForeignKey(db_column='external_maintenance_typical_step_id', on_delete=models.deletion.CASCADE, to='api.externalmaintenancetypicalstep')),
            ],
            options={
                'managed': False,
                'db_table': 'external_maintenance_typical_step_translation',
                'unique_together': {('external_maintenance_typical_step', 'language_code')},
            },
        ),
        migrations.AddField(
            model_name='maintenancetypicalsteptranslation',
            name='maintenance_type',
            field=models.CharField(blank=True, db_column='maintenance_type', max_length=8, null=True),
        ),
        migrations.AddField(
            model_name='maintenancetypicalsteptranslation',
            name='operation_type',
            field=models.CharField(blank=True, db_column='operation_type', max_length=24, null=True),
        ),
        migrations.AddField(
            model_name='maintenancetypicalsteptranslation',
            name='maintenance_domain',
            field=models.CharField(blank=True, db_column='maintenance_domain', max_length=24, null=True),
        ),
        migrations.AddField(
            model_name='externalmaintenancetypicalsteptranslation',
            name='maintenance_type',
            field=models.CharField(blank=True, db_column='maintenance_type', max_length=8, null=True),
        ),
        migrations.AddField(
            model_name='externalmaintenancetypicalsteptranslation',
            name='operation_type',
            field=models.CharField(blank=True, db_column='operation_type', max_length=24, null=True),
        ),
        migrations.AddField(
            model_name='externalmaintenancetypicalsteptranslation',
            name='maintenance_domain',
            field=models.CharField(blank=True, db_column='maintenance_domain', max_length=24, null=True),
        ),
    ]
