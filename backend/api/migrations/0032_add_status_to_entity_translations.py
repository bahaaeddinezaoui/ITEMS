from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_add_maintenance_id_to_movements'),
    ]

    operations = [
        # Add asset_status column to asset_translation
        migrations.RunSQL(
            sql="""
            ALTER TABLE public.asset_translation ADD COLUMN IF NOT EXISTS asset_status character varying(60);
            """,
            reverse_sql="ALTER TABLE public.asset_translation DROP COLUMN IF EXISTS asset_status;",
        ),
        # Add stock_item_status column to stock_item_translation
        migrations.RunSQL(
            sql="""
            ALTER TABLE public.stock_item_translation ADD COLUMN IF NOT EXISTS stock_item_status character varying(60);
            """,
            reverse_sql="ALTER TABLE public.stock_item_translation DROP COLUMN IF EXISTS stock_item_status;",
        ),
        # Add consumable_status column to consumable_translation
        migrations.RunSQL(
            sql="""
            ALTER TABLE public.consumable_translation ADD COLUMN IF NOT EXISTS consumable_status character varying(60);
            """,
            reverse_sql="ALTER TABLE public.consumable_translation DROP COLUMN IF EXISTS consumable_status;",
        ),
        # Backfill asset_translation.asset_status
        migrations.RunSQL(
            sql="""
            UPDATE public.asset_translation t
            SET asset_status = a.asset_status
            FROM public.asset a
            WHERE t.asset_id = a.asset_id
              AND t.language_code = 'en'
              AND a.asset_status IS NOT NULL
              AND (t.asset_status IS NULL OR t.asset_status = '');

            UPDATE public.asset_translation t
            SET asset_status = a.asset_status
            FROM public.asset a
            WHERE t.asset_id = a.asset_id
              AND t.language_code = 'ar'
              AND a.asset_status IS NOT NULL
              AND (t.asset_status IS NULL OR t.asset_status = '');

            SELECT setval('asset_translation_id_seq', COALESCE((SELECT MAX(id) FROM public.asset_translation), 0) + 1, false);

            INSERT INTO public.asset_translation (id, asset_id, language_code, asset_name, asset_status)
            SELECT nextval('asset_translation_id_seq'), a.asset_id, 'en', a.asset_name, a.asset_status
            FROM public.asset a
            WHERE NOT EXISTS (
                SELECT 1 FROM public.asset_translation t
                WHERE t.asset_id = a.asset_id AND t.language_code = 'en'
            );

            INSERT INTO public.asset_translation (id, asset_id, language_code, asset_name, asset_status)
            SELECT nextval('asset_translation_id_seq'), a.asset_id, 'ar', a.asset_name, a.asset_status
            FROM public.asset a
            WHERE NOT EXISTS (
                SELECT 1 FROM public.asset_translation t
                WHERE t.asset_id = a.asset_id AND t.language_code = 'ar'
            );
            """,
            reverse_sql="",
        ),
        # Backfill stock_item_translation.stock_item_status
        migrations.RunSQL(
            sql="""
            UPDATE public.stock_item_translation t
            SET stock_item_status = s.stock_item_status
            FROM public.stock_item s
            WHERE t.stock_item_id = s.stock_item_id
              AND t.language_code = 'en'
              AND s.stock_item_status IS NOT NULL
              AND (t.stock_item_status IS NULL OR t.stock_item_status = '');

            UPDATE public.stock_item_translation t
            SET stock_item_status = s.stock_item_status
            FROM public.stock_item s
            WHERE t.stock_item_id = s.stock_item_id
              AND t.language_code = 'ar'
              AND s.stock_item_status IS NOT NULL
              AND (t.stock_item_status IS NULL OR t.stock_item_status = '');

            SELECT setval('stock_item_translation_id_seq', COALESCE((SELECT MAX(id) FROM public.stock_item_translation), 0) + 1, false);

            INSERT INTO public.stock_item_translation (id, stock_item_id, language_code, stock_item_name, stock_item_status)
            SELECT nextval('stock_item_translation_id_seq'), s.stock_item_id, 'en', s.stock_item_name, s.stock_item_status
            FROM public.stock_item s
            WHERE NOT EXISTS (
                SELECT 1 FROM public.stock_item_translation t
                WHERE t.stock_item_id = s.stock_item_id AND t.language_code = 'en'
            );

            INSERT INTO public.stock_item_translation (id, stock_item_id, language_code, stock_item_name, stock_item_status)
            SELECT nextval('stock_item_translation_id_seq'), s.stock_item_id, 'ar', s.stock_item_name, s.stock_item_status
            FROM public.stock_item s
            WHERE NOT EXISTS (
                SELECT 1 FROM public.stock_item_translation t
                WHERE t.stock_item_id = s.stock_item_id AND t.language_code = 'ar'
            );
            """,
            reverse_sql="",
        ),
        # Backfill consumable_translation.consumable_status
        migrations.RunSQL(
            sql="""
            UPDATE public.consumable_translation t
            SET consumable_status = c.consumable_status
            FROM public.consumable c
            WHERE t.consumable_id = c.consumable_id
              AND t.language_code = 'en'
              AND c.consumable_status IS NOT NULL
              AND (t.consumable_status IS NULL OR t.consumable_status = '');

            UPDATE public.consumable_translation t
            SET consumable_status = c.consumable_status
            FROM public.consumable c
            WHERE t.consumable_id = c.consumable_id
              AND t.language_code = 'ar'
              AND c.consumable_status IS NOT NULL
              AND (t.consumable_status IS NULL OR t.consumable_status = '');

            SELECT setval('consumable_translation_id_seq', COALESCE((SELECT MAX(id) FROM public.consumable_translation), 0) + 1, false);

            INSERT INTO public.consumable_translation (id, consumable_id, language_code, consumable_name, consumable_status)
            SELECT nextval('consumable_translation_id_seq'), c.consumable_id, 'en', c.consumable_name, c.consumable_status
            FROM public.consumable c
            WHERE NOT EXISTS (
                SELECT 1 FROM public.consumable_translation t
                WHERE t.consumable_id = c.consumable_id AND t.language_code = 'en'
            );

            INSERT INTO public.consumable_translation (id, consumable_id, language_code, consumable_name, consumable_status)
            SELECT nextval('consumable_translation_id_seq'), c.consumable_id, 'ar', c.consumable_name, c.consumable_status
            FROM public.consumable c
            WHERE NOT EXISTS (
                SELECT 1 FROM public.consumable_translation t
                WHERE t.consumable_id = c.consumable_id AND t.language_code = 'ar'
            );
            """,
            reverse_sql="",
        ),
    ]
