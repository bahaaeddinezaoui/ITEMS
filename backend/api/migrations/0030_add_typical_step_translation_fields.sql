-- ============================================================================
-- Migration: Add maintenance_type, operation_type, maintenance_domain columns
--            to typical step translation tables
-- Purpose: Support English and Arabic translations for these fields
-- ============================================================================

-- 1. Add columns to maintenance_typical_step_translation
ALTER TABLE public.maintenance_typical_step_translation
    ADD COLUMN IF NOT EXISTS maintenance_type VARCHAR(8) NULL,
    ADD COLUMN IF NOT EXISTS operation_type VARCHAR(24) NULL,
    ADD COLUMN IF NOT EXISTS maintenance_domain VARCHAR(24) NULL;

-- 2. Add operation_type column to external_maintenance_typical_step base table
ALTER TABLE public.external_maintenance_typical_step
    ADD COLUMN IF NOT EXISTS operation_type VARCHAR(24) NULL;

-- 3. Add columns to external_maintenance_typical_step_translation
ALTER TABLE public.external_maintenance_typical_step_translation
    ADD COLUMN IF NOT EXISTS maintenance_type VARCHAR(8) NULL,
    ADD COLUMN IF NOT EXISTS operation_type VARCHAR(24) NULL,
    ADD COLUMN IF NOT EXISTS maintenance_domain VARCHAR(24) NULL;

-- ============================================================================
-- DATA MIGRATION - Copy existing values from base tables as English default
-- ============================================================================

-- Update existing English translations with current base values for maintenance_typical_step
UPDATE public.maintenance_typical_step_translation t
SET
    maintenance_type = b.maintenance_type,
    operation_type = b.operation_type,
    maintenance_domain = b.maintenance_domain
FROM public.maintenance_typical_step b
WHERE t.maintenance_typical_step_id = b.maintenance_typical_step_id
  AND t.language_code = 'en';

-- Update existing English translations with current base values for external_maintenance_typical_step
UPDATE public.external_maintenance_typical_step_translation t
SET
    maintenance_type = b.maintenance_type,
    operation_type = b.operation_type,
    maintenance_domain = b.maintenance_domain
FROM public.external_maintenance_typical_step b
WHERE t.external_maintenance_typical_step_id = b.external_maintenance_typical_step_id
  AND t.language_code = 'en';

-- ============================================================================
-- DATA MIGRATION - Populate Arabic translations for known field values
-- ============================================================================

-- Arabic translations map:
--   maintenance_type: Software -> برمجي, Hardware -> عتادي
--   operation_type: add -> إضافة, change -> تغيير, remove -> نزع, inspect -> فحص
--   maintenance_domain: it -> تكنولوجيا المعلومات, network -> شبكي

-- 4. Update Arabic translations for maintenance_typical_step
UPDATE public.maintenance_typical_step_translation t
SET
    maintenance_type = CASE b.maintenance_type
        WHEN 'Software' THEN 'برمجي'
        WHEN 'Hardware' THEN 'عتادي'
        ELSE NULL
    END,
    operation_type = CASE b.operation_type
        WHEN 'add' THEN 'إضافة'
        WHEN 'change' THEN 'تغيير'
        WHEN 'remove' THEN 'نزع'
        WHEN 'inspect' THEN 'فحص'
        ELSE NULL
    END,
    maintenance_domain = CASE b.maintenance_domain
        WHEN 'it' THEN 'تكنولوجيا المعلومات'
        WHEN 'network' THEN 'شبكي'
        ELSE NULL
    END
FROM public.maintenance_typical_step b
WHERE t.maintenance_typical_step_id = b.maintenance_typical_step_id
  AND t.language_code = 'ar';

-- 5. Update Arabic translations for external_maintenance_typical_step
UPDATE public.external_maintenance_typical_step_translation t
SET
    maintenance_type = CASE b.maintenance_type
        WHEN 'Software' THEN 'برمجي'
        WHEN 'Hardware' THEN 'عتادي'
        ELSE NULL
    END,
    operation_type = CASE b.operation_type
        WHEN 'add' THEN 'إضافة'
        WHEN 'change' THEN 'تغيير'
        WHEN 'remove' THEN 'نزع'
        WHEN 'inspect' THEN 'فحص'
        ELSE NULL
    END,
    maintenance_domain = CASE b.maintenance_domain
        WHEN 'it' THEN 'تكنولوجيا المعلومات'
        WHEN 'network' THEN 'شبكي'
        ELSE NULL
    END
FROM public.external_maintenance_typical_step b
WHERE t.external_maintenance_typical_step_id = b.external_maintenance_typical_step_id
  AND t.language_code = 'ar';
