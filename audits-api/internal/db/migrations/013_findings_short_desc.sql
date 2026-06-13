ALTER TABLE findings ADD COLUMN short_description TEXT NOT NULL DEFAULT '';
ALTER TABLE findings ADD COLUMN procedure_item_id UUID REFERENCES procedure_items(id) ON DELETE SET NULL;
