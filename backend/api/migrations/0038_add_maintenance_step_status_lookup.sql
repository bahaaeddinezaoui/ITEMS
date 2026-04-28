-- Migration: Add maintenance_step_status lookup table and its translation table
-- This normalizes the maintenance_step.maintenance_step_status varchar column
-- into a proper FK-based lookup with i18n support.

-- ============================================================================
-- Step 1: Create the lookup table
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_step_status (
    id SERIAL PRIMARY KEY,
    code VARCHAR(60) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0
);

-- ============================================================================
-- Step 2: Seed the lookup table with existing status values
-- ============================================================================
INSERT INTO maintenance_step_status (code, sort_order) VALUES
    ('PENDING', 10),
    ('STARTED', 20),
    ('PENDING_STOCK_ITEM', 30),
    ('PENDING_CONSUMABLE', 30),
    ('IN_PROGRESS', 40),
    ('DONE', 50),
    ('FAILED_HIGHER_LEVEL', 50),
    ('CANCELLED', 50)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- Step 3: Create the translation table
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_step_status_translation (
    id SERIAL PRIMARY KEY,
    maintenance_step_status_id INT NOT NULL REFERENCES maintenance_step_status(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    maintenance_step_status_label VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (maintenance_step_status_id, language_code)
);

-- ============================================================================
-- Step 4: Seed English translations
-- ============================================================================
INSERT INTO maintenance_step_status_translation (maintenance_step_status_id, language_code, maintenance_step_status_label) VALUES
    ((SELECT id FROM maintenance_step_status WHERE code = 'PENDING'), 'en', 'Pending'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'STARTED'), 'en', 'Started'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'PENDING_STOCK_ITEM'), 'en', 'Pending (waiting for stock item)'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'PENDING_CONSUMABLE'), 'en', 'Pending (waiting for consumable)'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'IN_PROGRESS'), 'en', 'In Progress'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'DONE'), 'en', 'Done'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'FAILED_HIGHER_LEVEL'), 'en', 'Failed (to be sent to a higher level)'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'CANCELLED'), 'en', 'Cancelled')
ON CONFLICT (maintenance_step_status_id, language_code) DO NOTHING;

-- ============================================================================
-- Step 5: Seed Arabic translations
-- ============================================================================
INSERT INTO maintenance_step_status_translation (maintenance_step_status_id, language_code, maintenance_step_status_label) VALUES
    ((SELECT id FROM maintenance_step_status WHERE code = 'PENDING'), 'ar', 'قيد الانتظار'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'STARTED'), 'ar', 'بدأت'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'PENDING_STOCK_ITEM'), 'ar', 'قيد الانتظار (في انتظار عنصر المخزون)'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'PENDING_CONSUMABLE'), 'ar', 'قيد الانتظار (في انتظار المستهلك)'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'IN_PROGRESS'), 'ar', 'قيد التنفيذ'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'DONE'), 'ar', 'منتهية'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'FAILED_HIGHER_LEVEL'), 'ar', 'فشلت (يجب إرسالها إلى مستوى أعلى)'),
    ((SELECT id FROM maintenance_step_status WHERE code = 'CANCELLED'), 'ar', 'ملغاة')
ON CONFLICT (maintenance_step_status_id, language_code) DO NOTHING;

-- ============================================================================
-- Step 6: Add status_id FK column to maintenance_step (nullable for migration)
-- ============================================================================
ALTER TABLE maintenance_step
    ADD COLUMN IF NOT EXISTS status_id INT REFERENCES maintenance_step_status(id);

-- ============================================================================
-- Step 7: Backfill status_id from old varchar values
-- ============================================================================
UPDATE maintenance_step SET status_id = (
    SELECT id FROM maintenance_step_status WHERE code =
        CASE
            WHEN LOWER(TRIM(maintenance_step.maintenance_step_status)) = 'pending (waiting for stock item)' THEN 'PENDING_STOCK_ITEM'
            WHEN LOWER(TRIM(maintenance_step.maintenance_step_status)) = 'pending (waiting for consumable)' THEN 'PENDING_CONSUMABLE'
            WHEN LOWER(TRIM(maintenance_step.maintenance_step_status)) = 'in progress' THEN 'IN_PROGRESS'
            WHEN LOWER(TRIM(maintenance_step.maintenance_step_status)) = 'failed (to be sent to a higher level)' THEN 'FAILED_HIGHER_LEVEL'
            WHEN LOWER(TRIM(maintenance_step.maintenance_step_status)) = 'pending' THEN 'PENDING'
            WHEN LOWER(TRIM(maintenance_step.maintenance_step_status)) = 'started' THEN 'STARTED'
            WHEN LOWER(TRIM(maintenance_step.maintenance_step_status)) = 'done' THEN 'DONE'
            WHEN LOWER(TRIM(maintenance_step.maintenance_step_status)) = 'cancelled' THEN 'CANCELLED'
            ELSE NULL
        END
)
WHERE maintenance_step.maintenance_step_status IS NOT NULL
  AND status_id IS NULL;

-- NOTE: The old maintenance_step_status varchar column is kept temporarily
-- for backward compatibility. It can be dropped after the application
-- is fully migrated to use status_id.
