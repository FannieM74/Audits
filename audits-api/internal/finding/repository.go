package finding

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Finding struct {
	ID                    uuid.UUID  `json:"id"`
	AuditID               uuid.UUID  `json:"audit_id"`
	AuditorID             uuid.UUID  `json:"auditor_id"`
	NcrRef                string     `json:"ncr_ref"`
	DateRaised            string     `json:"date_raised"`
	RaisedByName          string     `json:"raised_by_name"`
	RaisedBySapNo         string     `json:"raised_by_sap_no"`
	ContactDetails        string     `json:"contact_details"`
	OriginNcr             string     `json:"origin_ncr"`
	TypeNcr               string     `json:"type_ncr"`
	ItemNo                string     `json:"item_no"`
	SerialBatchNo         string     `json:"serial_batch_no"`
	CustomerName          string     `json:"customer_name"`
	VendorName            string     `json:"vendor_name"`
	VendorNo              string     `json:"vendor_no"`
	ContravenedClause     string     `json:"contravened_clause"`
	Priority              string     `json:"priority"`

	RespPersonIntName     string     `json:"resp_person_int_name"`
	RespPersonIntSap      string     `json:"resp_person_int_sap"`
	RespPersonExtName     string     `json:"resp_person_ext_name"`
	RaisedByBusinessID    *uuid.UUID `json:"raised_by_business_id"`
	RaisedAgainstBusinessID *uuid.UUID `json:"raised_against_business_id"`
	RaisedByBusinessName    *string  `json:"raised_by_business_name,omitempty"`
	RaisedAgainstBusinessName *string `json:"raised_against_business_name,omitempty"`
	RaisedByBusinessPlant   *string  `json:"raised_by_business_plant,omitempty"`
	RaisedAgainstBusinessPlant *string `json:"raised_against_business_plant,omitempty"`
	Description           string     `json:"description"`
	WorkTypeProcess       string     `json:"work_type_process"`
	ImmediateActionTaken  bool       `json:"immediate_action_taken"`
	ActionAgreedApproved  bool       `json:"action_agreed_approved"`
	StopCertificateIssued bool       `json:"stop_certificate_issued"`
	Status                string     `json:"status"`
	Completion            int        `json:"completion"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
	Photos                []Photo    `json:"photos"`
}

type Photo struct {
	ID        uuid.UUID `json:"id"`
	FindingID uuid.UUID `json:"finding_id"`
	URL       string    `json:"url"`
	CreatedAt time.Time `json:"created_at"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

const findingCols = `id, audit_id, auditor_id, ncr_ref, date_raised, raised_by_name, raised_by_sap_no,
    contact_details, origin_ncr, type_ncr,
    item_no, serial_batch_no, customer_name, vendor_name, vendor_no, contravened_clause,
    priority, resp_person_int_name, resp_person_int_sap, resp_person_ext_name,
    raised_by_business_id, raised_against_business_id, description, work_type_process,
    immediate_action_taken, action_agreed_approved, stop_certificate_issued, status, completion,
    created_at, updated_at`

func scanFinding(scanner interface {
	Scan(dest ...any) error
}, f *Finding) error {
	var dateRaised time.Time
	err := scanner.Scan(
		&f.ID, &f.AuditID, &f.AuditorID, &f.NcrRef, &dateRaised, &f.RaisedByName, &f.RaisedBySapNo,
		&f.ContactDetails, &f.OriginNcr, &f.TypeNcr,
		&f.ItemNo, &f.SerialBatchNo, &f.CustomerName, &f.VendorName, &f.VendorNo, &f.ContravenedClause,
		&f.Priority, &f.RespPersonIntName, &f.RespPersonIntSap, &f.RespPersonExtName,
		&f.RaisedByBusinessID, &f.RaisedAgainstBusinessID, &f.Description, &f.WorkTypeProcess,
		&f.ImmediateActionTaken, &f.ActionAgreedApproved, &f.StopCertificateIssued, &f.Status, &f.Completion,
		&f.CreatedAt, &f.UpdatedAt,
	)
	if err != nil {
		return err
	}
	f.DateRaised = dateRaised.Format("2006-01-02")
	return nil
}

func (r *Repository) ListByAudit(ctx context.Context, auditID uuid.UUID) ([]Finding, error) {
	rows, err := r.pool.Query(ctx, `SELECT `+findingCols+` FROM findings WHERE audit_id = $1 ORDER BY created_at DESC`, auditID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var findings []Finding
	for rows.Next() {
		var f Finding
		if err := scanFinding(rows, &f); err != nil {
			return nil, err
		}
		findings = append(findings, f)
	}
	return findings, nil
}

func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*Finding, error) {
	var f Finding
	if err := scanFinding(r.pool.QueryRow(ctx, `SELECT `+findingCols+` FROM findings WHERE id = $1`, id), &f); err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &f, nil
}

func (r *Repository) Create(ctx context.Context, f *Finding) error {
	dateRaised, _ := time.Parse("2006-01-02", f.DateRaised)
	return r.pool.QueryRow(ctx, `
		INSERT INTO findings (audit_id, auditor_id, ncr_ref, date_raised, raised_by_name, raised_by_sap_no,
			contact_details, origin_ncr, type_ncr,
			item_no, serial_batch_no, customer_name, vendor_name, vendor_no, contravened_clause,
			priority, resp_person_int_name, resp_person_int_sap, resp_person_ext_name,
			raised_by_business_id, raised_against_business_id, description, work_type_process,
			immediate_action_taken, action_agreed_approved, stop_certificate_issued,
			completion)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
		RETURNING id, created_at, updated_at
	`,
		f.AuditID, f.AuditorID, f.NcrRef, dateRaised, f.RaisedByName, f.RaisedBySapNo,
		f.ContactDetails, f.OriginNcr, f.TypeNcr,
		f.ItemNo, f.SerialBatchNo, f.CustomerName, f.VendorName, f.VendorNo, f.ContravenedClause,
		f.Priority, f.RespPersonIntName, f.RespPersonIntSap, f.RespPersonExtName,
		f.RaisedByBusinessID, f.RaisedAgainstBusinessID, f.Description, f.WorkTypeProcess,
		f.ImmediateActionTaken, f.ActionAgreedApproved, f.StopCertificateIssued,
		f.Completion,
	).Scan(&f.ID, &f.CreatedAt, &f.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, f *Finding) error {
	dateRaised, _ := time.Parse("2006-01-02", f.DateRaised)
	_, err := r.pool.Exec(ctx, `
		UPDATE findings SET
			ncr_ref=$1, date_raised=$2, raised_by_name=$3, raised_by_sap_no=$4,
			contact_details=$5, origin_ncr=$6, type_ncr=$7,
			item_no=$8, serial_batch_no=$9, customer_name=$10, vendor_name=$11, vendor_no=$12,
			contravened_clause=$13, priority=$14,
			resp_person_int_name=$15, resp_person_int_sap=$16, resp_person_ext_name=$17,
			raised_by_business_id=$18, raised_against_business_id=$19,
			description=$20, work_type_process=$21,
			immediate_action_taken=$22, action_agreed_approved=$23, stop_certificate_issued=$24,
			status=$25, completion=$26, updated_at=NOW()
		WHERE id=$27
	`,
		f.NcrRef, dateRaised, f.RaisedByName, f.RaisedBySapNo,
		f.ContactDetails, f.OriginNcr, f.TypeNcr,
		f.ItemNo, f.SerialBatchNo, f.CustomerName, f.VendorName, f.VendorNo,
		f.ContravenedClause, f.Priority,
		f.RespPersonIntName, f.RespPersonIntSap, f.RespPersonExtName,
		f.RaisedByBusinessID, f.RaisedAgainstBusinessID,
		f.Description, f.WorkTypeProcess,
		f.ImmediateActionTaken, f.ActionAgreedApproved, f.StopCertificateIssued,
		f.Status, f.Completion, f.ID,
	)
	return err
}

func (r *Repository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM findings WHERE id=$1", id)
	return err
}

func (r *Repository) GetPhotos(ctx context.Context, findingID uuid.UUID) ([]Photo, error) {
	rows, err := r.pool.Query(ctx, "SELECT id, finding_id, url, created_at FROM finding_photos WHERE finding_id=$1 ORDER BY created_at", findingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var photos []Photo
	for rows.Next() {
		var p Photo
		if err := rows.Scan(&p.ID, &p.FindingID, &p.URL, &p.CreatedAt); err != nil {
			return nil, err
		}
		photos = append(photos, p)
	}
	return photos, nil
}

func (r *Repository) AddPhoto(ctx context.Context, findingID uuid.UUID, url string) (*Photo, error) {
	var p Photo
	err := r.pool.QueryRow(ctx,
		"INSERT INTO finding_photos (finding_id, url) VALUES ($1, $2) RETURNING id, finding_id, url, created_at",
		findingID, url,
	).Scan(&p.ID, &p.FindingID, &p.URL, &p.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *Repository) DeletePhoto(ctx context.Context, photoID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM finding_photos WHERE id=$1", photoID)
	return err
}

func (r *Repository) CountPhotos(ctx context.Context, findingID uuid.UUID) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM finding_photos WHERE finding_id=$1", findingID).Scan(&count)
	return count, err
}
