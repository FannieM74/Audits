package audit

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Audit struct {
	ID            uuid.UUID  `json:"id"`
	LeadAuditorID uuid.UUID  `json:"lead_auditor_id"`
	Title         string     `json:"title"`
	Description   string     `json:"description"`
	AuditType     string     `json:"audit_type"`
	AuditDays     int        `json:"audit_days"`
	AuditDate     time.Time  `json:"audit_date"`
	Status        string     `json:"status"`
	CreatedAt     time.Time  `json:"created_at"`
	LeadAuditor   *string    `json:"lead_auditor_name,omitempty"`
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
			   a.audit_days, a.audit_date, a.status, a.created_at,
			   u.name || ' ' || u.surname AS lead_auditor_name
		FROM audits a
		JOIN users u ON u.id = a.lead_auditor_id
		LEFT JOIN audit_auditors aa ON aa.audit_id = a.id
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
		if err := rows.Scan(&a.ID, &a.LeadAuditorID, &a.Title, &a.Description, &a.AuditType,
			&a.AuditDays, &a.AuditDate, &a.Status, &a.CreatedAt, &a.LeadAuditor); err != nil {
			return nil, err
		}
		audits = append(audits, a)
	}
	return audits, nil
}

func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*Audit, error) {
	var a Audit
	err := r.pool.QueryRow(ctx, `
		SELECT a.id, a.lead_auditor_id, a.title, a.description, a.audit_type,
			   a.audit_days, a.audit_date, a.status, a.created_at,
			   u.name || ' ' || u.surname AS lead_auditor_name
		FROM audits a
		JOIN users u ON u.id = a.lead_auditor_id
		WHERE a.id = $1
	`, id).Scan(&a.ID, &a.LeadAuditorID, &a.Title, &a.Description, &a.AuditType,
		&a.AuditDays, &a.AuditDate, &a.Status, &a.CreatedAt, &a.LeadAuditor)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &a, nil
}

func (r *Repository) Create(ctx context.Context, a *Audit) error {
	return r.pool.QueryRow(ctx, `
		INSERT INTO audits (lead_auditor_id, title, description, audit_type, audit_days, audit_date)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`, a.LeadAuditorID, a.Title, a.Description, a.AuditType, a.AuditDays, a.AuditDate,
	).Scan(&a.ID, &a.CreatedAt)
}

func (r *Repository) Update(ctx context.Context, a *Audit) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE audits SET title=$1, description=$2, audit_type=$3, audit_days=$4, audit_date=$5, status=$6
		WHERE id=$7 AND lead_auditor_id=$8
	`, a.Title, a.Description, a.AuditType, a.AuditDays, a.AuditDate, a.Status, a.ID, a.LeadAuditorID)
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
