CREATE TABLE audit_procedure_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    procedure_item_id UUID NOT NULL REFERENCES procedure_items(id) ON DELETE CASCADE,
    response TEXT CHECK (response IN ('yes', 'no')),
    finding_id UUID REFERENCES findings(id) ON DELETE SET NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(audit_id, procedure_item_id)
);
