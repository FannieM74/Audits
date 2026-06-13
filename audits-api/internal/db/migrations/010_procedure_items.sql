CREATE TABLE procedure_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_number INTEGER NOT NULL,
    section_name TEXT NOT NULL DEFAULT '',
    control_question TEXT NOT NULL DEFAULT '',
    evidence_required TEXT NOT NULL DEFAULT '',
    tims_ref TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);
