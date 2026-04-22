# Generated migration for brand i18n translation tables

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    """
    Migration to add per-entity translation tables for brand i18n support.
    """

    dependencies = [
        ('api', '0027_merge_20260420_1028'),
    ]

    operations = [
        migrations.CreateModel(
            name='AssetBrandTranslation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(max_length=5, choices=[('en', 'English'), ('ar', 'Arabic')], db_column='language_code')),
                ('brand_name', models.CharField(max_length=48, db_column='brand_name')),
                ('created_at', models.DateTimeField(auto_now_add=True, db_column='created_at')),
                ('updated_at', models.DateTimeField(auto_now=True, db_column='updated_at')),
                ('asset_brand', models.ForeignKey(db_column='asset_brand_id', on_delete=django.db.models.deletion.CASCADE, to='api.assetbrand')),
            ],
            options={
                'db_table': 'asset_brand_translation',
                'managed': False,
            },
        ),

        migrations.CreateModel(
            name='StockItemBrandTranslation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(max_length=5, choices=[('en', 'English'), ('ar', 'Arabic')], db_column='language_code')),
                ('brand_name', models.CharField(max_length=48, db_column='brand_name')),
                ('created_at', models.DateTimeField(auto_now_add=True, db_column='created_at')),
                ('updated_at', models.DateTimeField(auto_now=True, db_column='updated_at')),
                ('stock_item_brand', models.ForeignKey(db_column='stock_item_brand_id', on_delete=django.db.models.deletion.CASCADE, to='api.stockitembrand')),
            ],
            options={
                'db_table': 'stock_item_brand_translation',
                'managed': False,
            },
        ),

        migrations.CreateModel(
            name='ConsumableBrandTranslation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(max_length=5, choices=[('en', 'English'), ('ar', 'Arabic')], db_column='language_code')),
                ('brand_name', models.CharField(max_length=48, db_column='brand_name')),
                ('created_at', models.DateTimeField(auto_now_add=True, db_column='created_at')),
                ('updated_at', models.DateTimeField(auto_now=True, db_column='updated_at')),
                ('consumable_brand', models.ForeignKey(db_column='consumable_brand_id', on_delete=django.db.models.deletion.CASCADE, to='api.consumablebrand')),
            ],
            options={
                'db_table': 'consumable_brand_translation',
                'managed': False,
            },
        ),
    ]
