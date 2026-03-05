from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0005_problem_report_included_items"),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                # Stock item link table
                """
                ALTER TABLE public.person_reports_problem_on_asset_included_stock_item
                    ADD COLUMN IF NOT EXISTS id SERIAL;

                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_stock_item_pkey'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_stock_item
                            DROP CONSTRAINT person_reports_problem_on_asset_included_stock_item_pkey;
                    END IF;
                END $$;

                DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_stock_item_pkey'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_stock_item
                            ADD CONSTRAINT person_reports_problem_on_asset_included_stock_item_pkey PRIMARY KEY (id);
                    END IF;
                END $$;

                DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_stock_item_report_stock_item_uniq'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_stock_item
                            ADD CONSTRAINT person_reports_problem_on_asset_included_stock_item_report_stock_item_uniq
                            UNIQUE (report_id, stock_item_id);
                    END IF;
                END $$;
                """,
                # Consumable link table
                """
                ALTER TABLE public.person_reports_problem_on_asset_included_consumable
                    ADD COLUMN IF NOT EXISTS id SERIAL;

                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_consumable_pkey'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_consumable
                            DROP CONSTRAINT person_reports_problem_on_asset_included_consumable_pkey;
                    END IF;
                END $$;

                DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_consumable_pkey'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_consumable
                            ADD CONSTRAINT person_reports_problem_on_asset_included_consumable_pkey PRIMARY KEY (id);
                    END IF;
                END $$;

                DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_consumable_report_consumable_uniq'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_consumable
                            ADD CONSTRAINT person_reports_problem_on_asset_included_consumable_report_consumable_uniq
                            UNIQUE (report_id, consumable_id);
                    END IF;
                END $$;
                """,
            ],
            reverse_sql=[
                """
                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_stock_item_report_stock_item_uniq'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_stock_item
                            DROP CONSTRAINT person_reports_problem_on_asset_included_stock_item_report_stock_item_uniq;
                    END IF;
                END $$;

                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_stock_item_pkey'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_stock_item
                            DROP CONSTRAINT person_reports_problem_on_asset_included_stock_item_pkey;
                    END IF;
                END $$;

                ALTER TABLE public.person_reports_problem_on_asset_included_stock_item
                    DROP COLUMN IF EXISTS id;

                DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_stock_item_pkey'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_stock_item
                            ADD CONSTRAINT person_reports_problem_on_asset_included_stock_item_pkey
                            PRIMARY KEY (report_id, stock_item_id);
                    END IF;
                END $$;
                """,
                """
                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_consumable_report_consumable_uniq'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_consumable
                            DROP CONSTRAINT person_reports_problem_on_asset_included_consumable_report_consumable_uniq;
                    END IF;
                END $$;

                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_consumable_pkey'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_consumable
                            DROP CONSTRAINT person_reports_problem_on_asset_included_consumable_pkey;
                    END IF;
                END $$;

                ALTER TABLE public.person_reports_problem_on_asset_included_consumable
                    DROP COLUMN IF EXISTS id;

                DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'person_reports_problem_on_asset_included_consumable_pkey'
                    ) THEN
                        ALTER TABLE public.person_reports_problem_on_asset_included_consumable
                            ADD CONSTRAINT person_reports_problem_on_asset_included_consumable_pkey
                            PRIMARY KEY (report_id, consumable_id);
                    END IF;
                END $$;
                """,
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AddField(
                    model_name="personreportsproblemonassetincludedstockitem",
                    name="id",
                    field=models.AutoField(db_column="id", primary_key=True, serialize=False),
                ),
                migrations.AddField(
                    model_name="personreportsproblemonassetincludedconsumable",
                    name="id",
                    field=models.AutoField(db_column="id", primary_key=True, serialize=False),
                ),
            ],
        ),
    ]
