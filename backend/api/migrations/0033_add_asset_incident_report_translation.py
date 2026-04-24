# Generated migration for asset_incident_report i18n translation table

from django.db import migrations


class Migration(migrations.Migration):
    """
    Migration to add per-entity translation table for asset_incident_report i18n support.
    """

    dependencies = [
        ('api', '0032_add_status_to_entity_translations'),
    ]

    operations = [
        # Create the table and populate with existing data
        # Note: No CreateModel needed — managed=False means Django doesn't track this model in migration state.
        # The RunSQL handles all DDL directly.
        migrations.RunSQL(
            sql="""
            -- Create translation table
            CREATE TABLE public.asset_incident_report_translation (
                id SERIAL PRIMARY KEY,
                asset_incident_report_id INTEGER NOT NULL REFERENCES public.asset_incident_report(asset_incident_report_id) ON DELETE CASCADE,
                language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
                reason VARCHAR(32),
                status VARCHAR(20),
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                UNIQUE (asset_incident_report_id, language_code)
            );

            CREATE INDEX idx_asset_incident_report_translation_lang ON public.asset_incident_report_translation(language_code);

            -- English rows: copy from base table
            INSERT INTO public.asset_incident_report_translation (asset_incident_report_id, language_code, reason, status, created_at, updated_at)
            SELECT asset_incident_report_id, 'en', reason, status, NOW(), NOW()
            FROM public.asset_incident_report;

            -- Arabic rows: copy from base table then translate reason and status
            INSERT INTO public.asset_incident_report_translation (asset_incident_report_id, language_code, reason, status, created_at, updated_at)
            SELECT asset_incident_report_id, 'ar', reason, status, NOW(), NOW()
            FROM public.asset_incident_report;

            -- Translate Arabic reason values
            UPDATE public.asset_incident_report_translation
            SET reason = 'مسروق'
            WHERE language_code = 'ar' AND reason = 'stolen';

            UPDATE public.asset_incident_report_translation
            SET reason = 'مفقود'
            WHERE language_code = 'ar' AND reason = 'lost';

            UPDATE public.asset_incident_report_translation
            SET reason = 'تالف بشكل لا يمكن إصلاحه'
            WHERE language_code = 'ar' AND reason = 'irrecoverably_damaged';

            -- Translate Arabic status values
            UPDATE public.asset_incident_report_translation
            SET status = 'مقدم'
            WHERE language_code = 'ar' AND status = 'submitted';

            UPDATE public.asset_incident_report_translation
            SET status = 'قيد المراجعة'
            WHERE language_code = 'ar' AND status = 'under_review';

            UPDATE public.asset_incident_report_translation
            SET status = 'تمت الموافقة'
            WHERE language_code = 'ar' AND status = 'approved';

            UPDATE public.asset_incident_report_translation
            SET status = 'مرفوض'
            WHERE language_code = 'ar' AND status = 'rejected';
            """,
            reverse_sql="""
            DROP TABLE IF EXISTS public.asset_incident_report_translation;
            """,
        ),
    ]
