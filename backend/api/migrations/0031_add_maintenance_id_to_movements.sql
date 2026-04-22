-- Add maintenance_id FK column to asset_movement, stock_item_movement, consumable_movement
-- This replaces the dynamic movement_reason patterns (maintenance_create_{id}, problem_report_include_{id})
-- with a static reason + separate maintenance_id FK.

ALTER TABLE public.asset_movement
    ADD COLUMN IF NOT EXISTS maintenance_id INTEGER NULL;

ALTER TABLE public.stock_item_movement
    ADD COLUMN IF NOT EXISTS maintenance_id INTEGER NULL;

ALTER TABLE public.consumable_movement
    ADD COLUMN IF NOT EXISTS maintenance_id INTEGER NULL;

-- Migrate existing data: extract maintenance_id from dynamic reason strings
UPDATE public.asset_movement
SET maintenance_id = SUBSTRING(movement_reason FROM 'maintenance_create_(\d+)')::INTEGER,
    movement_reason = 'maintenance_create'
WHERE movement_reason LIKE 'maintenance_create_%';

UPDATE public.stock_item_movement
SET maintenance_id = SUBSTRING(movement_reason FROM 'problem_report_include_(\d+)')::INTEGER,
    movement_reason = 'problem_report_include'
WHERE movement_reason LIKE 'problem_report_include_%';

UPDATE public.consumable_movement
SET maintenance_id = SUBSTRING(movement_reason FROM 'problem_report_include_(\d+)')::INTEGER,
    movement_reason = 'problem_report_include'
WHERE movement_reason LIKE 'problem_report_include_%';

-- Add foreign key constraints
ALTER TABLE public.asset_movement
    ADD CONSTRAINT fk_asset_movement_maintenance
    FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON DELETE SET NULL;

ALTER TABLE public.stock_item_movement
    ADD CONSTRAINT fk_stock_item_movement_maintenance
    FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON DELETE SET NULL;

ALTER TABLE public.consumable_movement
    ADD CONSTRAINT fk_consumable_movement_maintenance
    FOREIGN KEY (maintenance_id) REFERENCES public.maintenance(maintenance_id) ON DELETE SET NULL;

-- Add indexes for the new FK column
CREATE INDEX IF NOT EXISTS idx_asset_movement_maintenance_id ON public.asset_movement(maintenance_id);
CREATE INDEX IF NOT EXISTS idx_stock_item_movement_maintenance_id ON public.stock_item_movement(maintenance_id);
CREATE INDEX IF NOT EXISTS idx_consumable_movement_maintenance_id ON public.consumable_movement(maintenance_id);
