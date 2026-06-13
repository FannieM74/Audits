package procedure

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/fanniem74/audits-api/internal/middleware"
)

type Handler struct {
	svc  *Service
	pool *pgxpool.Pool
}

func NewHandler(svc *Service, pool *pgxpool.Pool) *Handler {
	return &Handler{svc: svc, pool: pool}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Get("/api/procedures", h.ListAll)
	r.Get("/api/audits/{id}/procedure-sections", h.SectionSummaries)
	r.Get("/api/audits/{id}/procedures/{section}", h.SectionDetail)
	r.Put("/api/audits/{id}/responses/{evidenceItemId}", h.SetResponse)
	r.Post("/api/audits/{id}/controls/{controlId}/finding", h.CreateFindingForControl)
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
	items, err := h.svc.repo.ListControlsBySection(r.Context(), 0)
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
	ncrRef := req.NcrRef
	if ncrRef == "" {
		ncrRef = fmt.Sprintf("NCR-%s-%d", auditID.String()[:8], now.UnixMilli()%100000)
	}
	dateRaised := req.DateRaised
	if dateRaised == "" {
		dateRaised = today
	}
	raisedByName := req.RaisedByName
	if raisedByName == "" {
		raisedByName = claims.Name
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

	_, err = h.pool.Exec(r.Context(), `
		INSERT INTO findings (
			id, audit_id, auditor_id, ncr_ref, date_raised, raised_by_name,
			raised_by_sap_no, contact_details, origin_ncr, type_ncr, priority,
			contravened_clause, short_description, description, procedure_item_id, work_type_process,
			procedure, item_no, serial_batch_no, customer_name, vendor_name, vendor_no,
			resp_person_int_name, resp_person_int_sap, resp_person_ext_name,
			immediate_action_taken, action_agreed_approved, stop_certificate_issued,
			status, completion, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
			$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)
	`,
		findingID, auditID, claims.UserID, ncrRef, dateRaised, raisedByName,
		req.RaisedBySapNo, req.ContactDetails, originNcr, typeNcr, req.Priority,
		req.ContravenedClause, req.ShortDescription, req.Description, controlID, workType,
		proc, "", "", "", "", "",
		"", "", "",
		false, false, false,
		"open", 0, now, now,
	)
	if err != nil {
		log.Printf("create finding error: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to create finding")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"id": findingID})
}
