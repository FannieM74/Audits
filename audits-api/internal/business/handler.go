package business

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Get("/api/businesses", h.List)
	r.Post("/api/businesses", h.Create)
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	businesses, err := h.svc.List(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to list businesses"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(businesses)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name    string `json:"name"`
		PlantNo string `json:"plant_no"`
		Site    string `json:"site"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}
	b, err := h.svc.Create(r.Context(), req.Name, req.PlantNo, req.Site)
	if err != nil {
		http.Error(w, `{"error":"failed to create business"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(b)
}
