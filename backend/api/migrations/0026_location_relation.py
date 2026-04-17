# Generated migration for location_relation table

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0025_remove_brand_photos'),
    ]

    operations = [
        migrations.CreateModel(
            name='LocationRelation',
            fields=[
                ('child_location', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    primary_key=True,
                    related_name='child_relations',
                    serialize=False,
                    db_column='child_location_id',
                    to='api.location'
                )),
                ('parent_location', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='parent_relations',
                    db_column='parent_location_id',
                    to='api.location'
                )),
                ('relation_id', models.IntegerField(
                    blank=True,
                    null=True,
                    db_column='relation_id'
                )),
            ],
            options={
                'db_table': 'location_relation',
            },
        ),
    ]
