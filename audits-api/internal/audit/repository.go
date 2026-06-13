package audit

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AuditorInfo struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type Audit struct {
	ID            uuid.UUID     `json:"id"`
	LeadAuditorID uuid.UUID     `json:"lead_auditor_id"`
	Title         string        `json:"title"`
	Description   string        `json:"description"`
	AuditType     string        `json:"audit_type"`
	AuditDays     int           `json:"audit_days"`
	AuditDate     string        `json:"audit_date"`
	BusinessID    *uuid.UUID    `json:"business_id,omitempty"`
	Status        string        `json:"status"`
	CreatedAt     time.Time     `json:"created_at"`
	LeadAuditor   *string       `json:"lead_auditor_name,omitempty"`
	BusinessName  *string       `json:"business_name,omitempty"`
	Auditors      []AuditorInfo `json:"auditors,omitempty"`
	FindingCount  int           `json:"finding_count"`
	ClosedCount   int           `json:"closed_count"`
	Completion    int           `json:"completion"`
	AuditorNames  string        `json:"auditor_names"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) ListForUser(ctx context.Context, userID uuid.UUID) ([]Audit, error) {
	query := `
		SELECT DISTINCT a.id, a.lead_auditor_id, a.title, a.description, a.audit_type,
			   a.audit_days, a.audit_date, a.business_id, a.status, a.created_at,
			   u.name || ' ' || u.surname AS lead_auditor_name,
			   b.name AS business_name,
			   COALESCE((SELECT COUNT(*) FROM findings WHERE audit_id = a.id), 0) AS finding_count,
			   COALESCE((SELECT COUNT(*) FROM findings WHERE audit_id = a.id AND status = 'closed'), 0) AS closed_count,
			   COALESCE((SELECT ROUND(AVG(completion)) FROM findings WHERE audit_id = a.id), 0) AS completion,
			   COALESCE((SELECT STRING_AGG(u2.name || ' ' || u2.surname, ', ')
				   FROM audit_auditors aa
				   JOIN users u2 ON u2.id = aa.user_id
				   WHERE aa.audit_id = a.id), '') AS auditor_names
		FROM audits a
		JOIN users u ON u.id = a.lead_auditor_id
		LEFT JOIN audit_auditors aa ON aa.audit_id = a.id
		LEFT JOIN businesses b ON b.id = a.business_id
		WHERE a.lead_auditor_id = $1 OR aa.user_id = $1
		ORDER BY a.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var audits []Audit
	for rows.Next() {
		var a Audit
		var auditDate time.Time
		if err := rows.Scan(&a.ID, &a.LeadAuditorID, &a.Title, &a.Description, &a.AuditType,
			&a.AuditDays, &auditDate, &a.BusinessID, &a.Status, &a.CreatedAt, &a.LeadAuditor, &a.BusinessName,
			&a.FindingCount, &a.ClosedCount, &a.Completion, &a.AuditorNames); err != nil {
			return nil, err
		}
		a.AuditDate = auditDate.Format("2006-01-02")
		audits = append(audits, a)
	}
	return audits, nil
}

func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*Audit, error) {
	var a Audit
	var auditDate time.Time
	err := r.pool.QueryRow(ctx, `
		SELECT a.id, a.lead_auditor_id, a.title, a.description, a.audit_type,
			   a.audit_days, a.audit_date, a.business_id, a.status, a.created_at,
			   u.name || ' ' || u.surname AS lead_auditor_name,
			   b.name AS business_name,
			   COALESCE((SELECT COUNT(*) FROM findings WHERE audit_id = a.id), 0) AS finding_count,
			   COALESCE((SELECT COUNT(*) FROM findings WHERE audit_id = a.id AND status = 'closed'), 0) AS closed_count,
			   COALESCE((SELECT ROUND(AVG(completion)) FROM findings WHERE audit_id = a.id), 0) AS completion
		FROM audits a
		JOIN users u ON u.id = a.lead_auditor_id
		LEFT JOIN businesses b ON b.id = a.business_id
		WHERE a.id = $1
	`, id).Scan(&a.ID, &a.LeadAuditorID, &a.Title, &a.Description, &a.AuditType,
		&a.AuditDays, &auditDate, &a.BusinessID, &a.Status, &a.CreatedAt, &a.LeadAuditor, &a.BusinessName,
		&a.FindingCount, &a.ClosedCount, &a.Completion)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	a.AuditDate = auditDate.Format("2006-01-02")
	return &a, nil
}

func (r *Repository) Create(ctx context.Context, a *Audit) error {
	auditDate, _ := time.Parse("2006-01-02", a.AuditDate)
	return r.pool.QueryRow(ctx, `
		INSERT INTO audits (lead_auditor_id, title, description, audit_type, audit_days, audit_date, business_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at
	`, a.LeadAuditorID, a.Title, a.Description, a.AuditType, a.AuditDays, auditDate, a.BusinessID,
	).Scan(&a.ID, &a.CreatedAt)
}

func (r *Repository) Update(ctx context.Context, a *Audit) error {
	auditDate, _ := time.Parse("2006-01-02", a.AuditDate)
	_, err := r.pool.Exec(ctx, `
		UPDATE audits SET title=$1, description=$2, audit_type=$3, audit_days=$4, audit_date=$5, status=$6, business_id=$9
		WHERE id=$7 AND lead_auditor_id=$8
	`, a.Title, a.Description, a.AuditType, a.AuditDays, auditDate, a.Status, a.ID, a.LeadAuditorID, a.BusinessID)
	return err
}

func (r *Repository) Delete(ctx context.Context, id, leadAuditorID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM audits WHERE id=$1 AND lead_auditor_id=$2", id, leadAuditorID)
	return err
}

func (r *Repository) AssignAuditor(ctx context.Context, auditID, userID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, "INSERT INTO audit_auditors (audit_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", auditID, userID)
	return err
}

func (r *Repository) RemoveAuditor(ctx context.Context, auditID, userID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM audit_auditors WHERE audit_id=$1 AND user_id=$2", auditID, userID)
	return err
}

func (r *Repository) GetAuditors(ctx context.Context, auditID uuid.UUID) ([]AuditorInfo, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT aa.user_id, u.name || ' ' || u.surname
		FROM audit_auditors aa
		JOIN users u ON u.id = aa.user_id
		WHERE aa.audit_id = $1
	`, auditID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var auditors []AuditorInfo
	for rows.Next() {
		var a AuditorInfo
		if err := rows.Scan(&a.ID, &a.Name); err != nil {
			return nil, err
		}
		auditors = append(auditors, a)
	}
	return auditors, nil
}

func (r *Repository) GetAuditorIDs(ctx context.Context, auditID uuid.UUID) ([]uuid.UUID, error) {
	rows, err := r.pool.Query(ctx, "SELECT user_id FROM audit_auditors WHERE audit_id=$1", auditID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, nil
}
