-- ============================================================================
-- Migration: Add per-entity i18n translation tables (Variant A)
-- Purpose: Support English and Arabic (extensible to other languages)
-- ============================================================================

-- ============================================================================
-- SECTION 1: REFERENCE/DICTIONARY DATA (UI Labels)
-- ============================================================================

-- 1.1 asset_type_translation
CREATE TABLE public.asset_type_translation (
    id SERIAL PRIMARY KEY,
    asset_type_id INTEGER NOT NULL REFERENCES public.asset_type(asset_type_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    asset_type_label VARCHAR(60) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (asset_type_id, language_code)
);

CREATE INDEX idx_asset_type_translation_lang ON public.asset_type_translation(language_code);

-- 1.2 consumable_type_translation
CREATE TABLE public.consumable_type_translation (
    id SERIAL PRIMARY KEY,
    consumable_type_id INTEGER NOT NULL REFERENCES public.consumable_type(consumable_type_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    consumable_type_label VARCHAR(60) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (consumable_type_id, language_code)
);

CREATE INDEX idx_consumable_type_translation_lang ON public.consumable_type_translation(language_code);

-- 1.3 stock_item_type_translation
CREATE TABLE public.stock_item_type_translation (
    id SERIAL PRIMARY KEY,
    stock_item_type_id INTEGER NOT NULL REFERENCES public.stock_item_type(stock_item_type_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    stock_item_type_label VARCHAR(60) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (stock_item_type_id, language_code)
);

CREATE INDEX idx_stock_item_type_translation_lang ON public.stock_item_type_translation(language_code);

-- 1.4 location_type_translation
CREATE TABLE public.location_type_translation (
    id SERIAL PRIMARY KEY,
    location_type_id INTEGER NOT NULL REFERENCES public.location_type(location_type_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    location_type_label VARCHAR(60) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (location_type_id, language_code)
);

CREATE INDEX idx_location_type_translation_lang ON public.location_type_translation(language_code);

-- 1.5 organizational_structure_type_translation
CREATE TABLE public.organizational_structure_type_translation (
    id SERIAL PRIMARY KEY,
    organizational_structure_type_id INTEGER NOT NULL REFERENCES public.organizational_structure_type(organizational_structure_type_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    organizational_structure_type VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (organizational_structure_type_id, language_code)
);

CREATE INDEX idx_org_structure_type_translation_lang ON public.organizational_structure_type_translation(language_code);

-- 1.6 physical_condition_translation
CREATE TABLE public.physical_condition_translation (
    id SERIAL PRIMARY KEY,
    condition_id INTEGER NOT NULL REFERENCES public.physical_condition(condition_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    condition_label VARCHAR(12) NOT NULL,
    description VARCHAR(256),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (condition_id, language_code)
);

CREATE INDEX idx_physical_condition_translation_lang ON public.physical_condition_translation(language_code);

-- 1.7 role_translation
CREATE TABLE public.role_translation (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES public.role(role_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    role_label VARCHAR(60) NOT NULL,
    description VARCHAR(256),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (role_id, language_code)
);

CREATE INDEX idx_role_translation_lang ON public.role_translation(language_code);

-- 1.8 position_translation
CREATE TABLE public.position_translation (
    id SERIAL PRIMARY KEY,
    position_id INTEGER NOT NULL REFERENCES public.position(position_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    position_label VARCHAR(60) NOT NULL,
    description VARCHAR(256),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (position_id, language_code)
);

CREATE INDEX idx_position_translation_lang ON public.position_translation(language_code);

-- 1.9 Attribute Definition Translations
CREATE TABLE public.asset_attribute_definition_translation (
    id SERIAL PRIMARY KEY,
    asset_attribute_definition_id INTEGER NOT NULL REFERENCES public.asset_attribute_definition(asset_attribute_definition_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    description VARCHAR(256) NOT NULL,
    unit VARCHAR(24),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (asset_attribute_definition_id, language_code)
);

CREATE INDEX idx_asset_attr_def_translation_lang ON public.asset_attribute_definition_translation(language_code);

CREATE TABLE public.consumable_attribute_definition_translation (
    id SERIAL PRIMARY KEY,
    consumable_attribute_definition_id INTEGER NOT NULL REFERENCES public.consumable_attribute_definition(consumable_attribute_definition_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    description VARCHAR(256) NOT NULL,
    unit VARCHAR(24),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (consumable_attribute_definition_id, language_code)
);

CREATE INDEX idx_consumable_attr_def_translation_lang ON public.consumable_attribute_definition_translation(language_code);

CREATE TABLE public.stock_item_attribute_definition_translation (
    id SERIAL PRIMARY KEY,
    stock_item_attribute_definition_id INTEGER NOT NULL REFERENCES public.stock_item_attribute_definition(stock_item_attribute_definition_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    description VARCHAR(256) NOT NULL,
    unit VARCHAR(24),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (stock_item_attribute_definition_id, language_code)
);

CREATE INDEX idx_stock_item_attr_def_translation_lang ON public.stock_item_attribute_definition_translation(language_code);

-- 1.10 Typical Step Translations
CREATE TABLE public.maintenance_typical_step_translation (
    id SERIAL PRIMARY KEY,
    maintenance_typical_step_id INTEGER NOT NULL REFERENCES public.maintenance_typical_step(maintenance_typical_step_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    description VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (maintenance_typical_step_id, language_code)
);

CREATE INDEX idx_maintenance_typical_step_translation_lang ON public.maintenance_typical_step_translation(language_code);

CREATE TABLE public.external_maintenance_typical_step_translation (
    id SERIAL PRIMARY KEY,
    external_maintenance_typical_step_id INTEGER NOT NULL REFERENCES public.external_maintenance_typical_step(external_maintenance_typical_step_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    description VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (external_maintenance_typical_step_id, language_code)
);

CREATE INDEX idx_ext_maintenance_typical_step_translation_lang ON public.external_maintenance_typical_step_translation(language_code);

-- ============================================================================
-- SECTION 2: ENTITY NAMES (User wants included)
-- ============================================================================

-- 2.1 person_translation
CREATE TABLE public.person_translation (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES public.person(person_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    first_name VARCHAR(48) NOT NULL,
    last_name VARCHAR(48) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (person_id, language_code)
);

CREATE INDEX idx_person_translation_lang ON public.person_translation(language_code);

-- 2.2 supplier_translation
CREATE TABLE public.supplier_translation (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES public.supplier(supplier_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    supplier_name VARCHAR(60) NOT NULL,
    supplier_address VARCHAR(128),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (supplier_id, language_code)
);

CREATE INDEX idx_supplier_translation_lang ON public.supplier_translation(language_code);

-- 2.3 warehouse_translation
CREATE TABLE public.warehouse_translation (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES public.warehouse(warehouse_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    warehouse_name VARCHAR(60) NOT NULL,
    warehouse_address VARCHAR(128),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (warehouse_id, language_code)
);

CREATE INDEX idx_warehouse_translation_lang ON public.warehouse_translation(language_code);

-- 2.4 location_translation
CREATE TABLE public.location_translation (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES public.location(location_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    location_name VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (location_id, language_code)
);

CREATE INDEX idx_location_translation_lang ON public.location_translation(language_code);

-- 2.5 organizational_structure_translation
CREATE TABLE public.organizational_structure_translation (
    id SERIAL PRIMARY KEY,
    organizational_structure_id INTEGER NOT NULL REFERENCES public.organizational_structure(organizational_structure_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    structure_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (organizational_structure_id, language_code)
);

CREATE INDEX idx_org_structure_translation_lang ON public.organizational_structure_translation(language_code);

-- ============================================================================
-- SECTION 3: OPERATIONAL TEXT (User wants included)
-- ============================================================================

-- 3.1 asset_movement_translation (movement_reason is the main text field)
CREATE TABLE public.asset_movement_translation (
    id SERIAL PRIMARY KEY,
    asset_movement_id INTEGER NOT NULL REFERENCES public.asset_movement(asset_movement_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    movement_reason VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (asset_movement_id, language_code)
);

CREATE INDEX idx_asset_movement_translation_lang ON public.asset_movement_translation(language_code);

-- 3.2 consumable_movement_translation
CREATE TABLE public.consumable_movement_translation (
    id SERIAL PRIMARY KEY,
    consumable_movement_id INTEGER NOT NULL REFERENCES public.consumable_movement(consumable_movement_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    movement_reason VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (consumable_movement_id, language_code)
);

CREATE INDEX idx_consumable_movement_translation_lang ON public.consumable_movement_translation(language_code);

-- 3.3 stock_item_movement_translation
CREATE TABLE public.stock_item_movement_translation (
    id SERIAL PRIMARY KEY,
    stock_item_movement_id INTEGER NOT NULL REFERENCES public.stock_item_movement(stock_item_movement_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    movement_reason VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (stock_item_movement_id, language_code)
);

CREATE INDEX idx_stock_item_movement_translation_lang ON public.stock_item_movement_translation(language_code);

-- 3.4 person_reports_problem translations (owner_observation field)
CREATE TABLE public.person_reports_problem_on_asset_translation (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES public.person_reports_problem_on_asset(report_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    owner_observation VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (report_id, language_code)
);

CREATE INDEX idx_person_reports_problem_asset_translation_lang ON public.person_reports_problem_on_asset_translation(language_code);

CREATE TABLE public.person_reports_problem_on_consumable_translation (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES public.person_reports_problem_on_consumable(report_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    owner_observation VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (report_id, language_code)
);

CREATE INDEX idx_person_reports_problem_consumable_translation_lang ON public.person_reports_problem_on_consumable_translation(language_code);

CREATE TABLE public.person_reports_problem_on_stock_item_translation (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES public.person_reports_problem_on_stock_item(report_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    owner_observation VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (report_id, language_code)
);

CREATE INDEX idx_person_reports_problem_stock_item_translation_lang ON public.person_reports_problem_on_stock_item_translation(language_code);

-- 3.5 maintenance_translation (description field)
CREATE TABLE public.maintenance_translation (
    id SERIAL PRIMARY KEY,
    maintenance_id INTEGER NOT NULL REFERENCES public.maintenance(maintenance_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    description VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (maintenance_id, language_code)
);

CREATE INDEX idx_maintenance_translation_lang ON public.maintenance_translation(language_code);

-- 3.6 Condition history translations (notes, cosmetic_issues, functional_issues)
CREATE TABLE public.asset_condition_history_translation (
    id SERIAL PRIMARY KEY,
    asset_condition_history_id INTEGER NOT NULL REFERENCES public.asset_condition_history(asset_condition_history_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    notes VARCHAR(256),
    cosmetic_issues VARCHAR(128),
    functional_issues VARCHAR(128),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (asset_condition_history_id, language_code)
);

CREATE INDEX idx_asset_condition_history_translation_lang ON public.asset_condition_history_translation(language_code);

CREATE TABLE public.consumable_condition_history_translation (
    id SERIAL PRIMARY KEY,
    consumable_condition_history_id INTEGER NOT NULL REFERENCES public.consumable_condition_history(consumable_condition_history_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    notes VARCHAR(256),
    cosmetic_issues VARCHAR(128),
    functional_issues VARCHAR(128),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (consumable_condition_history_id, language_code)
);

CREATE INDEX idx_consumable_condition_history_translation_lang ON public.consumable_condition_history_translation(language_code);

CREATE TABLE public.stock_item_condition_history_translation (
    id SERIAL PRIMARY KEY,
    stock_item_condition_history_id INTEGER NOT NULL REFERENCES public.stock_item_condition_history(stock_item_condition_history_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    notes VARCHAR(256),
    cosmetic_issues VARCHAR(128),
    functional_issues VARCHAR(128),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (stock_item_condition_history_id, language_code)
);

CREATE INDEX idx_stock_item_condition_history_translation_lang ON public.stock_item_condition_history_translation(language_code);

-- ============================================================================
-- SECTION 4: OTHER HUMAN-FACING TEXT FIELDS
-- ============================================================================

-- 4.1 asset, consumable, stock_item name fields
CREATE TABLE public.asset_translation (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES public.asset(asset_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    asset_name VARCHAR(48),
    asset_name_in_the_administrative_certificate VARCHAR(48),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (asset_id, language_code)
);

CREATE INDEX idx_asset_translation_lang ON public.asset_translation(language_code);

CREATE TABLE public.consumable_translation (
    id SERIAL PRIMARY KEY,
    consumable_id INTEGER NOT NULL REFERENCES public.consumable(consumable_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    consumable_name VARCHAR(48),
    consumable_name_in_administrative_certificate VARCHAR(48),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (consumable_id, language_code)
);

CREATE INDEX idx_consumable_translation_lang ON public.consumable_translation(language_code);

CREATE TABLE public.stock_item_translation (
    id SERIAL PRIMARY KEY,
    stock_item_id INTEGER NOT NULL REFERENCES public.stock_item(stock_item_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    stock_item_name VARCHAR(48),
    stock_item_name_in_administrative_certificate VARCHAR(48),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (stock_item_id, language_code)
);

CREATE INDEX idx_stock_item_translation_lang ON public.stock_item_translation(language_code);

-- 4.2 asset_model, consumable_model, stock_item_model notes
CREATE TABLE public.asset_model_translation (
    id SERIAL PRIMARY KEY,
    asset_model_id INTEGER NOT NULL REFERENCES public.asset_model(asset_model_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    model_name VARCHAR(48),
    notes VARCHAR(256),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (asset_model_id, language_code)
);

CREATE INDEX idx_asset_model_translation_lang ON public.asset_model_translation(language_code);

CREATE TABLE public.consumable_model_translation (
    id SERIAL PRIMARY KEY,
    consumable_model_id INTEGER NOT NULL REFERENCES public.consumable_model(consumable_model_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    model_name VARCHAR(48),
    notes VARCHAR(256),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (consumable_model_id, language_code)
);

CREATE INDEX idx_consumable_model_translation_lang ON public.consumable_model_translation(language_code);

CREATE TABLE public.stock_item_model_translation (
    id SERIAL PRIMARY KEY,
    stock_item_model_id INTEGER NOT NULL REFERENCES public.stock_item_model(stock_item_model_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    model_name VARCHAR(48),
    notes VARCHAR(256),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (stock_item_model_id, language_code)
);

CREATE INDEX idx_stock_item_model_translation_lang ON public.stock_item_model_translation(language_code);

-- 4.3 administrative_certificate interested_organization
CREATE TABLE public.administrative_certificate_translation (
    id SERIAL PRIMARY KEY,
    administrative_certificate_id INTEGER NOT NULL REFERENCES public.administrative_certificate(administrative_certificate_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    interested_organization VARCHAR(60),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (administrative_certificate_id, language_code)
);

CREATE INDEX idx_admin_cert_translation_lang ON public.administrative_certificate_translation(language_code);

-- 4.4 company_asset_request text fields
CREATE TABLE public.company_asset_request_translation (
    id SERIAL PRIMARY KEY,
    company_asset_request_id INTEGER NOT NULL REFERENCES public.company_asset_request(company_asset_request_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    title_of_demand VARCHAR(24),
    organization_body_designation VARCHAR(60),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (company_asset_request_id, language_code)
);

CREATE INDEX idx_company_asset_request_translation_lang ON public.company_asset_request_translation(language_code);

-- 4.5 external_maintenance_document decision
CREATE TABLE public.external_maintenance_document_translation (
    id SERIAL PRIMARY KEY,
    external_maintenance_document_id INTEGER NOT NULL REFERENCES public.external_maintenance_document(external_maintenance_document_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    maintenance_provider_final_decision VARCHAR(60),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (external_maintenance_document_id, language_code)
);

CREATE INDEX idx_ext_maintenance_doc_translation_lang ON public.external_maintenance_document_translation(language_code);

-- 4.6 maintenance_step_item_request note
CREATE TABLE public.maintenance_step_item_request_translation (
    id SERIAL PRIMARY KEY,
    maintenance_step_item_request_id INTEGER NOT NULL REFERENCES public.maintenance_step_item_request(maintenance_step_item_request_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    note VARCHAR(256),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (maintenance_step_item_request_id, language_code)
);

CREATE INDEX idx_maintenance_step_item_request_translation_lang ON public.maintenance_step_item_request_translation(language_code);

-- ============================================================================
-- SECTION 5: DATA MIGRATION - Copy existing data as English default
-- ============================================================================

-- 5.1 Reference/Dictionary Data
INSERT INTO public.asset_type_translation (asset_type_id, language_code, asset_type_label, created_at, updated_at)
SELECT asset_type_id, 'en', asset_type_label, NOW(), NOW() FROM public.asset_type WHERE asset_type_label IS NOT NULL;

INSERT INTO public.consumable_type_translation (consumable_type_id, language_code, consumable_type_label, created_at, updated_at)
SELECT consumable_type_id, 'en', consumable_type_label, NOW(), NOW() FROM public.consumable_type WHERE consumable_type_label IS NOT NULL;

INSERT INTO public.stock_item_type_translation (stock_item_type_id, language_code, stock_item_type_label, created_at, updated_at)
SELECT stock_item_type_id, 'en', stock_item_type_label, NOW(), NOW() FROM public.stock_item_type WHERE stock_item_type_label IS NOT NULL;

INSERT INTO public.location_type_translation (location_type_id, language_code, location_type_label, created_at, updated_at)
SELECT location_type_id, 'en', location_type_label, NOW(), NOW() FROM public.location_type WHERE location_type_label IS NOT NULL;

INSERT INTO public.organizational_structure_type_translation (organizational_structure_type_id, language_code, organizational_structure_type, created_at, updated_at)
SELECT organizational_structure_type_id, 'en', organizational_structure_type, NOW(), NOW() FROM public.organizational_structure_type WHERE organizational_structure_type IS NOT NULL;

INSERT INTO public.physical_condition_translation (condition_id, language_code, condition_label, description, created_at, updated_at)
SELECT condition_id, 'en', condition_label, description, NOW(), NOW() FROM public.physical_condition WHERE condition_label IS NOT NULL OR description IS NOT NULL;

INSERT INTO public.role_translation (role_id, language_code, role_label, description, created_at, updated_at)
SELECT role_id, 'en', role_label, description, NOW(), NOW() FROM public.role WHERE role_label IS NOT NULL OR description IS NOT NULL;

INSERT INTO public.position_translation (position_id, language_code, position_label, description, created_at, updated_at)
SELECT position_id, 'en', position_label, description, NOW(), NOW() FROM public.position WHERE position_label IS NOT NULL OR description IS NOT NULL;

INSERT INTO public.asset_attribute_definition_translation (asset_attribute_definition_id, language_code, description, unit, created_at, updated_at)
SELECT asset_attribute_definition_id, 'en', description, unit, NOW(), NOW() FROM public.asset_attribute_definition WHERE description IS NOT NULL OR unit IS NOT NULL;

INSERT INTO public.consumable_attribute_definition_translation (consumable_attribute_definition_id, language_code, description, unit, created_at, updated_at)
SELECT consumable_attribute_definition_id, 'en', description, unit, NOW(), NOW() FROM public.consumable_attribute_definition WHERE description IS NOT NULL OR unit IS NOT NULL;

INSERT INTO public.stock_item_attribute_definition_translation (stock_item_attribute_definition_id, language_code, description, unit, created_at, updated_at)
SELECT stock_item_attribute_definition_id, 'en', description, unit, NOW(), NOW() FROM public.stock_item_attribute_definition WHERE description IS NOT NULL OR unit IS NOT NULL;

INSERT INTO public.maintenance_typical_step_translation (maintenance_typical_step_id, language_code, description, created_at, updated_at)
SELECT maintenance_typical_step_id, 'en', description, NOW(), NOW() FROM public.maintenance_typical_step WHERE description IS NOT NULL;

INSERT INTO public.external_maintenance_typical_step_translation (external_maintenance_typical_step_id, language_code, description, created_at, updated_at)
SELECT external_maintenance_typical_step_id, 'en', description, NOW(), NOW() FROM public.external_maintenance_typical_step WHERE description IS NOT NULL;

-- 5.2 Entity Names
INSERT INTO public.person_translation (person_id, language_code, first_name, last_name, created_at, updated_at)
SELECT person_id, 'en', first_name, last_name, NOW(), NOW() FROM public.person WHERE first_name IS NOT NULL OR last_name IS NOT NULL;

INSERT INTO public.supplier_translation (supplier_id, language_code, supplier_name, supplier_address, created_at, updated_at)
SELECT supplier_id, 'en', supplier_name, supplier_address, NOW(), NOW() FROM public.supplier WHERE supplier_name IS NOT NULL OR supplier_address IS NOT NULL;

INSERT INTO public.warehouse_translation (warehouse_id, language_code, warehouse_name, warehouse_address, created_at, updated_at)
SELECT warehouse_id, 'en', warehouse_name, warehouse_address, NOW(), NOW() FROM public.warehouse WHERE warehouse_name IS NOT NULL OR warehouse_address IS NOT NULL;

INSERT INTO public.location_translation (location_id, language_code, location_name, created_at, updated_at)
SELECT location_id, 'en', location_name, NOW(), NOW() FROM public.location WHERE location_name IS NOT NULL;

INSERT INTO public.organizational_structure_translation (organizational_structure_id, language_code, structure_name, created_at, updated_at)
SELECT organizational_structure_id, 'en', structure_name, NOW(), NOW() FROM public.organizational_structure WHERE structure_name IS NOT NULL;

-- 5.3 Operational Text
INSERT INTO public.asset_movement_translation (asset_movement_id, language_code, movement_reason, created_at, updated_at)
SELECT asset_movement_id, 'en', movement_reason, NOW(), NOW() FROM public.asset_movement WHERE movement_reason IS NOT NULL;

INSERT INTO public.consumable_movement_translation (consumable_movement_id, language_code, movement_reason, created_at, updated_at)
SELECT consumable_movement_id, 'en', movement_reason, NOW(), NOW() FROM public.consumable_movement WHERE movement_reason IS NOT NULL;

INSERT INTO public.stock_item_movement_translation (stock_item_movement_id, language_code, movement_reason, created_at, updated_at)
SELECT stock_item_movement_id, 'en', movement_reason, NOW(), NOW() FROM public.stock_item_movement WHERE movement_reason IS NOT NULL;

INSERT INTO public.person_reports_problem_on_asset_translation (report_id, language_code, owner_observation, created_at, updated_at)
SELECT report_id, 'en', owner_observation, NOW(), NOW() FROM public.person_reports_problem_on_asset WHERE owner_observation IS NOT NULL;

INSERT INTO public.person_reports_problem_on_consumable_translation (report_id, language_code, owner_observation, created_at, updated_at)
SELECT report_id, 'en', owner_observation, NOW(), NOW() FROM public.person_reports_problem_on_consumable WHERE owner_observation IS NOT NULL;

INSERT INTO public.person_reports_problem_on_stock_item_translation (report_id, language_code, owner_observation, created_at, updated_at)
SELECT report_id, 'en', owner_observation, NOW(), NOW() FROM public.person_reports_problem_on_stock_item WHERE owner_observation IS NOT NULL;

INSERT INTO public.maintenance_translation (maintenance_id, language_code, description, created_at, updated_at)
SELECT maintenance_id, 'en', description, NOW(), NOW() FROM public.maintenance WHERE description IS NOT NULL;

INSERT INTO public.asset_condition_history_translation (asset_condition_history_id, language_code, notes, cosmetic_issues, functional_issues, created_at, updated_at)
SELECT asset_condition_history_id, 'en', notes, cosmetic_issues, functional_issues, NOW(), NOW() FROM public.asset_condition_history WHERE notes IS NOT NULL OR cosmetic_issues IS NOT NULL OR functional_issues IS NOT NULL;

INSERT INTO public.consumable_condition_history_translation (consumable_condition_history_id, language_code, notes, cosmetic_issues, functional_issues, created_at, updated_at)
SELECT consumable_condition_history_id, 'en', notes, cosmetic_issues, functional_issues, NOW(), NOW() FROM public.consumable_condition_history WHERE notes IS NOT NULL OR cosmetic_issues IS NOT NULL OR functional_issues IS NOT NULL;

INSERT INTO public.stock_item_condition_history_translation (stock_item_condition_history_id, language_code, notes, cosmetic_issues, functional_issues, created_at, updated_at)
SELECT stock_item_condition_history_id, 'en', notes, cosmetic_issues, functional_issues, NOW(), NOW() FROM public.stock_item_condition_history WHERE notes IS NOT NULL OR cosmetic_issues IS NOT NULL OR functional_issues IS NOT NULL;

-- 5.4 Other Human-Facing Text
INSERT INTO public.asset_translation (asset_id, language_code, asset_name, asset_name_in_the_administrative_certificate, created_at, updated_at)
SELECT asset_id, 'en', asset_name, asset_name_in_the_administrative_certificate, NOW(), NOW() FROM public.asset WHERE asset_name IS NOT NULL OR asset_name_in_the_administrative_certificate IS NOT NULL;

INSERT INTO public.consumable_translation (consumable_id, language_code, consumable_name, consumable_name_in_administrative_certificate, created_at, updated_at)
SELECT consumable_id, 'en', consumable_name, consumable_name_in_administrative_certificate, NOW(), NOW() FROM public.consumable WHERE consumable_name IS NOT NULL OR consumable_name_in_administrative_certificate IS NOT NULL;

INSERT INTO public.stock_item_translation (stock_item_id, language_code, stock_item_name, stock_item_name_in_administrative_certificate, created_at, updated_at)
SELECT stock_item_id, 'en', stock_item_name, stock_item_name_in_administrative_certificate, NOW(), NOW() FROM public.stock_item WHERE stock_item_name IS NOT NULL OR stock_item_name_in_administrative_certificate IS NOT NULL;

INSERT INTO public.asset_model_translation (asset_model_id, language_code, model_name, notes, created_at, updated_at)
SELECT asset_model_id, 'en', model_name, notes, NOW(), NOW() FROM public.asset_model WHERE model_name IS NOT NULL OR notes IS NOT NULL;

INSERT INTO public.consumable_model_translation (consumable_model_id, language_code, model_name, notes, created_at, updated_at)
SELECT consumable_model_id, 'en', model_name, notes, NOW(), NOW() FROM public.consumable_model WHERE model_name IS NOT NULL OR notes IS NOT NULL;

INSERT INTO public.stock_item_model_translation (stock_item_model_id, language_code, model_name, notes, created_at, updated_at)
SELECT stock_item_model_id, 'en', model_name, notes, NOW(), NOW() FROM public.stock_item_model WHERE model_name IS NOT NULL OR notes IS NOT NULL;

INSERT INTO public.administrative_certificate_translation (administrative_certificate_id, language_code, interested_organization, created_at, updated_at)
SELECT administrative_certificate_id, 'en', interested_organization, NOW(), NOW() FROM public.administrative_certificate WHERE interested_organization IS NOT NULL;

INSERT INTO public.company_asset_request_translation (company_asset_request_id, language_code, title_of_demand, organization_body_designation, created_at, updated_at)
SELECT company_asset_request_id, 'en', title_of_demand, organization_body_designation, NOW(), NOW() FROM public.company_asset_request WHERE title_of_demand IS NOT NULL OR organization_body_designation IS NOT NULL;

INSERT INTO public.external_maintenance_document_translation (external_maintenance_document_id, language_code, maintenance_provider_final_decision, created_at, updated_at)
SELECT external_maintenance_document_id, 'en', maintenance_provider_final_decision, NOW(), NOW() FROM public.external_maintenance_document WHERE maintenance_provider_final_decision IS NOT NULL;

INSERT INTO public.maintenance_step_item_request_translation (maintenance_step_item_request_id, language_code, note, created_at, updated_at)
SELECT maintenance_step_item_request_id, 'en', note, NOW(), NOW() FROM public.maintenance_step_item_request WHERE note IS NOT NULL;

-- ============================================================================
-- Migration Complete
-- ============================================================================
