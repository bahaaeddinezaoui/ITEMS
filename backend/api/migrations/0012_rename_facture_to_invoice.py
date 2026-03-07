from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0011_delivery_note_digital_copy_path"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE IF EXISTS public.facture
                RENAME TO invoice;

            ALTER TABLE IF EXISTS public.invoice
                RENAME COLUMN facture_id TO invoice_id;

            ALTER TABLE IF EXISTS public.invoice
                RENAME CONSTRAINT facture_pkey TO invoice_pkey;

            ALTER TABLE IF EXISTS public.invoice
                RENAME CONSTRAINT fk_facture_bon_de_li_bon_de_l TO fk_invoice_delivery_note;

            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE c.relkind = 'S'
                      AND n.nspname = 'public'
                      AND c.relname = 'facture_id_seq'
                ) THEN
                    ALTER SEQUENCE public.facture_id_seq RENAME TO invoice_id_seq;
                END IF;
            END $$;

            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE c.relkind = 'S'
                      AND n.nspname = 'public'
                      AND c.relname = 'invoice_id_seq'
                ) THEN
                    ALTER TABLE IF EXISTS public.invoice
                        ALTER COLUMN invoice_id SET DEFAULT nextval('public.invoice_id_seq');
                END IF;
            END $$;
            """,
            reverse_sql="""
            ALTER TABLE IF EXISTS public.invoice
                ALTER COLUMN invoice_id DROP DEFAULT;

            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE c.relkind = 'S'
                      AND n.nspname = 'public'
                      AND c.relname = 'invoice_id_seq'
                ) THEN
                    ALTER SEQUENCE public.invoice_id_seq RENAME TO facture_id_seq;
                END IF;
            END $$;

            ALTER TABLE IF EXISTS public.invoice
                RENAME CONSTRAINT fk_invoice_delivery_note TO fk_facture_bon_de_li_bon_de_l;

            ALTER TABLE IF EXISTS public.invoice
                RENAME CONSTRAINT invoice_pkey TO facture_pkey;

            ALTER TABLE IF EXISTS public.invoice
                RENAME COLUMN invoice_id TO facture_id;

            ALTER TABLE IF EXISTS public.invoice
                RENAME TO facture;

            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE c.relkind = 'S'
                      AND n.nspname = 'public'
                      AND c.relname = 'facture_id_seq'
                ) THEN
                    ALTER TABLE IF EXISTS public.facture
                        ALTER COLUMN facture_id SET DEFAULT nextval('public.facture_id_seq');
                END IF;
            END $$;
            """,
        ),
    ]
