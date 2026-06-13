CREATE TABLE section_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_number INTEGER NOT NULL UNIQUE,
    description TEXT NOT NULL
);

CREATE TABLE procedure_evidence_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    procedure_item_id UUID NOT NULL REFERENCES procedure_items(id) ON DELETE CASCADE,
    evidence_text TEXT NOT NULL,
    sub_label TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);
