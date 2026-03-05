-- Creates tables to track stock items and consumables that come with an asset
-- in the context of an attribution order, without implying asset composition.

CREATE TABLE IF NOT EXISTS public.attribution_order_asset_stock_item_accessory (
    id SERIAL PRIMARY KEY,
    attribution_order_id integer NOT NULL,
    asset_id integer NOT NULL,
    stock_item_id integer NOT NULL,

    CONSTRAINT fk_ao_assa_attribution_order
        FOREIGN KEY (attribution_order_id)
        REFERENCES public.attribution_order(attribution_order_id)
        ON UPDATE RESTRICT ON DELETE CASCADE,

    CONSTRAINT fk_ao_assa_asset
        FOREIGN KEY (asset_id)
        REFERENCES public.asset(asset_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    CONSTRAINT fk_ao_assa_stock_item
        FOREIGN KEY (stock_item_id)
        REFERENCES public.stock_item(stock_item_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    CONSTRAINT uq_ao_assa_unique
        UNIQUE (attribution_order_id, asset_id, stock_item_id)
);

CREATE INDEX IF NOT EXISTS idx_ao_assa_order ON public.attribution_order_asset_stock_item_accessory(attribution_order_id);
CREATE INDEX IF NOT EXISTS idx_ao_assa_asset ON public.attribution_order_asset_stock_item_accessory(asset_id);
CREATE INDEX IF NOT EXISTS idx_ao_assa_stock_item ON public.attribution_order_asset_stock_item_accessory(stock_item_id);

ALTER TABLE IF EXISTS public.attribution_order_asset_stock_item_accessory
    DROP COLUMN IF EXISTS quantity,
    DROP COLUMN IF EXISTS notes,
    DROP COLUMN IF EXISTS is_mandatory_return,
    DROP COLUMN IF EXISTS returned_datetime;


CREATE TABLE IF NOT EXISTS public.attribution_order_asset_consumable_accessory (
    id SERIAL PRIMARY KEY,
    attribution_order_id integer NOT NULL,
    asset_id integer NOT NULL,
    consumable_id integer NOT NULL,

    CONSTRAINT fk_ao_aca_attribution_order
        FOREIGN KEY (attribution_order_id)
        REFERENCES public.attribution_order(attribution_order_id)
        ON UPDATE RESTRICT ON DELETE CASCADE,

    CONSTRAINT fk_ao_aca_asset
        FOREIGN KEY (asset_id)
        REFERENCES public.asset(asset_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    CONSTRAINT fk_ao_aca_consumable
        FOREIGN KEY (consumable_id)
        REFERENCES public.consumable(consumable_id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    CONSTRAINT uq_ao_aca_unique
        UNIQUE (attribution_order_id, asset_id, consumable_id)
);

CREATE INDEX IF NOT EXISTS idx_ao_aca_order ON public.attribution_order_asset_consumable_accessory(attribution_order_id);
CREATE INDEX IF NOT EXISTS idx_ao_aca_asset ON public.attribution_order_asset_consumable_accessory(asset_id);
CREATE INDEX IF NOT EXISTS idx_ao_aca_consumable ON public.attribution_order_asset_consumable_accessory(consumable_id);

ALTER TABLE IF EXISTS public.attribution_order_asset_consumable_accessory
    DROP COLUMN IF EXISTS quantity,
    DROP COLUMN IF EXISTS notes,
    DROP COLUMN IF EXISTS is_mandatory_return,
    DROP COLUMN IF EXISTS returned_datetime;
