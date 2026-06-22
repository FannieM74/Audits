-- Insert "Yes" responses for all evidence items that still lack a response.
-- Controls with findings already got "No" from migration 027.
-- This ensures every control has a response so the XLSX export shows M=Yes/No for all.

INSERT INTO audit_procedure_responses (audit_id, evidence_item_id, response)
SELECT a.id, pei.id, 'Yes'
FROM audits a
CROSS JOIN procedure_evidence_items pei
JOIN procedure_items pi ON pi.id = pei.procedure_item_id
WHERE NOT EXISTS (
    SELECT 1 FROM audit_procedure_responses apr
    WHERE apr.audit_id = a.id AND apr.evidence_item_id = pei.id
)
ON CONFLICT (audit_id, evidence_item_id) DO NOTHING;
