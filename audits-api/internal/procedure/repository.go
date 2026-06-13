package procedure

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProcedureItem struct {
	ID               uuid.UUID `json:"id"`
	SectionNumber    int       `json:"section_number"`
	SectionName      string    `json:"section_name"`
	ControlQuestion  string    `json:"control_question"`
	EvidenceRequired string    `json:"evidence_required"`
	TimsRef          string    `json:"tims_ref"`
	SortOrder        int       `json:"sort_order"`
}

type AuditProcedureResponse struct {
	ID              uuid.UUID  `json:"id"`
	AuditID         uuid.UUID  `json:"audit_id"`
	ProcedureItemID uuid.UUID  `json:"procedure_item_id"`
	Response        *string    `json:"response"`
	FindingID       *uuid.UUID `json:"finding_id,omitempty"`
	Notes           string     `json:"notes"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type SectionSummary struct {
	SectionNumber int    `json:"section_number"`
	SectionName   string `json:"section_name"`
	TotalItems    int    `json:"total_items"`
	Answered      int    `json:"answered"`
	Findings      int    `json:"findings"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) ListAll(ctx context.Context) ([]ProcedureItem, error) {
	rows, err := r.pool.Query(ctx, "SELECT id, section_number, section_name, control_question, evidence_required, tims_ref, sort_order FROM procedure_items ORDER BY sort_order")
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

func (r *Repository) ListBySection(ctx context.Context, sectionNumber int) ([]ProcedureItem, error) {
	rows, err := r.pool.Query(ctx, "SELECT id, section_number, section_name, control_question, evidence_required, tims_ref, sort_order FROM procedure_items WHERE section_number=$1 ORDER BY sort_order", sectionNumber)
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

func (r *Repository) GetSectionSummaries(ctx context.Context, auditID uuid.UUID) ([]SectionSummary, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT
			pi.section_number,
			pi.section_name,
			COUNT(*) AS total_items,
			COUNT(apr.response) FILTER (WHERE apr.response IS NOT NULL) AS answered,
			COUNT(apr.finding_id) FILTER (WHERE apr.finding_id IS NOT NULL) AS findings
		FROM procedure_items pi
		LEFT JOIN audit_procedure_responses apr ON apr.procedure_item_id = pi.id AND apr.audit_id = $1
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

func (r *Repository) GetResponsesForSection(ctx context.Context, auditID uuid.UUID, sectionNumber int) ([]ProcedureItem, []AuditProcedureResponse, error) {
	items, err := r.ListBySection(ctx, sectionNumber)
	if err != nil {
		return nil, nil, err
	}
	if len(items) == 0 {
		return items, nil, nil
	}

	rows, err := r.pool.Query(ctx, `
		SELECT id, audit_id, procedure_item_id, response, finding_id, notes, created_at, updated_at
		FROM audit_procedure_responses
		WHERE audit_id = $1 AND procedure_item_id = ANY($2::uuid[])
	`, auditID, itemIDs(items))
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()
	var responses []AuditProcedureResponse
	for rows.Next() {
		var apr AuditProcedureResponse
		if err := rows.Scan(&apr.ID, &apr.AuditID, &apr.ProcedureItemID, &apr.Response, &apr.FindingID, &apr.Notes, &apr.CreatedAt, &apr.UpdatedAt); err != nil {
			return nil, nil, err
		}
		responses = append(responses, apr)
	}
	return items, responses, nil
}

func itemIDs(items []ProcedureItem) []uuid.UUID {
	ids := make([]uuid.UUID, len(items))
	for i, it := range items {
		ids[i] = it.ID
	}
	return ids
}

func (r *Repository) UpsertResponse(ctx context.Context, auditID uuid.UUID, procedureItemID uuid.UUID, response *string, notes string) (*AuditProcedureResponse, error) {
	var apr AuditProcedureResponse
	err := r.pool.QueryRow(ctx, `
		INSERT INTO audit_procedure_responses (audit_id, procedure_item_id, response, notes)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (audit_id, procedure_item_id)
		DO UPDATE SET response = $3, notes = $4, updated_at = NOW()
		RETURNING id, audit_id, procedure_item_id, response, finding_id, notes, created_at, updated_at
	`, auditID, procedureItemID, response, notes).Scan(
		&apr.ID, &apr.AuditID, &apr.ProcedureItemID, &apr.Response, &apr.FindingID, &apr.Notes, &apr.CreatedAt, &apr.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &apr, nil
}

func (r *Repository) LinkFinding(ctx context.Context, responseID uuid.UUID, findingID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, "UPDATE audit_procedure_responses SET finding_id=$1, updated_at=NOW() WHERE id=$2", findingID, responseID)
	return err
}
