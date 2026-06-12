package business

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

func (s *Service) List(ctx context.Context) ([]Business, error) {
	return s.repo.List(ctx)
}

func (s *Service) Create(ctx context.Context, name, plantNo, site string) (*Business, error) {
	return s.repo.Create(ctx, name, plantNo, site)
}

func (s *Service) Update(ctx context.Context, id, name, plantNo, site string) (*Business, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return s.repo.Update(ctx, uid, name, plantNo, site)
}

func (s *Service) Delete(ctx context.Context, id string) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return s.repo.Delete(ctx, uid)
}
