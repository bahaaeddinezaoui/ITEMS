from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_attribution_order_accessories_state"),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                """
                CREATE TABLE IF NOT EXISTS public.person_reports_problem_on_asset_included_context (
                    report_id INTEGER PRIMARY KEY REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE,
                    destination_room_id INTEGER NOT NULL REFERENCES public.room(room_id)
                );
                """,
                """
                CREATE TABLE IF NOT EXISTS public.person_reports_problem_on_asset_included_stock_item (
                    report_id INTEGER NOT NULL REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE,
                    stock_item_id INTEGER NOT NULL REFERENCES public.stock_item(stock_item_id),
                    PRIMARY KEY (report_id, stock_item_id)
                );
                """,
                """
                CREATE TABLE IF NOT EXISTS public.person_reports_problem_on_asset_included_consumable (
                    report_id INTEGER NOT NULL REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE,
                    consumable_id INTEGER NOT NULL REFERENCES public.consumable(consumable_id),
                    PRIMARY KEY (report_id, consumable_id)
                );
                """,
            ],
            reverse_sql=[
                "DROP TABLE IF EXISTS public.person_reports_problem_on_asset_included_consumable;",
                "DROP TABLE IF EXISTS public.person_reports_problem_on_asset_included_stock_item;",
                "DROP TABLE IF EXISTS public.person_reports_problem_on_asset_included_context;",
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.CreateModel(
                    name="PersonReportsProblemOnAssetIncludedContext",
                    fields=[
                        (
                            "report",
                            models.OneToOneField(
                                db_column="report_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                primary_key=True,
                                related_name="included_context",
                                serialize=False,
                                to="api.personreportsproblemonasset",
                            ),
                        ),
                        (
                            "destination_room",
                            models.ForeignKey(
                                db_column="destination_room_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="problem_report_included_context",
                                to="api.room",
                            ),
                        ),
                    ],
                    options={
                        "db_table": "person_reports_problem_on_asset_included_context",
                        "managed": False,
                    },
                ),
                migrations.CreateModel(
                    name="PersonReportsProblemOnAssetIncludedStockItem",
                    fields=[
                        (
                            "report",
                            models.ForeignKey(
                                db_column="report_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="included_stock_items",
                                to="api.personreportsproblemonasset",
                            ),
                        ),
                        (
                            "stock_item",
                            models.ForeignKey(
                                db_column="stock_item_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="included_in_asset_problem_reports",
                                to="api.stockitem",
                            ),
                        ),
                    ],
                    options={
                        "db_table": "person_reports_problem_on_asset_included_stock_item",
                        "managed": False,
                        "unique_together": {("report", "stock_item")},
                    },
                ),
                migrations.CreateModel(
                    name="PersonReportsProblemOnAssetIncludedConsumable",
                    fields=[
                        (
                            "report",
                            models.ForeignKey(
                                db_column="report_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="included_consumables",
                                to="api.personreportsproblemonasset",
                            ),
                        ),
                        (
                            "consumable",
                            models.ForeignKey(
                                db_column="consumable_id",
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name="included_in_asset_problem_reports",
                                to="api.consumable",
                            ),
                        ),
                    ],
                    options={
                        "db_table": "person_reports_problem_on_asset_included_consumable",
                        "managed": False,
                        "unique_together": {("report", "consumable")},
                    },
                ),
            ],
        ),
    ]
