ALTER TABLE audits ADD COLUMN business_id UUID REFERENCES businesses(id);
