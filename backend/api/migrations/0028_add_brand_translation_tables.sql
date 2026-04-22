-- ============================================================================
-- Migration: Add brand i18n translation tables
-- Purpose: Support English and Arabic translations for brand names
-- ============================================================================

-- 1. asset_brand_translation
CREATE TABLE public.asset_brand_translation (
    id SERIAL PRIMARY KEY,
    asset_brand_id INTEGER NOT NULL REFERENCES public.asset_brand(asset_brand_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    brand_name VARCHAR(48) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (asset_brand_id, language_code)
);

CREATE INDEX idx_asset_brand_translation_lang ON public.asset_brand_translation(language_code);

-- 2. stock_item_brand_translation
CREATE TABLE public.stock_item_brand_translation (
    id SERIAL PRIMARY KEY,
    stock_item_brand_id INTEGER NOT NULL REFERENCES public.stock_item_brand(stock_item_brand_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    brand_name VARCHAR(48) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (stock_item_brand_id, language_code)
);

CREATE INDEX idx_stock_item_brand_translation_lang ON public.stock_item_brand_translation(language_code);

-- 3. consumable_brand_translation
CREATE TABLE public.consumable_brand_translation (
    id SERIAL PRIMARY KEY,
    consumable_brand_id INTEGER NOT NULL REFERENCES public.consumable_brand(consumable_brand_id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('en', 'ar')),
    brand_name VARCHAR(48) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (consumable_brand_id, language_code)
);

CREATE INDEX idx_consumable_brand_translation_lang ON public.consumable_brand_translation(language_code);

-- ============================================================================
-- DATA MIGRATION - Copy existing brand names as English default
-- ============================================================================

INSERT INTO public.asset_brand_translation (asset_brand_id, language_code, brand_name, created_at, updated_at)
SELECT asset_brand_id, 'en', brand_name, NOW(), NOW() FROM public.asset_brand WHERE brand_name IS NOT NULL;

INSERT INTO public.stock_item_brand_translation (stock_item_brand_id, language_code, brand_name, created_at, updated_at)
SELECT stock_item_brand_id, 'en', brand_name, NOW(), NOW() FROM public.stock_item_brand WHERE brand_name IS NOT NULL;

INSERT INTO public.consumable_brand_translation (consumable_brand_id, language_code, brand_name, created_at, updated_at)
SELECT consumable_brand_id, 'en', brand_name, NOW(), NOW() FROM public.consumable_brand WHERE brand_name IS NOT NULL;
