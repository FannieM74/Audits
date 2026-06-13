-- Modify audit_procedure_responses to reference evidence items instead of procedure items
-- Drop old FK and UNIQUE constraint
ALTER TABLE audit_procedure_responses DROP CONSTRAINT IF EXISTS audit_procedure_responses_procedure_item_id_fkey;
ALTER TABLE audit_procedure_responses DROP CONSTRAINT IF EXISTS audit_procedure_responses_audit_id_procedure_item_id_key;

-- Add evidence_item_id column
ALTER TABLE audit_procedure_responses ADD COLUMN evidence_item_id UUID REFERENCES procedure_evidence_items(id) ON DELETE CASCADE;

-- Drop old procedure_item_id column
ALTER TABLE audit_procedure_responses DROP COLUMN procedure_item_id;

-- Add new UNIQUE constraint
ALTER TABLE audit_procedure_responses ADD CONSTRAINT audit_evidence_responses_unique UNIQUE (audit_id, evidence_item_id);
