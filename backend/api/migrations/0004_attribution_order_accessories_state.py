from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_movement_status_state"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.CreateModel(
                    name="AttributionOrderAssetStockItemAccessory",
                    fields=[
                        ("id", models.AutoField(db_column="id", primary_key=True, serialize=False)),
                        (
                            "attribution_order",
                            models.ForeignKey(
                                db_column="attribution_order_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="stock_item_accessories",
                                to="api.attributionorder",
                            ),
                        ),
                        (
                            "asset",
                            models.ForeignKey(
                                db_column="asset_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="stock_item_accessories",
                                to="api.asset",
                            ),
                        ),
                        (
                            "stock_item",
                            models.ForeignKey(
                                db_column="stock_item_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="attribution_order_accessories",
                                to="api.stockitem",
                            ),
                        ),
                    ],
                    options={
                        "db_table": "attribution_order_asset_stock_item_accessory",
                        "managed": False,
                    },
                ),
                migrations.CreateModel(
                    name="AttributionOrderAssetConsumableAccessory",
                    fields=[
                        ("id", models.AutoField(db_column="id", primary_key=True, serialize=False)),
                        (
                            "attribution_order",
                            models.ForeignKey(
                                db_column="attribution_order_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="consumable_accessories",
                                to="api.attributionorder",
                            ),
                        ),
                        (
                            "asset",
                            models.ForeignKey(
                                db_column="asset_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="consumable_accessories",
                                to="api.asset",
                            ),
                        ),
                        (
                            "consumable",
                            models.ForeignKey(
                                db_column="consumable_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="attribution_order_accessories",
                                to="api.consumable",
                            ),
                        ),
                    ],
                    options={
                        "db_table": "attribution_order_asset_consumable_accessory",
                        "managed": False,
                    },
                ),
            ],
        ),
    ]
