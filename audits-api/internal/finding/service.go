package finding

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	repo      *Repository
	pool      *pgxpool.Pool
	uploadDir string
}

func NewService(repo *Repository, pool *pgxpool.Pool, uploadDir string) *Service {
	return &Service{repo: repo, pool: pool, uploadDir: uploadDir}
}

func (s *Service) ListByAudit(ctx context.Context, auditID uuid.UUID) ([]Finding, error) {
	findings, err := s.repo.ListByAudit(ctx, auditID)
	if err != nil {
		return nil, err
	}
	for i := range findings {
		photos, _ := s.repo.GetPhotos(ctx, findings[i].ID)
		if photos == nil {
			photos = []Photo{}
		}
		findings[i].Photos = photos
	}
	return findings, nil
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*Finding, error) {
	f, err := s.repo.GetByID(ctx, id)
	if err != nil || f == nil {
		return nil, err
	}
	photos, _ := s.repo.GetPhotos(ctx, f.ID)
	if photos == nil {
		photos = []Photo{}
	}
	f.Photos = photos
	return f, nil
}

func (s *Service) Create(ctx context.Context, f *Finding) error {
	if f.NcrRef == "" {
		f.NcrRef = fmt.Sprintf("NCR-%s-%d", time.Now().Format("20060102"), time.Now().UnixMilli()%10000)
	}
	if f.Priority == "" {
		f.Priority = "Observation"
	}
	return s.repo.Create(ctx, f)
}

func (s *Service) Update(ctx context.Context, f *Finding) error {
	return s.repo.Update(ctx, f)
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *Service) AddPhoto(ctx context.Context, findingID uuid.UUID, filename string, file io.Reader) (*Photo, error) {
	count, err := s.repo.CountPhotos(ctx, findingID)
	if err != nil {
		return nil, err
	}
	if count >= 3 {
		return nil, errors.New("maximum 3 photos per finding")
	}

	ext := filepath.Ext(filename)
	photoID := uuid.New()
	savedName := photoID.String() + ext
	savePath := filepath.Join(s.uploadDir, savedName)

	if err := os.MkdirAll(s.uploadDir, 0755); err != nil {
		return nil, err
	}

	dst, err := os.Create(savePath)
	if err != nil {
		return nil, err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return nil, err
	}

	return s.repo.AddPhoto(ctx, findingID, savePath)
}

func (s *Service) DeletePhoto(ctx context.Context, photoID uuid.UUID) error {
	return s.repo.DeletePhoto(ctx, photoID)
}
