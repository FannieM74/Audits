-- Migration 023 (DELETE FROM procedure_evidence_items) cascade-deleted
-- all rows in audit_procedure_responses via the FK with ON DELETE CASCADE.
-- Restore them from the remaining data: findings linked to controls.
-- Controls with findings → "No" on all their evidence items.
-- Controls without findings → "Yes" on all their evidence items.

INSERT INTO audit_procedure_responses (audit_id, evidence_item_id, response, finding_id)
SELECT f.audit_id, pei.id, 'No', f.id
FROM findings f
JOIN procedure_items pi ON pi.id = f.procedure_item_id
JOIN procedure_evidence_items pei ON pei.procedure_item_id = pi.id
WHERE f.procedure_item_id IS NOT NULL
ON CONFLICT (audit_id, evidence_item_id) DO NOTHING;

INSERT INTO audit_procedure_responses (audit_id, evidence_item_id, response)
SELECT a.id, pei.id, 'Yes'
FROM audits a
JOIN procedure_evidence_items pei ON TRUE
JOIN procedure_items pi ON pi.id = pei.procedure_item_id
WHERE NOT EXISTS (
    SELECT 1 FROM findings f
    WHERE f.audit_id = a.id AND f.procedure_item_id = pi.id
)
ON CONFLICT (audit_id, evidence_item_id) DO NOTHING;
