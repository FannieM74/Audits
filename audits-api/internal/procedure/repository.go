package procedure

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SectionDescription struct {
	ID            uuid.UUID `json:"id"`
	SectionNumber int       `json:"section_number"`
	Description   string    `json:"description"`
}

type ProcedureItem struct {
	ID              uuid.UUID `json:"id"`
	SectionNumber   int       `json:"section_number"`
	SectionName     string    `json:"section_name"`
	ControlQuestion string    `json:"control_question"`
	EvidenceRequired string   `json:"evidence_required"`
	TimsRef         string    `json:"tims_ref"`
	SortOrder       int       `json:"sort_order"`
}

type ProcedureEvidenceItem struct {
	ID              uuid.UUID `json:"id"`
	ProcedureItemID uuid.UUID `json:"procedure_item_id"`
	EvidenceText    string    `json:"evidence_text"`
	SubLabel        *string   `json:"sub_label"`
	SortOrder       int       `json:"sort_order"`
}

type AuditProcedureResponse struct {
	ID             uuid.UUID  `json:"id"`
	AuditID        uuid.UUID  `json:"audit_id"`
	EvidenceItemID uuid.UUID  `json:"evidence_item_id"`
	Response       *string    `json:"response"`
	FindingID      *uuid.UUID `json:"finding_id,omitempty"`
	Notes          string     `json:"notes"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type SectionSummary struct {
	SectionNumber int    `json:"section_number"`
	SectionName   string `json:"section_name"`
	TotalItems    int    `json:"total_items"`
	Answered      int    `json:"answered"`
	Findings      int    `json:"findings"`
}

type ControlWithEvidence struct {
	ProcedureItem
	Evidences []EvidenceWithResponse `json:"evidences"`
	HasFinding bool                  `json:"has_finding"`
	FindingID   *uuid.UUID           `json:"finding_id,omitempty"`
}

type EvidenceWithResponse struct {
	ProcedureEvidenceItem
	Response  *string    `json:"response"`
	FindingID *uuid.UUID `json:"finding_id,omitempty"`
}

type SectionDetailResponse struct {
	SectionDescription *SectionDescription `json:"section_description"`
	SectionNumber      int                `json:"section_number"`
	SectionName        string             `json:"section_name"`
	Controls           []ControlWithEvidence `json:"controls"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) GetSectionDescription(ctx context.Context, sectionNumber int) (*SectionDescription, error) {
	var sd SectionDescription
	err := r.pool.QueryRow(ctx, "SELECT id, section_number, description FROM section_descriptions WHERE section_number=$1", sectionNumber).
		Scan(&sd.ID, &sd.SectionNumber, &sd.Description)
	if err != nil {
		return nil, err
	}
	return &sd, nil
}

func (r *Repository) ListControlsBySection(ctx context.Context, sectionNumber int) ([]ProcedureItem, error) {
	var rows pgx.Rows
	var err error
	if sectionNumber <= 0 {
		rows, err = r.pool.Query(ctx, "SELECT id, section_number, section_name, control_question, evidence_required, tims_ref, sort_order FROM procedure_items ORDER BY sort_order")
	} else {
		rows, err = r.pool.Query(ctx, "SELECT id, section_number, section_name, control_question, evidence_required, tims_ref, sort_order FROM procedure_items WHERE section_number=$1 ORDER BY sort_order", sectionNumber)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ProcedureItem
	for rows.Next() {
		var it ProcedureItem
		if err := rows.Scan(&it.ID, &it.SectionNumber, &it.SectionName, &it.ControlQuestion, &it.EvidenceRequired, &it.TimsRef, &it.SortOrder); err != nil {
			return nil, err
		}
		items = append(items, it)
	}
	return items, nil
}

func (r *Repository) ListEvidenceItems(ctx context.Context, procedureItemIDs []uuid.UUID) ([]ProcedureEvidenceItem, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, procedure_item_id, evidence_text, sub_label, sort_order
		FROM procedure_evidence_items
		WHERE procedure_item_id = ANY($1::uuid[])
		ORDER BY procedure_item_id, sort_order
	`, procedureItemIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ProcedureEvidenceItem
	for rows.Next() {
		var it ProcedureEvidenceItem
		if err := rows.Scan(&it.ID, &it.ProcedureItemID, &it.EvidenceText, &it.SubLabel, &it.SortOrder); err != nil {
			return nil, err
		}
		items = append(items, it)
	}
	return items, nil
}

func (r *Repository) GetEvidenceResponses(ctx context.Context, auditID uuid.UUID, evidenceItemIDs []uuid.UUID) ([]AuditProcedureResponse, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, audit_id, evidence_item_id, response, finding_id, notes, created_at, updated_at
		FROM audit_procedure_responses
		WHERE audit_id = $1 AND evidence_item_id = ANY($2::uuid[])
	`, auditID, evidenceItemIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var responses []AuditProcedureResponse
	for rows.Next() {
		var apr AuditProcedureResponse
		if err := rows.Scan(&apr.ID, &apr.AuditID, &apr.EvidenceItemID, &apr.Response, &apr.FindingID, &apr.Notes, &apr.CreatedAt, &apr.UpdatedAt); err != nil {
			return nil, err
		}
		responses = append(responses, apr)
	}
	return responses, nil
}

func (r *Repository) UpsertEvidenceResponse(ctx context.Context, auditID uuid.UUID, evidenceItemID uuid.UUID, response *string, notes string) (*AuditProcedureResponse, error) {
	var apr AuditProcedureResponse
	err := r.pool.QueryRow(ctx, `
		INSERT INTO audit_procedure_responses (audit_id, evidence_item_id, response, notes)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (audit_id, evidence_item_id)
		DO UPDATE SET response = $3, notes = $4, updated_at = NOW()
		RETURNING id, audit_id, evidence_item_id, response, finding_id, notes, created_at, updated_at
	`, auditID, evidenceItemID, response, notes).Scan(
		&apr.ID, &apr.AuditID, &apr.EvidenceItemID, &apr.Response, &apr.FindingID, &apr.Notes, &apr.CreatedAt, &apr.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &apr, nil
}

func (r *Repository) GetSectionSummaries(ctx context.Context, auditID uuid.UUID) ([]SectionSummary, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT
			pi.section_number,
			pi.section_name,
			COUNT(pei.id) AS total_items,
			COUNT(apr.response) FILTER (WHERE apr.response IS NOT NULL) AS answered,
			COUNT(DISTINCT f.id) FILTER (WHERE f.id IS NOT NULL AND f.procedure_item_id = pi.id) AS findings
		FROM procedure_items pi
		LEFT JOIN procedure_evidence_items pei ON pei.procedure_item_id = pi.id
		LEFT JOIN audit_procedure_responses apr ON apr.evidence_item_id = pei.id AND apr.audit_id = $1
		LEFT JOIN findings f ON f.audit_id = $1 AND f.procedure_item_id = pi.id
		GROUP BY pi.section_number, pi.section_name
		ORDER BY pi.section_number
	`, auditID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var summaries []SectionSummary
	for rows.Next() {
		var s SectionSummary
		if err := rows.Scan(&s.SectionNumber, &s.SectionName, &s.TotalItems, &s.Answered, &s.Findings); err != nil {
			return nil, err
		}
		summaries = append(summaries, s)
	}
	return summaries, nil
}

func (r *Repository) GetFindingForControl(ctx context.Context, auditID uuid.UUID, controlID uuid.UUID) (*uuid.UUID, error) {
	var findingID uuid.UUID
	err := r.pool.QueryRow(ctx, "SELECT id FROM findings WHERE audit_id=$1 AND procedure_item_id=$2 LIMIT 1", auditID, controlID).Scan(&findingID)
	if err != nil {
		return nil, err
	}
	return &findingID, nil
}
