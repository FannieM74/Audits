package business

import (
	"context"
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
