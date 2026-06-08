package finding

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/fanniem74/audits-api/internal/middleware"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Get("/api/audits/{auditId}/findings", h.ListByAudit)
	r.Post("/api/audits/{auditId}/findings", h.Create)
	r.Get("/api/findings/{id}", h.Get)
	r.Put("/api/findings/{id}", h.Update)
	r.Delete("/api/findings/{id}", h.Delete)
	r.Post("/api/findings/{id}/photos", h.UploadPhoto)
	r.Delete("/api/findings/{id}/photos/{photoId}", h.DeletePhoto)
	r.Get("/api/findings/{id}/pdf", h.DownloadPDF)
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

func (h *Handler) ListByAudit(w http.ResponseWriter, r *http.Request) {
	auditID, err := uuid.Parse(chi.URLParam(r, "auditId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid audit id")
		return
	}
	findings, err := h.svc.ListByAudit(r.Context(), auditID)
	if err != nil {
		log.Printf("list findings error: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to list findings")
		return
	}
	writeJSON(w, http.StatusOK, findings)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)
	auditID, err := uuid.Parse(chi.URLParam(r, "auditId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid audit id")
		return
	}
	var f Finding
	if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}
	f.AuditID = auditID
	f.AuditorID = claims.UserID
	if err := h.svc.Create(r.Context(), &f); err != nil {
		log.Printf("create finding error: %v", err)
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, f)
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	f, err := h.svc.GetByID(r.Context(), id)
	if err != nil || f == nil {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	writeJSON(w, http.StatusOK, f)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}

	existing, err := h.svc.GetByID(r.Context(), id)
	if err != nil || existing == nil {
		writeError(w, http.StatusNotFound, "not found")
		return
	}

	if existing.AuditorID != claims.UserID {
		var isLead bool
		h.svc.pool.QueryRow(r.Context(),
			"SELECT lead_auditor_id=$1 FROM audits WHERE id=$2",
			claims.UserID, existing.AuditID).Scan(&isLead)
		if !isLead {
			writeError(w, http.StatusForbidden, "not authorized")
			return
		}
	}

	var f Finding
	if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}
	f.ID = id
	f.AuditID = existing.AuditID
	f.AuditorID = existing.AuditorID
	if err := h.svc.Update(r.Context(), &f); err != nil {
		log.Printf("update finding error: %v", err)
		writeError(w, http.StatusInternalServerError, "update failed")
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaims(r)
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}

	existing, err := h.svc.GetByID(r.Context(), id)
	if err != nil || existing == nil {
		writeError(w, http.StatusNotFound, "not found")
		return
	}

	if existing.AuditorID != claims.UserID {
		var isLead bool
		h.svc.pool.QueryRow(r.Context(),
			"SELECT lead_auditor_id=$1 FROM audits WHERE id=$2",
			claims.UserID, existing.AuditID).Scan(&isLead)
		if !isLead {
			writeError(w, http.StatusForbidden, "not authorized")
			return
		}
	}

	if err := h.svc.Delete(r.Context(), id); err != nil {
		log.Printf("delete finding error: %v", err)
		writeError(w, http.StatusInternalServerError, "delete failed")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) UploadPhoto(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "file too large")
		return
	}

	file, header, err := r.FormFile("photo")
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing photo file")
		return
	}
	defer file.Close()

	photo, err := h.svc.AddPhoto(r.Context(), id, header.Filename, file)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, photo)
}

func (h *Handler) DeletePhoto(w http.ResponseWriter, r *http.Request) {
	photoID, err := uuid.Parse(chi.URLParam(r, "photoId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid photo id")
		return
	}
	if err := h.svc.DeletePhoto(r.Context(), photoID); err != nil {
		writeError(w, http.StatusInternalServerError, "delete failed")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) DownloadPDF(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	f, err := h.svc.GetByID(r.Context(), id)
	if err != nil || f == nil {
		writeError(w, http.StatusNotFound, "not found")
		return
	}

	pdfBytes, err := GeneratePDF(f)
	if err != nil {
		log.Printf("pdf generation error: %v", err)
		writeError(w, http.StatusInternalServerError, "pdf generation failed")
		return
	}

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename="+f.NcrRef+".pdf")
	w.Write(pdfBytes)
}
