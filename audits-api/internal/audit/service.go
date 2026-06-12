package audit

import (
	"context"

	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ListForUser(ctx context.Context, userID uuid.UUID) ([]Audit, error) {
	audits, err := s.repo.ListForUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	if audits == nil {
		audits = []Audit{}
	}
	return audits, nil
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*Audit, error) {
	a, err := s.repo.GetByID(ctx, id)
	if err != nil || a == nil {
		return a, err
	}
	auditors, err := s.repo.GetAuditors(ctx, id)
	if err != nil {
		return nil, err
	}
	a.Auditors = auditors
	return a, nil
}

func (s *Service) Create(ctx context.Context, a *Audit) error {
	if a.Title == "" {
		a.Title = a.AuditType + " Audit"
	}
	return s.repo.Create(ctx, a)
}

func (s *Service) Update(ctx context.Context, a *Audit) error {
	existing, err := s.repo.GetByID(ctx, a.ID)
	if err != nil {
		return err
	}
	if a.Title == "" {
		a.Title = existing.Title
	}
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
