from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0017_asset_and_stock_destruction_certificates_split"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'room'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'location'
                ) THEN
                    ALTER TABLE public.room RENAME TO location;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='location' AND column_name='room_id'
                ) THEN
                    ALTER TABLE public.location RENAME COLUMN room_id TO location_id;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='location' AND column_name='room_name'
                ) THEN
                    ALTER TABLE public.location RENAME COLUMN room_name TO location_name;
                END IF;

                -- Start of room_type to location_type rename logic
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'room_type'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'location_type'
                ) THEN
                    ALTER TABLE public.room_type RENAME TO location_type;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='location_type' AND column_name='room_type_id'
                ) THEN
                    ALTER TABLE public.location_type RENAME COLUMN room_type_id TO location_type_id;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='location_type' AND column_name='room_type_label'
                ) THEN
                    ALTER TABLE public.location_type RENAME COLUMN room_type_label TO location_type_label;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='location_type' AND column_name='room_type_code'
                ) THEN
                    ALTER TABLE public.location_type RENAME COLUMN room_type_code TO location_type_code;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'room_type_pkey') THEN
                    ALTER TABLE public.location_type RENAME CONSTRAINT room_type_pkey TO location_type_pkey;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE n.nspname = 'public' AND c.relkind = 'S' AND c.relname = 'room_type_room_type_id_seq'
                ) THEN
                    ALTER SEQUENCE public.room_type_room_type_id_seq RENAME TO location_type_location_type_id_seq;
                END IF;

                -- Update the foreign key column in location table
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='location' AND column_name='room_type_id'
                ) THEN
                    ALTER TABLE public.location RENAME COLUMN room_type_id TO location_type_id;
                END IF;
                -- End of room_type to location_type rename logic

                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'room_pkey') THEN
                    ALTER TABLE public.location RENAME CONSTRAINT room_pkey TO location_pkey;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE n.nspname = 'public' AND c.relkind = 'S' AND c.relname = 'room_room_id_seq'
                ) THEN
                    ALTER SEQUENCE public.room_room_id_seq RENAME TO location_location_id_seq;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema='public' AND table_name='room_belongs_to_organizational_structure'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema='public' AND table_name='location_belongs_to_organizational_structure'
                ) THEN
                    ALTER TABLE public.room_belongs_to_organizational_structure
                        RENAME TO location_belongs_to_organizational_structure;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='location_belongs_to_organizational_structure' AND column_name='room_id'
                ) THEN
                    ALTER TABLE public.location_belongs_to_organizational_structure
                        RENAME COLUMN room_id TO location_id;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_asset_mo_asset_mov_room_dest') THEN
                    ALTER TABLE public.asset_movement DROP CONSTRAINT fk_asset_mo_asset_mov_room_dest;
                END IF;
                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_asset_mo_asset_mov_room_source') THEN
                    ALTER TABLE public.asset_movement DROP CONSTRAINT fk_asset_mo_asset_mov_room_source;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='asset_movement' AND column_name='destination_room_id'
                ) THEN
                    ALTER TABLE public.asset_movement RENAME COLUMN destination_room_id TO destination_location_id;
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='asset_movement' AND column_name='source_room_id'
                ) THEN
                    ALTER TABLE public.asset_movement RENAME COLUMN source_room_id TO source_location_id;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_asset_mo_asset_mov_location_dest') THEN
                    ALTER TABLE public.asset_movement
                        ADD CONSTRAINT fk_asset_mo_asset_mov_location_dest
                        FOREIGN KEY (destination_location_id)
                        REFERENCES public.location(location_id)
                        ON UPDATE RESTRICT ON DELETE RESTRICT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_asset_mo_asset_mov_location_source') THEN
                    ALTER TABLE public.asset_movement
                        ADD CONSTRAINT fk_asset_mo_asset_mov_location_source
                        FOREIGN KEY (source_location_id)
                        REFERENCES public.location(location_id)
                        ON UPDATE RESTRICT ON DELETE RESTRICT;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_stock_it_stock_ite_room_dest') THEN
                    ALTER TABLE public.stock_item_movement DROP CONSTRAINT fk_stock_it_stock_ite_room_dest;
                END IF;
                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_stock_it_stock_ite_room_source') THEN
                    ALTER TABLE public.stock_item_movement DROP CONSTRAINT fk_stock_it_stock_ite_room_source;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='stock_item_movement' AND column_name='destination_room_id'
                ) THEN
                    ALTER TABLE public.stock_item_movement RENAME COLUMN destination_room_id TO destination_location_id;
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='stock_item_movement' AND column_name='source_room_id'
                ) THEN
                    ALTER TABLE public.stock_item_movement RENAME COLUMN source_room_id TO source_location_id;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_stock_it_stock_ite_location_dest') THEN
                    ALTER TABLE public.stock_item_movement
                        ADD CONSTRAINT fk_stock_it_stock_ite_location_dest
                        FOREIGN KEY (destination_location_id)
                        REFERENCES public.location(location_id)
                        ON UPDATE RESTRICT ON DELETE RESTRICT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_stock_it_stock_ite_location_source') THEN
                    ALTER TABLE public.stock_item_movement
                        ADD CONSTRAINT fk_stock_it_stock_ite_location_source
                        FOREIGN KEY (source_location_id)
                        REFERENCES public.location(location_id)
                        ON UPDATE RESTRICT ON DELETE RESTRICT;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_consumab_consumabl_room_dest') THEN
                    ALTER TABLE public.consumable_movement DROP CONSTRAINT fk_consumab_consumabl_room_dest;
                END IF;
                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_consumab_consumabl_room_source') THEN
                    ALTER TABLE public.consumable_movement DROP CONSTRAINT fk_consumab_consumabl_room_source;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='consumable_movement' AND column_name='destination_room_id'
                ) THEN
                    ALTER TABLE public.consumable_movement RENAME COLUMN destination_room_id TO destination_location_id;
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='consumable_movement' AND column_name='source_room_id'
                ) THEN
                    ALTER TABLE public.consumable_movement RENAME COLUMN source_room_id TO source_location_id;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_consumab_consumabl_location_dest') THEN
                    ALTER TABLE public.consumable_movement
                        ADD CONSTRAINT fk_consumab_consumabl_location_dest
                        FOREIGN KEY (destination_location_id)
                        REFERENCES public.location(location_id)
                        ON UPDATE RESTRICT ON DELETE RESTRICT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_consumab_consumabl_location_source') THEN
                    ALTER TABLE public.consumable_movement
                        ADD CONSTRAINT fk_consumab_consumabl_location_source
                        FOREIGN KEY (source_location_id)
                        REFERENCES public.location(location_id)
                        ON UPDATE RESTRICT ON DELETE RESTRICT;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'msir_destination_room_fk') THEN
                    ALTER TABLE public.maintenance_step_item_request DROP CONSTRAINT msir_destination_room_fk;
                END IF;
                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'msir_source_room_fk') THEN
                    ALTER TABLE public.maintenance_step_item_request DROP CONSTRAINT msir_source_room_fk;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='maintenance_step_item_request' AND column_name='destination_room_id'
                ) THEN
                    ALTER TABLE public.maintenance_step_item_request RENAME COLUMN destination_room_id TO destination_location_id;
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='maintenance_step_item_request' AND column_name='source_room_id'
                ) THEN
                    ALTER TABLE public.maintenance_step_item_request RENAME COLUMN source_room_id TO source_location_id;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'msir_destination_location_fk') THEN
                    ALTER TABLE public.maintenance_step_item_request
                        ADD CONSTRAINT msir_destination_location_fk
                        FOREIGN KEY (destination_location_id)
                        REFERENCES public.location(location_id);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'msir_source_location_fk') THEN
                    ALTER TABLE public.maintenance_step_item_request
                        ADD CONSTRAINT msir_source_location_fk
                        FOREIGN KEY (source_location_id)
                        REFERENCES public.location(location_id);
                END IF;

                IF EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = 'person_reports_problem_on_asset_includ_destination_room_id_fkey'
                ) THEN
                    ALTER TABLE public.person_reports_problem_on_asset_included_context
                        DROP CONSTRAINT person_reports_problem_on_asset_includ_destination_room_id_fkey;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public'
                        AND table_name='person_reports_problem_on_asset_included_context'
                        AND column_name='destination_room_id'
                ) THEN
                    ALTER TABLE public.person_reports_problem_on_asset_included_context
                        RENAME COLUMN destination_room_id TO destination_location_id;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = 'person_reports_problem_on_asset_includ_destination_location_id_fkey'
                ) THEN
                    ALTER TABLE public.person_reports_problem_on_asset_included_context
                        ADD CONSTRAINT person_reports_problem_on_asset_includ_destination_location_id_fkey
                        FOREIGN KEY (destination_location_id)
                        REFERENCES public.location(location_id);
                END IF;

                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'room_belongs_to_organizational_structure_pkey') THEN
                    ALTER TABLE public.location_belongs_to_organizational_structure
                        RENAME CONSTRAINT room_belongs_to_organizational_structure_pkey
                        TO location_belongs_to_organizational_structure_pkey;
                END IF;

                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_room_bel_room_belo_room') THEN
                    ALTER TABLE public.location_belongs_to_organizational_structure
                        DROP CONSTRAINT fk_room_bel_room_belo_room;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_location_bel_location_belo_location') THEN
                    ALTER TABLE public.location_belongs_to_organizational_structure
                        ADD CONSTRAINT fk_location_bel_location_belo_location
                        FOREIGN KEY (location_id)
                        REFERENCES public.location(location_id)
                        ON UPDATE RESTRICT ON DELETE RESTRICT;
                END IF;

            END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        )
    ]
