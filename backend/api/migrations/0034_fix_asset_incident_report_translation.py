from django.db import migrations


class Migration(migrations.Migration):
    """
    Remove note columns from asset_incident_report_translation (notes are not translated),
    and backfill Arabic reason/status with proper translations.
    """

    dependencies = [
        ('api', '0033_add_asset_incident_report_translation'),
    ]

    operations = [
        # Drop note columns — they don't need translation
        migrations.RunSQL(
            sql="""
            ALTER TABLE public.asset_incident_report_translation
                DROP COLUMN IF EXISTS owner_note,
                DROP COLUMN IF EXISTS it_bureau_chief_note,
                DROP COLUMN IF EXISTS exploitation_chief_note,
                DROP COLUMN IF EXISTS protection_and_security_bureau_chief_note,
                DROP COLUMN IF EXISTS school_headquarter_note;

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
            ALTER TABLE public.asset_incident_report_translation
                ADD COLUMN IF NOT EXISTS owner_note TEXT,
                ADD COLUMN IF NOT EXISTS it_bureau_chief_note TEXT,
                ADD COLUMN IF NOT EXISTS exploitation_chief_note TEXT,
                ADD COLUMN IF NOT EXISTS protection_and_security_bureau_chief_note TEXT,
                ADD COLUMN IF NOT EXISTS school_headquarter_note TEXT;

            UPDATE public.asset_incident_report_translation SET reason = 'stolen' WHERE language_code = 'ar' AND reason = 'مسروق';
            UPDATE public.asset_incident_report_translation SET reason = 'lost' WHERE language_code = 'ar' AND reason = 'مفقود';
            UPDATE public.asset_incident_report_translation SET reason = 'irrecoverably_damaged' WHERE language_code = 'ar' AND reason = 'تالف بشكل لا يمكن إصلاحه';
            UPDATE public.asset_incident_report_translation SET status = 'submitted' WHERE language_code = 'ar' AND status = 'مقدم';
            UPDATE public.asset_incident_report_translation SET status = 'under_review' WHERE language_code = 'ar' AND status = 'قيد المراجعة';
            UPDATE public.asset_incident_report_translation SET status = 'approved' WHERE language_code = 'ar' AND status = 'تمت الموافقة';
            UPDATE public.asset_incident_report_translation SET status = 'rejected' WHERE language_code = 'ar' AND status = 'مرفوض';
            """,
        ),
    ]
