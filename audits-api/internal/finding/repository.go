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
	DateRaised            time.Time  `json:"date_raised"`
	RaisedByName          string     `json:"raised_by_name"`
	RaisedBySapNo         string     `json:"raised_by_sap_no"`
	ContactDetails        string     `json:"contact_details"`
	OriginLegal           bool       `json:"origin_legal"`
	OriginSystem          bool       `json:"origin_system"`
	OriginOther           bool       `json:"origin_other"`
	TypeEnv               bool       `json:"type_env"`
	TypeHealth            bool       `json:"type_health"`
	TypeRailwaySafety     bool       `json:"type_railway_safety"`
	TypeCustomerComplaint bool       `json:"type_customer_complaint"`
	TypeFire              bool       `json:"type_fire"`
	TypeMaritime          bool       `json:"type_maritime"`
	TypeVendor            bool       `json:"type_vendor"`
	TypeSystemNcr         bool       `json:"type_system_ncr"`
	TypeHazmat            bool       `json:"type_hazmat"`
	TypeQuality           bool       `json:"type_quality"`
	TypeAudit             bool       `json:"type_audit"`
	ItemNo                string     `json:"item_no"`
	SerialBatchNo         string     `json:"serial_batch_no"`
	CustomerName          string     `json:"customer_name"`
	VendorName            string     `json:"vendor_name"`
	VendorNo              string     `json:"vendor_no"`
	ContravenedClause     string     `json:"contravened_clause"`
	Priority              string     `json:"priority"`
	AreaOfConcern         string     `json:"area_of_concern"`
	RespPersonIntName     string     `json:"resp_person_int_name"`
	RespPersonIntSap      string     `json:"resp_person_int_sap"`
	RespPersonExtName     string     `json:"resp_person_ext_name"`
	RaisedByBusinessID    *uuid.UUID `json:"raised_by_business_id"`
	RaisedAgainstBusinessID *uuid.UUID `json:"raised_against_business_id"`
	Description           string     `json:"description"`
	WorkTypeProcess       string     `json:"work_type_process"`
	ImmediateActionTaken  bool       `json:"immediate_action_taken"`
	ActionAgreedApproved  bool       `json:"action_agreed_approved"`
	StopCertificateIssued bool       `json:"stop_certificate_issued"`
	Status                string     `json:"status"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
	Photos                []Photo    `json:"photos,omitempty"`
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
    contact_details, origin_legal, origin_system, origin_other,
    type_env, type_health, type_railway_safety, type_customer_complaint, type_fire,
    type_maritime, type_vendor, type_system_ncr, type_hazmat, type_quality, type_audit,
    item_no, serial_batch_no, customer_name, vendor_name, vendor_no, contravened_clause,
    priority, area_of_concern, resp_person_int_name, resp_person_int_sap, resp_person_ext_name,
    raised_by_business_id, raised_against_business_id, description, work_type_process,
    immediate_action_taken, action_agreed_approved, stop_certificate_issued, status,
    created_at, updated_at`

func scanFinding(scanner interface {
	Scan(dest ...any) error
}, f *Finding) error {
	return scanner.Scan(
		&f.ID, &f.AuditID, &f.AuditorID, &f.NcrRef, &f.DateRaised, &f.RaisedByName, &f.RaisedBySapNo,
		&f.ContactDetails, &f.OriginLegal, &f.OriginSystem, &f.OriginOther,
		&f.TypeEnv, &f.TypeHealth, &f.TypeRailwaySafety, &f.TypeCustomerComplaint, &f.TypeFire,
		&f.TypeMaritime, &f.TypeVendor, &f.TypeSystemNcr, &f.TypeHazmat, &f.TypeQuality, &f.TypeAudit,
		&f.ItemNo, &f.SerialBatchNo, &f.CustomerName, &f.VendorName, &f.VendorNo, &f.ContravenedClause,
		&f.Priority, &f.AreaOfConcern, &f.RespPersonIntName, &f.RespPersonIntSap, &f.RespPersonExtName,
		&f.RaisedByBusinessID, &f.RaisedAgainstBusinessID, &f.Description, &f.WorkTypeProcess,
		&f.ImmediateActionTaken, &f.ActionAgreedApproved, &f.StopCertificateIssued, &f.Status,
		&f.CreatedAt, &f.UpdatedAt,
	)
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
	err := r.pool.QueryRow(ctx, `SELECT `+findingCols+` FROM findings WHERE id = $1`, id).Scan(
		&f.ID, &f.AuditID, &f.AuditorID, &f.NcrRef, &f.DateRaised, &f.RaisedByName, &f.RaisedBySapNo,
		&f.ContactDetails, &f.OriginLegal, &f.OriginSystem, &f.OriginOther,
		&f.TypeEnv, &f.TypeHealth, &f.TypeRailwaySafety, &f.TypeCustomerComplaint, &f.TypeFire,
		&f.TypeMaritime, &f.TypeVendor, &f.TypeSystemNcr, &f.TypeHazmat, &f.TypeQuality, &f.TypeAudit,
		&f.ItemNo, &f.SerialBatchNo, &f.CustomerName, &f.VendorName, &f.VendorNo, &f.ContravenedClause,
		&f.Priority, &f.AreaOfConcern, &f.RespPersonIntName, &f.RespPersonIntSap, &f.RespPersonExtName,
		&f.RaisedByBusinessID, &f.RaisedAgainstBusinessID, &f.Description, &f.WorkTypeProcess,
		&f.ImmediateActionTaken, &f.ActionAgreedApproved, &f.StopCertificateIssued, &f.Status,
		&f.CreatedAt, &f.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &f, nil
}

func (r *Repository) Create(ctx context.Context, f *Finding) error {
	return r.pool.QueryRow(ctx, `
		INSERT INTO findings (audit_id, auditor_id, ncr_ref, date_raised, raised_by_name, raised_by_sap_no,
			contact_details, origin_legal, origin_system, origin_other,
			type_env, type_health, type_railway_safety, type_customer_complaint, type_fire,
			type_maritime, type_vendor, type_system_ncr, type_hazmat, type_quality, type_audit,
			item_no, serial_batch_no, customer_name, vendor_name, vendor_no, contravened_clause,
			priority, area_of_concern, resp_person_int_name, resp_person_int_sap, resp_person_ext_name,
			raised_by_business_id, raised_against_business_id, description, work_type_process,
			immediate_action_taken, action_agreed_approved, stop_certificate_issued)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39)
		RETURNING id, created_at, updated_at
	`,
		f.AuditID, f.AuditorID, f.NcrRef, f.DateRaised, f.RaisedByName, f.RaisedBySapNo,
		f.ContactDetails, f.OriginLegal, f.OriginSystem, f.OriginOther,
		f.TypeEnv, f.TypeHealth, f.TypeRailwaySafety, f.TypeCustomerComplaint, f.TypeFire,
		f.TypeMaritime, f.TypeVendor, f.TypeSystemNcr, f.TypeHazmat, f.TypeQuality, f.TypeAudit,
		f.ItemNo, f.SerialBatchNo, f.CustomerName, f.VendorName, f.VendorNo, f.ContravenedClause,
		f.Priority, f.AreaOfConcern, f.RespPersonIntName, f.RespPersonIntSap, f.RespPersonExtName,
		f.RaisedByBusinessID, f.RaisedAgainstBusinessID, f.Description, f.WorkTypeProcess,
		f.ImmediateActionTaken, f.ActionAgreedApproved, f.StopCertificateIssued,
	).Scan(&f.ID, &f.CreatedAt, &f.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, f *Finding) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE findings SET
			ncr_ref=$1, date_raised=$2, raised_by_name=$3, raised_by_sap_no=$4,
			contact_details=$5, origin_legal=$6, origin_system=$7, origin_other=$8,
			type_env=$9, type_health=$10, type_railway_safety=$11, type_customer_complaint=$12,
			type_fire=$13, type_maritime=$14, type_vendor=$15, type_system_ncr=$16,
			type_hazmat=$17, type_quality=$18, type_audit=$19,
			item_no=$20, serial_batch_no=$21, customer_name=$22, vendor_name=$23, vendor_no=$24,
			contravened_clause=$25, priority=$26, area_of_concern=$27,
			resp_person_int_name=$28, resp_person_int_sap=$29, resp_person_ext_name=$30,
			raised_by_business_id=$31, raised_against_business_id=$32,
			description=$33, work_type_process=$34,
			immediate_action_taken=$35, action_agreed_approved=$36, stop_certificate_issued=$37,
			status=$38, updated_at=NOW()
		WHERE id=$39
	`,
		f.NcrRef, f.DateRaised, f.RaisedByName, f.RaisedBySapNo,
		f.ContactDetails, f.OriginLegal, f.OriginSystem, f.OriginOther,
		f.TypeEnv, f.TypeHealth, f.TypeRailwaySafety, f.TypeCustomerComplaint,
		f.TypeFire, f.TypeMaritime, f.TypeVendor, f.TypeSystemNcr,
		f.TypeHazmat, f.TypeQuality, f.TypeAudit,
		f.ItemNo, f.SerialBatchNo, f.CustomerName, f.VendorName, f.VendorNo,
		f.ContravenedClause, f.Priority, f.AreaOfConcern,
		f.RespPersonIntName, f.RespPersonIntSap, f.RespPersonExtName,
		f.RaisedByBusinessID, f.RaisedAgainstBusinessID,
		f.Description, f.WorkTypeProcess,
		f.ImmediateActionTaken, f.ActionAgreedApproved, f.StopCertificateIssued,
		f.Status, f.ID,
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
