-- Migration: Add organizational structure assignment tables
-- These tables allow assigning assets, stock items, and consumables to organizational structures

-- Table: asset_is_assigned_to_org_structure
CREATE TABLE IF NOT EXISTS asset_is_assigned_to_org_structure (
    assignment_id SERIAL PRIMARY KEY,
    organizational_structure_id INTEGER NOT NULL REFERENCES organizational_structure(organizational_structure_id) ON DELETE CASCADE,
    asset_id INTEGER NOT NULL REFERENCES asset(asset_id) ON DELETE CASCADE,
    assigned_by_person_id INTEGER NOT NULL REFERENCES person(person_id) ON DELETE CASCADE,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_confirmed_by_exploitation_chief_id INTEGER REFERENCES person(person_id) ON DELETE SET NULL,
    CONSTRAINT uq_asset_org_active UNIQUE (asset_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Table: stock_item_is_assigned_to_org_structure
CREATE TABLE IF NOT EXISTS stock_item_is_assigned_to_org_structure (
    assignment_id SERIAL PRIMARY KEY,
    organizational_structure_id INTEGER NOT NULL REFERENCES organizational_structure(organizational_structure_id) ON DELETE CASCADE,
    stock_item_id INTEGER NOT NULL REFERENCES stock_item(stock_item_id) ON DELETE CASCADE,
    assigned_by_person_id INTEGER NOT NULL REFERENCES person(person_id) ON DELETE CASCADE,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_confirmed_by_exploitation_chief_id INTEGER REFERENCES person(person_id) ON DELETE SET NULL,
    CONSTRAINT uq_stock_item_org_active UNIQUE (stock_item_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Table: consumable_is_assigned_to_org_structure
CREATE TABLE IF NOT EXISTS consumable_is_assigned_to_org_structure (
    assignment_id SERIAL PRIMARY KEY,
    organizational_structure_id INTEGER NOT NULL REFERENCES organizational_structure(organizational_structure_id) ON DELETE CASCADE,
    consumable_id INTEGER NOT NULL REFERENCES consumable(consumable_id) ON DELETE CASCADE,
    assigned_by_person_id INTEGER NOT NULL REFERENCES person(person_id) ON DELETE CASCADE,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_confirmed_by_exploitation_chief_id INTEGER REFERENCES person(person_id) ON DELETE SET NULL,
    CONSTRAINT uq_consumable_org_active UNIQUE (consumable_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_asset_org_structure_id ON asset_is_assigned_to_org_structure(organizational_structure_id);
CREATE INDEX IF NOT EXISTS idx_asset_org_is_active ON asset_is_assigned_to_org_structure(is_active);
CREATE INDEX IF NOT EXISTS idx_stock_item_org_structure_id ON stock_item_is_assigned_to_org_structure(organizational_structure_id);
CREATE INDEX IF NOT EXISTS idx_stock_item_org_is_active ON stock_item_is_assigned_to_org_structure(is_active);
CREATE INDEX IF NOT EXISTS idx_consumable_org_structure_id ON consumable_is_assigned_to_org_structure(organizational_structure_id);
CREATE INDEX IF NOT EXISTS idx_consumable_org_is_active ON consumable_is_assigned_to_org_structure(is_active);
