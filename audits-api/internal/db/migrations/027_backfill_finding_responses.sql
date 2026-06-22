-- Migration 023 (DELETE FROM procedure_evidence_items) cascade-deleted responses
-- via the FK on audit_procedure_responses.evidence_item_id (ON DELETE CASCADE).
-- Restore "No" responses for all findings linked to controls.
-- This mirrors the AutoCreateNoResponses logic in the Go handler.

INSERT INTO audit_procedure_responses (audit_id, evidence_item_id, response, finding_id)
SELECT f.audit_id, pei.id, 'No', f.id
FROM findings f
JOIN procedure_items pi ON pi.id = f.procedure_item_id
JOIN procedure_evidence_items pei ON pei.procedure_item_id = pi.id
WHERE f.procedure_item_id IS NOT NULL
ON CONFLICT (audit_id, evidence_item_id) DO UPDATE
SET response = 'No', finding_id = EXCLUDED.finding_id, updated_at = NOW();
