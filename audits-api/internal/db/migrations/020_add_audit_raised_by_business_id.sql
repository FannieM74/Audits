ALTER TABLE audits ADD COLUMN raised_by_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL;
