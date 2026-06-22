package procedure

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/fanniem74/audits-api/internal/middleware"
)

type Handler struct {
	svc              *Service
	pool             *pgxpool.Pool
	xlsxTemplatePath string
	xlsxGenScript    string
}

func NewHandler(svc *Service, pool *pgxpool.Pool, xlsxTemplatePath, xlsxGenScript string) *Handler {
	return &Handler{svc: svc, pool: pool, xlsxTemplatePath: xlsxTemplatePath, xlsxGenScript: xlsxGenScript}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Get("/api/procedures", h.ListAll)
	r.Get("/api/audits/{id}/procedure-sections", h.SectionSummaries)
	r.Get("/api/audits/{id}/procedures/{section}", h.SectionDetail)
	r.Put("/api/audits/{id}/responses/{evidenceItemId}", h.SetResponse)
	r.Post("/api/audits/{id}/controls/{controlId}/finding", h.CreateFindingForControl)
	r.Post("/api/audits/{id}/controls/{controlId}/link-finding", h.LinkFinding)
	r.Get("/api/audits/{id}/orphan-findings", h.ListOrphanFindings)
	r.Get("/api/audits/{id}/procedures/export", h.ExportXLSX)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("json encode error: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func (h *Handler) ListAll(w http.ResponseWriter, r *http.Request) {
	sectionNum := 0
	if s := r.URL.Query().Get("section"); s != "" {
		if n, err := strconv.Atoi(s); err == nil {
			sectionNum = n
		}
	}
	items, err := h.svc.repo.ListControlsBySection(r.Context(), sectionNum)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list procedures")
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *Handler) SectionSummaries(w http.ResponseWriter, r *http.Request) {
	auditID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid audit id")
		return
	}
	summaries, err := h.svc.GetSectionSummaries(r.Context(), auditID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get summaries")
		return
	}
	writeJSON(w, http.StatusOK, summaries)
}

func (h *Handler) SectionDetail(w http.ResponseWriter, r *http.Request) {
	auditID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid audit id")
		return
	}
	sectionStr := chi.URLParam(r, "section")
	section, err := strconv.Atoi(sectionStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid section number")
		return
	}

	result, err := h.svc.GetSectionDetail(r.Context(), auditID, section)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get section detail")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

type setResponseRequest struct {
	Response *string `json:"response"`
	Notes    string  `json:"notes"`
}

func (h *Handler) SetResponse(w http.ResponseWriter, r *http.Request) {
	auditID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid audit id")
		return
	}
	evidenceItemID, err := uuid.Parse(chi.URLParam(r, "evidenceItemId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid evidence item id")
		return
	}

	var req setResponseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	apr, err := h.svc.SetEvidenceResponse(r.Context(), auditID, evidenceItemID, req.Response, req.Notes)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to set response")
		return
	}
	writeJSON(w, http.StatusOK, apr)
}

type createFindingRequest struct {
	NcrRef            string `json:"ncr_ref"`
	DateRaised        string `json:"date_raised"`
	RaisedByName      string `json:"raised_by_name"`
	RaisedBySapNo     string `json:"raised_by_sap_no"`
	ContactDetails    string `json:"contact_details"`
	OriginNcr         string `json:"origin_ncr"`
	TypeNcr           string `json:"type_ncr"`
	Priority          string `json:"priority"`
	ContravenedClause string `json:"contravened_clause"`
	ShortDescription  string `json:"short_description"`
	Description       string `json:"description"`
	WorkTypeProcess   string `json:"work_type_process"`
	Procedure         string `json:"procedure"`
	AuditorID         string `json:"auditor_id"`
}

func (h *Handler) CreateFindingForControl(w http.ResponseWriter, r *http.Request) {
	auditID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid audit id")
		return
	}
	controlID, err := uuid.Parse(chi.URLParam(r, "controlId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid control id")
		return
	}

	var req createFindingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	claims := middleware.GetClaims(r)

	findingID := uuid.New()
	now := time.Now()
	today := now.Format("2006-01-02")

	// Default values for NOT NULL columns
	dateRaised := req.DateRaised
	if dateRaised == "" {
		dateRaised = today
	}
	raisedByName := req.RaisedByName
	if raisedByName == "" {
		raisedByName = claims.Name
	}
	raisedBySapNo := req.RaisedBySapNo
	if raisedBySapNo == "" {
		h.pool.QueryRow(r.Context(), "SELECT sap_no FROM users WHERE id=$1", claims.UserID).Scan(&raisedBySapNo)
	}
	contactDetails := req.ContactDetails
	if contactDetails == "" {
		h.pool.QueryRow(r.Context(), "SELECT work_tel FROM users WHERE id=$1", claims.UserID).Scan(&contactDetails)
	}
	originNcr := req.OriginNcr
	if originNcr == "" {
		originNcr = "Internal"
	}
	typeNcr := req.TypeNcr
	if typeNcr == "" {
		typeNcr = "Non-Conformance"
	}
	workType := req.WorkTypeProcess
	proc := req.Procedure
	if proc == "" {
		proc = "1"
	}

	exists, err := h.svc.repo.FindingExistsForControl(r.Context(), auditID, controlID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check existing finding")
		return
	}
	if exists {
		writeError(w, http.StatusConflict, "a finding already exists for this control")
		return
	}

	var raisedByBusinessID, raisedAgainstBusinessID *uuid.UUID
	var respPersonIntName, respPersonIntSap string
	h.pool.QueryRow(r.Context(),
		"SELECT business_id, raised_by_business_id, raised_against_business_responsible_person, raised_against_business_sap_no FROM audits WHERE id=$1",
		auditID,
	).Scan(&raisedAgainstBusinessID, &raisedByBusinessID, &respPersonIntName, &respPersonIntSap)

	_, err = h.pool.Exec(r.Context(), `
		INSERT INTO findings (
			id, audit_id, auditor_id, date_raised, raised_by_name,
			raised_by_sap_no, contact_details, origin_ncr, type_ncr, priority,
			contravened_clause, short_description, description, procedure_item_id, work_type_process,
			procedure, item_no, serial_batch_no, customer_name, vendor_name, vendor_no,
			resp_person_int_name, resp_person_int_sap, resp_person_ext_name,
			immediate_action_taken, action_agreed_approved, stop_certificate_issued,
			status, completion, created_at, updated_at,
			raised_by_business_id, raised_against_business_id)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
			$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,
			$32,$33)
	`,
		findingID, auditID, claims.UserID, dateRaised, raisedByName,
		raisedBySapNo, contactDetails, originNcr, typeNcr, req.Priority,
		req.ContravenedClause, req.ShortDescription, req.Description, controlID, workType,
		proc, "", "", "", "", "",
		respPersonIntName, respPersonIntSap, "",
		false, false, false,
		"open", 0, now, now,
		raisedByBusinessID, raisedAgainstBusinessID,
	)
	if err != nil {
		log.Printf("create finding error: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to create finding")
		return
	}

	// Auto-create No responses for all evidence items under this control
	if err := h.svc.repo.AutoCreateNoResponses(r.Context(), auditID, controlID, findingID); err != nil {
		log.Printf("auto-create responses error: %v", err)
	}

	writeJSON(w, http.StatusCreated, map[string]any{"id": findingID})
}

func (h *Handler) LinkFinding(w http.ResponseWriter, r *http.Request) {
	auditID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid audit id")
		return
	}
	controlID, err := uuid.Parse(chi.URLParam(r, "controlId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid control id")
		return
	}

	var req struct {
		FindingID uuid.UUID `json:"finding_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	exists, err := h.svc.repo.FindingExistsForControl(r.Context(), auditID, controlID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check existing finding")
		return
	}
	if exists {
		writeError(w, http.StatusConflict, "a finding already exists for this control")
		return
	}

	// Link finding to control
	_, err = h.pool.Exec(r.Context(),
		"UPDATE findings SET procedure_item_id=$1, updated_at=NOW() WHERE id=$2 AND audit_id=$3 AND procedure_item_id IS NULL",
		controlID, req.FindingID, auditID,
	)
	if err != nil {
		log.Printf("link finding error: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to link finding")
		return
	}

	// Auto-create No responses for all evidence items under this control
	if err := h.svc.repo.AutoCreateNoResponses(r.Context(), auditID, controlID, req.FindingID); err != nil {
		log.Printf("auto-create responses error: %v", err)
	}

	writeJSON(w, http.StatusOK, map[string]any{"message": "finding linked"})
}

func (h *Handler) ListOrphanFindings(w http.ResponseWriter, r *http.Request) {
	auditID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid audit id")
		return
	}
	results, err := h.svc.repo.ListOrphanFindings(r.Context(), auditID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list orphan findings")
		return
	}
	if results == nil {
		results = []OrphanFinding{}
	}
	writeJSON(w, http.StatusOK, results)
}

func (h *Handler) ExportXLSX(w http.ResponseWriter, r *http.Request) {
	auditID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid audit id")
		return
	}

	input := map[string]any{
		"audit_id":      auditID.String(),
		"template_path": h.xlsxTemplatePath,
	}
	inputJSON, err := json.Marshal(input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "json marshal error")
		return
	}

	cmd := exec.Command("python3", h.xlsxGenScript)
	cmd.Stdin = bytes.NewReader(inputJSON)
	output, err := cmd.Output()
	if err != nil {
		if ee, ok := err.(*exec.ExitError); ok {
			log.Printf("xlsx generation stderr: %s", string(ee.Stderr))
		}
		writeError(w, http.StatusInternalServerError, "xlsx generation failed")
		return
	}

	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=procedures-%s.xlsx", auditID.String()[:8]))
	w.Write(output)
}
