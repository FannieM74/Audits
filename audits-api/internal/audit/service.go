package audit

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ListForUser(ctx context.Context, userID uuid.UUID) ([]Audit, error) {
	return s.repo.ListForUser(ctx, userID)
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*Audit, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) Create(ctx context.Context, a *Audit) error {
	if a.Title == "" {
		return errors.New("title is required")
	}
	return s.repo.Create(ctx, a)
}

func (s *Service) Update(ctx context.Context, a *Audit) error {
	return s.repo.Update(ctx, a)
}

func (s *Service) Delete(ctx context.Context, id, leadAuditorID uuid.UUID) error {
	return s.repo.Delete(ctx, id, leadAuditorID)
}

func (s *Service) AssignAuditor(ctx context.Context, auditID, userID uuid.UUID) error {
	return s.repo.AssignAuditor(ctx, auditID, userID)
}

func (s *Service) RemoveAuditor(ctx context.Context, auditID, userID uuid.UUID) error {
	return s.repo.RemoveAuditor(ctx, auditID, userID)
}
