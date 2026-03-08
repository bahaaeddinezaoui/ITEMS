from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0016_destructioncertificate"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
                    DO $$
                    BEGIN
                        -- Rename the existing destruction_certificate table to be stock/consumable-specific
                        IF EXISTS (
                            SELECT 1 FROM information_schema.tables
                            WHERE table_schema = 'public' AND table_name = 'destruction_certificate'
                        ) THEN
                            ALTER TABLE public.destruction_certificate RENAME TO stock_item_consumable_destruction_certificate;
                        END IF;

                        -- Rename PK constraint if present
                        IF EXISTS (
                            SELECT 1 FROM pg_constraint
                            WHERE conname = 'destruction_certificate_pkey'
                        ) THEN
                            ALTER TABLE public.stock_item_consumable_destruction_certificate
                                RENAME CONSTRAINT destruction_certificate_pkey TO stock_item_consumable_destruction_certificate_pkey;
                        END IF;

                        -- Rename FK columns on stock_item and consumable
                        IF EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_schema='public' AND table_name='stock_item' AND column_name='destruction_certificate_id'
                        ) THEN
                            ALTER TABLE public.stock_item
                                RENAME COLUMN destruction_certificate_id TO stock_item_consumable_destruction_certificate_id;
                        END IF;

                        IF EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_schema='public' AND table_name='consumable' AND column_name='destruction_certificate_id'
                        ) THEN
                            ALTER TABLE public.consumable
                                RENAME COLUMN destruction_certificate_id TO stock_item_consumable_destruction_certificate_id;
                        END IF;

                        -- Drop old stock/consumable FK constraints (names from dump)
                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_stock_it_stock_ite_destruct') THEN
                            ALTER TABLE public.stock_item DROP CONSTRAINT fk_stock_it_stock_ite_destruct;
                        END IF;
                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_consumab_consumabl_destruct') THEN
                            ALTER TABLE public.consumable DROP CONSTRAINT fk_consumab_consumabl_destruct;
                        END IF;

                        -- Recreate stock/consumable FK constraints against renamed table
                        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_stock_item_stock_item_consumable_destruction_certificate') THEN
                            ALTER TABLE public.stock_item
                                ADD CONSTRAINT fk_stock_item_stock_item_consumable_destruction_certificate
                                FOREIGN KEY (stock_item_consumable_destruction_certificate_id)
                                REFERENCES public.stock_item_consumable_destruction_certificate(destruction_certificate_id)
                                ON UPDATE RESTRICT ON DELETE RESTRICT;
                        END IF;

                        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_consumable_stock_item_consumable_destruction_certificate') THEN
                            ALTER TABLE public.consumable
                                ADD CONSTRAINT fk_consumable_stock_item_consumable_destruction_certificate
                                FOREIGN KEY (stock_item_consumable_destruction_certificate_id)
                                REFERENCES public.stock_item_consumable_destruction_certificate(destruction_certificate_id)
                                ON UPDATE RESTRICT ON DELETE RESTRICT;
                        END IF;

                        -- Assets: create separate table and remap asset FK
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.tables
                            WHERE table_schema = 'public' AND table_name = 'asset_destruction_certificate'
                        ) THEN
                            CREATE TABLE public.asset_destruction_certificate (
                                asset_destruction_certificate_id integer NOT NULL,
                                digital_copy text,
                                destruction_datetime timestamp without time zone
                            );
                            ALTER TABLE public.asset_destruction_certificate
                                ADD CONSTRAINT asset_destruction_certificate_pkey PRIMARY KEY (asset_destruction_certificate_id);
                        END IF;

                        -- Ensure asset table has the column (already exists in current schema, but keep defensive)
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_schema='public' AND table_name='asset' AND column_name='destruction_certificate_id'
                        ) THEN
                            ALTER TABLE public.asset ADD COLUMN destruction_certificate_id integer;
                        END IF;

                        -- Drop existing asset FK to the stock/consumable destruction certificate if present
                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_asset_asset_is__destruct') THEN
                            ALTER TABLE public.asset DROP CONSTRAINT fk_asset_asset_is__destruct;
                        END IF;

                        -- Backfill asset destruction certificates for existing asset.destruction_certificate_id values.
                        -- This is necessary before adding the new FK constraint, because existing data may reference
                        -- the old (now renamed) stock/consumable destruction certificate IDs.
                        IF EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_schema='public' AND table_name='asset' AND column_name='destruction_certificate_id'
                        ) THEN
                            INSERT INTO public.asset_destruction_certificate (
                                asset_destruction_certificate_id,
                                digital_copy,
                                destruction_datetime
                            )
                            SELECT DISTINCT ON (a.destruction_certificate_id)
                                a.destruction_certificate_id,
                                sic.digital_copy,
                                sic.destruction_datetime
                            FROM public.asset a
                            LEFT JOIN public.stock_item_consumable_destruction_certificate sic
                                ON sic.destruction_certificate_id = a.destruction_certificate_id
                            WHERE a.destruction_certificate_id IS NOT NULL
                                AND NOT EXISTS (
                                    SELECT 1 FROM public.asset_destruction_certificate adc
                                    WHERE adc.asset_destruction_certificate_id = a.destruction_certificate_id
                                )
                            ORDER BY a.destruction_certificate_id;
                        END IF;

                        -- Add asset FK to new asset_destruction_certificate table
                        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_asset_asset_destruction_certificate') THEN
                            ALTER TABLE public.asset
                                ADD CONSTRAINT fk_asset_asset_destruction_certificate
                                FOREIGN KEY (destruction_certificate_id)
                                REFERENCES public.asset_destruction_certificate(asset_destruction_certificate_id)
                                ON UPDATE RESTRICT ON DELETE RESTRICT;
                        END IF;

                        -- Track which external maintenance set asset status to failed
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.tables
                            WHERE table_schema = 'public' AND table_name = 'asset_failed_external_maintenance'
                        ) THEN
                            CREATE TABLE public.asset_failed_external_maintenance (
                                asset_id integer NOT NULL,
                                external_maintenance_id integer NOT NULL,
                                failed_datetime timestamp without time zone,
                                CONSTRAINT asset_failed_external_maintenance_pkey PRIMARY KEY (asset_id)
                            );
                            ALTER TABLE public.asset_failed_external_maintenance
                                ADD CONSTRAINT fk_afem_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
                            ALTER TABLE public.asset_failed_external_maintenance
                                ADD CONSTRAINT fk_afem_external_maintenance FOREIGN KEY (external_maintenance_id) REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
                        END IF;

                        -- Certificate/asset join table that captures external maintenance per asset
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.tables
                            WHERE table_schema = 'public' AND table_name = 'asset_destruction_certificate_asset'
                        ) THEN
                            CREATE TABLE public.asset_destruction_certificate_asset (
                                id serial PRIMARY KEY,
                                asset_destruction_certificate_id integer NOT NULL,
                                asset_id integer NOT NULL,
                                external_maintenance_id integer NOT NULL
                            );
                            ALTER TABLE public.asset_destruction_certificate_asset
                                ADD CONSTRAINT fk_adca_cert FOREIGN KEY (asset_destruction_certificate_id)
                                REFERENCES public.asset_destruction_certificate(asset_destruction_certificate_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
                            ALTER TABLE public.asset_destruction_certificate_asset
                                ADD CONSTRAINT fk_adca_asset FOREIGN KEY (asset_id) REFERENCES public.asset(asset_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
                            ALTER TABLE public.asset_destruction_certificate_asset
                                ADD CONSTRAINT fk_adca_external_maintenance FOREIGN KEY (external_maintenance_id)
                                REFERENCES public.external_maintenance(external_maintenance_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
                            ALTER TABLE public.asset_destruction_certificate_asset
                                ADD CONSTRAINT uq_adca_asset UNIQUE (asset_id);
                        END IF;

                    END $$;
                    """,
                    reverse_sql="""
                    DO $$
                    BEGIN
                        -- Best-effort reverse (does not restore original constraint names)

                        IF EXISTS (
                            SELECT 1 FROM information_schema.tables
                            WHERE table_schema = 'public' AND table_name = 'asset_destruction_certificate_asset'
                        ) THEN
                            DROP TABLE public.asset_destruction_certificate_asset;
                        END IF;

                        IF EXISTS (
                            SELECT 1 FROM information_schema.tables
                            WHERE table_schema = 'public' AND table_name = 'asset_failed_external_maintenance'
                        ) THEN
                            DROP TABLE public.asset_failed_external_maintenance;
                        END IF;

                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_asset_asset_destruction_certificate') THEN
                            ALTER TABLE public.asset DROP CONSTRAINT fk_asset_asset_destruction_certificate;
                        END IF;

                        IF EXISTS (
                            SELECT 1 FROM information_schema.tables
                            WHERE table_schema = 'public' AND table_name = 'asset_destruction_certificate'
                        ) THEN
                            DROP TABLE public.asset_destruction_certificate;
                        END IF;

                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_stock_item_stock_item_consumable_destruction_certificate') THEN
                            ALTER TABLE public.stock_item DROP CONSTRAINT fk_stock_item_stock_item_consumable_destruction_certificate;
                        END IF;
                        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_consumable_stock_item_consumable_destruction_certificate') THEN
                            ALTER TABLE public.consumable DROP CONSTRAINT fk_consumable_stock_item_consumable_destruction_certificate;
                        END IF;

                        IF EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_schema='public' AND table_name='stock_item' AND column_name='stock_item_consumable_destruction_certificate_id'
                        ) THEN
                            ALTER TABLE public.stock_item
                                RENAME COLUMN stock_item_consumable_destruction_certificate_id TO destruction_certificate_id;
                        END IF;

                        IF EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_schema='public' AND table_name='consumable' AND column_name='stock_item_consumable_destruction_certificate_id'
                        ) THEN
                            ALTER TABLE public.consumable
                                RENAME COLUMN stock_item_consumable_destruction_certificate_id TO destruction_certificate_id;
                        END IF;

                        IF EXISTS (
                            SELECT 1 FROM information_schema.tables
                            WHERE table_schema = 'public' AND table_name = 'stock_item_consumable_destruction_certificate'
                        ) THEN
                            -- Rename PK constraint back if present
                            IF EXISTS (
                                SELECT 1 FROM pg_constraint
                                WHERE conname = 'stock_item_consumable_destruction_certificate_pkey'
                            ) THEN
                                ALTER TABLE public.stock_item_consumable_destruction_certificate
                                    RENAME CONSTRAINT stock_item_consumable_destruction_certificate_pkey TO destruction_certificate_pkey;
                            END IF;

                            ALTER TABLE public.stock_item_consumable_destruction_certificate RENAME TO destruction_certificate;
                        END IF;
                    END $$;
                    """,
                ),
            ],
            state_operations=[
                migrations.CreateModel(
                    name="StockItemConsumableDestructionCertificate",
                    fields=[
                        (
                            "destruction_certificate_id",
                            models.AutoField(
                                primary_key=True,
                                serialize=False,
                                db_column="destruction_certificate_id",
                            ),
                        ),
                        (
                            "digital_copy",
                            models.TextField(
                                blank=True,
                                null=True,
                                db_column="digital_copy",
                            ),
                        ),
                        (
                            "destruction_datetime",
                            models.DateTimeField(
                                blank=True,
                                null=True,
                                db_column="destruction_datetime",
                            ),
                        ),
                    ],
                    options={
                        "managed": False,
                        "db_table": "stock_item_consumable_destruction_certificate",
                    },
                ),
                migrations.DeleteModel(
                    name="DestructionCertificate",
                ),
                migrations.CreateModel(
                    name="AssetDestructionCertificate",
                    fields=[
                        (
                            "asset_destruction_certificate_id",
                            models.AutoField(
                                primary_key=True,
                                serialize=False,
                                db_column="asset_destruction_certificate_id",
                            ),
                        ),
                        (
                            "digital_copy",
                            models.TextField(
                                blank=True,
                                null=True,
                                db_column="digital_copy",
                            ),
                        ),
                        (
                            "destruction_datetime",
                            models.DateTimeField(
                                blank=True,
                                null=True,
                                db_column="destruction_datetime",
                            ),
                        ),
                    ],
                    options={
                        "managed": False,
                        "db_table": "asset_destruction_certificate",
                    },
                ),
                migrations.CreateModel(
                    name="AssetFailedExternalMaintenance",
                    fields=[
                        (
                            "asset",
                            models.OneToOneField(
                                primary_key=True,
                                serialize=False,
                                db_column="asset_id",
                                to="api.asset",
                                on_delete=models.deletion.CASCADE,
                            ),
                        ),
                        (
                            "external_maintenance_id",
                            models.IntegerField(db_column="external_maintenance_id"),
                        ),
                        (
                            "failed_datetime",
                            models.DateTimeField(blank=True, null=True, db_column="failed_datetime"),
                        ),
                    ],
                    options={
                        "managed": False,
                        "db_table": "asset_failed_external_maintenance",
                    },
                ),
                migrations.CreateModel(
                    name="AssetDestructionCertificateAsset",
                    fields=[
                        (
                            "id",
                            models.AutoField(primary_key=True, serialize=False, db_column="id"),
                        ),
                        (
                            "asset_destruction_certificate_id",
                            models.IntegerField(db_column="asset_destruction_certificate_id"),
                        ),
                        (
                            "asset_id",
                            models.IntegerField(db_column="asset_id"),
                        ),
                        (
                            "external_maintenance_id",
                            models.IntegerField(db_column="external_maintenance_id"),
                        ),
                    ],
                    options={
                        "managed": False,
                        "db_table": "asset_destruction_certificate_asset",
                    },
                ),
            ],
        )
    ]
