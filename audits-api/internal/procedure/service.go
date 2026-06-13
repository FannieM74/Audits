package procedure

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	repo *Repository
	pool *pgxpool.Pool
}

func NewService(repo *Repository, pool *pgxpool.Pool) *Service {
	return &Service{repo: repo, pool: pool}
}

func (s *Service) ListAll(ctx context.Context) ([]ProcedureItem, error) {
	return s.repo.ListAll(ctx)
}

func (s *Service) ListBySection(ctx context.Context, sectionNumber int) ([]ProcedureItem, error) {
	return s.repo.ListBySection(ctx, sectionNumber)
}

func (s *Service) GetSectionSummaries(ctx context.Context, auditID uuid.UUID) ([]SectionSummary, error) {
	return s.repo.GetSectionSummaries(ctx, auditID)
}

func (s *Service) GetResponsesForSection(ctx context.Context, auditID uuid.UUID, sectionNumber int) ([]ProcedureItem, []AuditProcedureResponse, error) {
	return s.repo.GetResponsesForSection(ctx, auditID, sectionNumber)
}

func (s *Service) SetResponse(ctx context.Context, auditID uuid.UUID, procedureItemID uuid.UUID, response *string, notes string) (*AuditProcedureResponse, error) {
	return s.repo.UpsertResponse(ctx, auditID, procedureItemID, response, notes)
}

func (s *Service) LinkFinding(ctx context.Context, responseID uuid.UUID, findingID uuid.UUID) error {
	return s.repo.LinkFinding(ctx, responseID, findingID)
}
