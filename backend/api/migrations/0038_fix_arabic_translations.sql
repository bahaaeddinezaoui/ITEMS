-- Fix: Insert Arabic translations for maintenance_step_status
-- Run with: psql -U postgres -d project_iguana -f api/migrations/0038_fix_arabic_translations.sql
-- Make sure to set client encoding to UTF8 first

SET client_encoding TO 'UTF8';

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
