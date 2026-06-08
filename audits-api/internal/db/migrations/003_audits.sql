CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_auditor_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    audit_type TEXT NOT NULL CHECK (audit_type IN ('First Party', 'Second Party', 'Third Party')),
    audit_days INT NOT NULL CHECK (audit_days BETWEEN 1 AND 10),
    audit_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_auditors (
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (audit_id, user_id)
);
