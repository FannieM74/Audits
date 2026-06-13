package procedure

import (
	"encoding/json"
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
	r.Put("/api/audits/{id}/responses/{itemId}", h.SetResponse)
	r.Post("/api/audits/{id}/responses/{itemId}/finding", h.CreateFindingForResponse)
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
	items, err := h.svc.ListAll(r.Context())
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

	items, responses, err := h.svc.GetResponsesForSection(r.Context(), auditID, section)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get section detail")
		return
	}

	responseMap := make(map[string]*AuditProcedureResponse)
	for i := range responses {
		responseMap[responses[i].ProcedureItemID.String()] = &responses[i]
	}

	type ItemWithResponse struct {
		ProcedureItem
		Response *string    `json:"response"`
		FindingID *uuid.UUID `json:"finding_id,omitempty"`
		Notes    string     `json:"notes"`
	}

	result := make([]ItemWithResponse, len(items))
	for i, item := range items {
		result[i].ProcedureItem = item
		if apr, ok := responseMap[item.ID.String()]; ok {
			result[i].Response = apr.Response
			result[i].FindingID = apr.FindingID
			result[i].Notes = apr.Notes
		}
	}

	writeJSON(w, http.StatusOK, result)
}

type setResponseRequest struct {
	Response  *string `json:"response"`
	Notes     string  `json:"notes"`
}

func (h *Handler) SetResponse(w http.ResponseWriter, r *http.Request) {
	auditID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid audit id")
		return
	}
	itemID, err := uuid.Parse(chi.URLParam(r, "itemId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid item id")
		return
	}

	var req setResponseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	apr, err := h.svc.SetResponse(r.Context(), auditID, itemID, req.Response, req.Notes)
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
	AuditorID         string `json:"auditor_id"`
}

func (h *Handler) CreateFindingForResponse(w http.ResponseWriter, r *http.Request) {
	auditID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid audit id")
		return
	}
	itemID, err := uuid.Parse(chi.URLParam(r, "itemId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid item id")
		return
	}

	var req createFindingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	claims := middleware.GetClaims(r)

	// Upsert response as "no"
	response := "no"
	apr, err := h.svc.SetResponse(r.Context(), auditID, itemID, &response, "")
	if err != nil {
		log.Printf("set response error: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to set response")
		return
	}

	findingID := uuid.New()
	now := time.Now()
	_, err = h.pool.Exec(r.Context(), `
		INSERT INTO findings (id, audit_id, auditor_id, ncr_ref, date_raised, raised_by_name,
			raised_by_sap_no, contact_details, origin_ncr, type_ncr, priority,
			contravened_clause, short_description, description, procedure_item_id, work_type_process,
			status, completion, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
	`,
		findingID, auditID, claims.UserID, req.NcrRef, req.DateRaised, req.RaisedByName,
		req.RaisedBySapNo, req.ContactDetails, req.OriginNcr, req.TypeNcr, req.Priority,
		req.ContravenedClause, req.ShortDescription, req.Description, itemID, req.WorkTypeProcess,
		"open", 0, now, now,
	)
	if err != nil {
		log.Printf("create finding error: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to create finding")
		return
	}

	// Link response to finding
	if err := h.svc.LinkFinding(r.Context(), apr.ID, findingID); err != nil {
		log.Printf("link finding error: %v", err)
	}

	writeJSON(w, http.StatusCreated, map[string]any{"id": findingID})
}
