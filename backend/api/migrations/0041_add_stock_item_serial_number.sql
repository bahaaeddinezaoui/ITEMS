-- Add stock_item_serial_number column to stock_item table
ALTER TABLE public.stock_item
    ADD COLUMN IF NOT EXISTS stock_item_serial_number VARCHAR(48);

COMMENT ON COLUMN public.stock_item.stock_item_serial_number IS 'Serial number of the stock item';
