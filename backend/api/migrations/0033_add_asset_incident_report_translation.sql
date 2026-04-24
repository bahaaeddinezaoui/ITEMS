-- ============================================================================
-- Migration: Add asset_incident_report_translation table
-- Purpose: Support English and Arabic translations for asset incident report
-- ============================================================================

-- 1. Create translation table
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

-- ============================================================================
-- DATA MIGRATION - Copy existing text fields as English and Arabic rows
-- ============================================================================

-- English rows: copy from base table
INSERT INTO public.asset_incident_report_translation (asset_incident_report_id, language_code, reason, status, created_at, updated_at)
SELECT asset_incident_report_id, 'en', reason, status, NOW(), NOW()
FROM public.asset_incident_report;

-- Arabic rows: copy from base table then translate reason and status
INSERT INTO public.asset_incident_report_translation (asset_incident_report_id, language_code, reason, status, created_at, updated_at)
SELECT asset_incident_report_id, 'ar', reason, status, NOW(), NOW()
FROM public.asset_incident_report;

-- Translate Arabic reason values
UPDATE public.asset_incident_report_translation SET reason = 'مسروق' WHERE language_code = 'ar' AND reason = 'stolen';
UPDATE public.asset_incident_report_translation SET reason = 'مفقود' WHERE language_code = 'ar' AND reason = 'lost';
UPDATE public.asset_incident_report_translation SET reason = 'تالف بشكل لا يمكن إصلاحه' WHERE language_code = 'ar' AND reason = 'irrecoverably_damaged';

-- Translate Arabic status values
UPDATE public.asset_incident_report_translation SET status = 'مقدم' WHERE language_code = 'ar' AND status = 'submitted';
UPDATE public.asset_incident_report_translation SET status = 'قيد المراجعة' WHERE language_code = 'ar' AND status = 'under_review';
UPDATE public.asset_incident_report_translation SET status = 'تمت الموافقة' WHERE language_code = 'ar' AND status = 'approved';
UPDATE public.asset_incident_report_translation SET status = 'مرفوض' WHERE language_code = 'ar' AND status = 'rejected';
