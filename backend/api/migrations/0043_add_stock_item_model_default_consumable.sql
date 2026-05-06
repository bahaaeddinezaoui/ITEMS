-- Create stock_item_model_default_consumable table
-- Defines default consumables included with a stock item model

CREATE TABLE IF NOT EXISTS stock_item_model_default_consumable (
    id SERIAL PRIMARY KEY,
    stock_item_model_id INTEGER NOT NULL REFERENCES stock_item_model(stock_item_model_id) ON DELETE CASCADE,
    consumable_model_id INTEGER NOT NULL REFERENCES consumable_model(consumable_model_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    notes VARCHAR(256),
    UNIQUE (stock_item_model_id, consumable_model_id)
);
