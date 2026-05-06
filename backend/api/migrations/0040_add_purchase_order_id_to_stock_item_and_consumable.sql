-- Add purchase_order_id column to stock_item and consumable tables
-- This links individual item instances to the purchase order that brought them in.

ALTER TABLE public.stock_item ADD COLUMN IF NOT EXISTS purchase_order_id integer;
ALTER TABLE public.consumable ADD COLUMN IF NOT EXISTS purchase_order_id integer;

-- Add foreign key constraints
ALTER TABLE public.stock_item
    ADD CONSTRAINT fk_stock_item_purchase_order
    FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE public.consumable
    ADD CONSTRAINT fk_consumable_purchase_order
    FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(purchase_order_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT;

-- Add indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_stock_item_purchase_order_id ON public.stock_item (purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_consumable_purchase_order_id ON public.consumable (purchase_order_id);
