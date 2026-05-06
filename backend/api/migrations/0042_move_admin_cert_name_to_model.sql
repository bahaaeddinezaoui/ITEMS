-- Migration: Move name_in_administrative_certificate from item tables to model tables
-- This migrates asset.asset_name_in_administrative_certificate -> asset_model.asset_model_name_in_administrative_certificate
-- and stock_item.stock_item_name_in_administrative_certificate -> stock_item_model.stock_item_model_name_in_administrative_certificate
-- and consumable.consumable_name_in_administrative_certificate -> consumable_model.consumable_model_name_in_administrative_certificate
-- NOTE: Data migration steps are conditional - they only run if the old columns still exist.

-- ============================================================================
-- Step 1: Add new columns to model tables
-- ============================================================================

ALTER TABLE asset_model
    ADD COLUMN IF NOT EXISTS asset_model_name_in_administrative_certificate VARCHAR(48);

ALTER TABLE stock_item_model
    ADD COLUMN IF NOT EXISTS stock_item_model_name_in_administrative_certificate VARCHAR(48);

ALTER TABLE consumable_model
    ADD COLUMN IF NOT EXISTS consumable_model_name_in_administrative_certificate VARCHAR(48);

-- ============================================================================
-- Step 2: Add new columns to model translation tables
-- ============================================================================

ALTER TABLE asset_model_translation
    ADD COLUMN IF NOT EXISTS asset_model_name_in_administrative_certificate VARCHAR(48);

ALTER TABLE stock_item_model_translation
    ADD COLUMN IF NOT EXISTS stock_item_model_name_in_administrative_certificate VARCHAR(48);

ALTER TABLE consumable_model_translation
    ADD COLUMN IF NOT EXISTS consumable_model_name_in_administrative_certificate VARCHAR(48);

-- ============================================================================
-- Step 3: Migrate data from item tables to model tables (conditional)
-- Only runs if the old columns still exist in the database.
-- ============================================================================

-- For asset_model: take the first non-empty value from linked assets
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'asset' AND column_name = 'asset_name_in_administrative_certificate'
    ) THEN
        UPDATE asset_model am
        SET asset_model_name_in_administrative_certificate = sub.val
        FROM (
            SELECT am2.asset_model_id, a.asset_name_in_administrative_certificate AS val
            FROM asset_model am2
            JOIN asset a ON a.asset_model_id = am2.asset_model_id
            WHERE a.asset_name_in_administrative_certificate IS NOT NULL
              AND a.asset_name_in_administrative_certificate != ''
            AND NOT EXISTS (
                SELECT 1 FROM asset a2
                WHERE a2.asset_model_id = am2.asset_model_id
                  AND a2.asset_name_in_administrative_certificate IS NOT NULL
                  AND a2.asset_name_in_administrative_certificate != ''
                  AND a2.asset_id < a.asset_id
            )
        ) sub
        WHERE am.asset_model_id = sub.asset_model_id;
    END IF;
END $$;

-- For stock_item_model: take the first non-empty value from linked stock items
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stock_item' AND column_name = 'stock_item_name_in_administrative_certificate'
    ) THEN
        UPDATE stock_item_model sim
        SET stock_item_model_name_in_administrative_certificate = sub.val
        FROM (
            SELECT sim2.stock_item_model_id, si.stock_item_name_in_administrative_certificate AS val
            FROM stock_item_model sim2
            JOIN stock_item si ON si.stock_item_model_id = sim2.stock_item_model_id
            WHERE si.stock_item_name_in_administrative_certificate IS NOT NULL
              AND si.stock_item_name_in_administrative_certificate != ''
            AND NOT EXISTS (
                SELECT 1 FROM stock_item si2
                WHERE si2.stock_item_model_id = sim2.stock_item_model_id
                  AND si2.stock_item_name_in_administrative_certificate IS NOT NULL
                  AND si2.stock_item_name_in_administrative_certificate != ''
                  AND si2.stock_item_id < si.stock_item_id
            )
        ) sub
        WHERE sim.stock_item_model_id = sub.stock_item_model_id;
    END IF;
END $$;

-- For consumable_model: take the first non-empty value from linked consumables
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'consumable' AND column_name = 'consumable_name_in_administrative_certificate'
    ) THEN
        UPDATE consumable_model cm
        SET consumable_model_name_in_administrative_certificate = sub.val
        FROM (
            SELECT cm2.consumable_model_id, c.consumable_name_in_administrative_certificate AS val
            FROM consumable_model cm2
            JOIN consumable c ON c.consumable_model_id = cm2.consumable_model_id
            WHERE c.consumable_name_in_administrative_certificate IS NOT NULL
              AND c.consumable_name_in_administrative_certificate != ''
            AND NOT EXISTS (
                SELECT 1 FROM consumable c2
                WHERE c2.consumable_model_id = cm2.consumable_model_id
                  AND c2.consumable_name_in_administrative_certificate IS NOT NULL
                  AND c2.consumable_name_in_administrative_certificate != ''
                  AND c2.consumable_id < c.consumable_id
            )
        ) sub
        WHERE cm.consumable_model_id = sub.consumable_model_id;
    END IF;
END $$;

-- ============================================================================
-- Step 4: Migrate data from item translation tables to model translation tables (conditional)
-- Only runs if the old columns still exist in the database.
-- ============================================================================

-- Asset translations: update existing rows
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'asset_translation' AND column_name = 'asset_name_in_the_administrative_certificate'
    ) THEN
        UPDATE asset_model_translation amt
        SET asset_model_name_in_administrative_certificate = sub.val,
            updated_at = NOW()
        FROM (
            SELECT am.asset_model_id, at.language_code, at.asset_name_in_the_administrative_certificate AS val
            FROM asset_translation at
            JOIN asset a ON a.asset_id = at.asset_id
            JOIN asset_model am ON am.asset_model_id = a.asset_model_id
            WHERE at.asset_name_in_the_administrative_certificate IS NOT NULL
              AND at.asset_name_in_the_administrative_certificate != ''
        ) sub
        WHERE amt.asset_model_id = sub.asset_model_id
          AND amt.language_code = sub.language_code;
    END IF;
END $$;

-- Stock item translations: update existing rows
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stock_item_translation' AND column_name = 'stock_item_name_in_administrative_certificate'
    ) THEN
        UPDATE stock_item_model_translation simt
        SET stock_item_model_name_in_administrative_certificate = sub.val,
            updated_at = NOW()
        FROM (
            SELECT sim.stock_item_model_id, sit.language_code, sit.stock_item_name_in_administrative_certificate AS val
            FROM stock_item_translation sit
            JOIN stock_item si ON si.stock_item_id = sit.stock_item_id
            JOIN stock_item_model sim ON sim.stock_item_model_id = si.stock_item_model_id
            WHERE sit.stock_item_name_in_administrative_certificate IS NOT NULL
              AND sit.stock_item_name_in_administrative_certificate != ''
        ) sub
        WHERE simt.stock_item_model_id = sub.stock_item_model_id
          AND simt.language_code = sub.language_code;
    END IF;
END $$;

-- Consumable translations: update existing rows
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'consumable_translation' AND column_name = 'consumable_name_in_administrative_certificate'
    ) THEN
        UPDATE consumable_model_translation cmt
        SET consumable_model_name_in_administrative_certificate = sub.val,
            updated_at = NOW()
        FROM (
            SELECT cm.consumable_model_id, ct.language_code, ct.consumable_name_in_administrative_certificate AS val
            FROM consumable_translation ct
            JOIN consumable c ON c.consumable_id = ct.consumable_id
            JOIN consumable_model cm ON cm.consumable_model_id = c.consumable_model_id
            WHERE ct.consumable_name_in_administrative_certificate IS NOT NULL
              AND ct.consumable_name_in_administrative_certificate != ''
        ) sub
        WHERE cmt.consumable_model_id = sub.consumable_model_id
          AND cmt.language_code = sub.language_code;
    END IF;
END $$;

-- ============================================================================
-- Step 5: Drop old columns from item tables (safe - IF EXISTS)
-- ============================================================================

ALTER TABLE asset DROP COLUMN IF EXISTS asset_name_in_administrative_certificate;
ALTER TABLE stock_item DROP COLUMN IF EXISTS stock_item_name_in_administrative_certificate;
ALTER TABLE consumable DROP COLUMN IF EXISTS consumable_name_in_administrative_certificate;

-- ============================================================================
-- Step 6: Drop old columns from item translation tables (safe - IF EXISTS)
-- ============================================================================

ALTER TABLE asset_translation DROP COLUMN IF EXISTS asset_name_in_the_administrative_certificate;
ALTER TABLE stock_item_translation DROP COLUMN IF EXISTS stock_item_name_in_administrative_certificate;
ALTER TABLE consumable_translation DROP COLUMN IF EXISTS consumable_name_in_administrative_certificate;
