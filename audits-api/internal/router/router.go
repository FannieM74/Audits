package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/fanniem74/audits-api/internal/auth"
	"github.com/fanniem74/audits-api/internal/audit"
	"github.com/fanniem74/audits-api/internal/business"
	"github.com/fanniem74/audits-api/internal/finding"
	"github.com/fanniem74/audits-api/internal/config"
	apimw "github.com/fanniem74/audits-api/internal/middleware"
)

func New(pool *pgxpool.Pool, cfg *config.Config) *chi.Mux {
	r := chi.NewRouter()
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001", "http://192.168.0.218:3001", "http://192.168.0.218:8080"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Auth routes (public)
	authSvc := auth.NewService(pool, cfg.JWTSecret)
	authH := auth.NewHandler(authSvc)
	authH.RegisterRoutes(r)

	// Protected routes
	protected := r.Group(nil)
	protected.Use(apimw.AuthMiddleware(cfg.JWTSecret))

	// Users
	authH.RegisterProtectedRoutes(protected)

	// Businesses
	bizRepo := business.NewRepository(pool)
	bizSvc := business.NewService(bizRepo)
	bizH := business.NewHandler(bizSvc)
	bizH.RegisterRoutes(protected)

	// Audits
	auditRepo := audit.NewRepository(pool)
	auditSvc := audit.NewService(auditRepo)
	auditH := audit.NewHandler(auditSvc)
	auditH.RegisterRoutes(protected)

	// Findings
	findingRepo := finding.NewRepository(pool)
	findingSvc := finding.NewService(findingRepo, pool, cfg.UploadDir)
	findingH := finding.NewHandler(findingSvc, cfg.TemplatePath, cfg.DocxGenScript)
	findingH.RegisterRoutes(protected)

	return r
}
