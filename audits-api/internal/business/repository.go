package business

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Business struct {
	ID      uuid.UUID `json:"id"`
	Name    string    `json:"name"`
	PlantNo string    `json:"plant_no"`
	Site    string    `json:"site"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) List(ctx context.Context) ([]Business, error) {
	rows, err := r.pool.Query(ctx, "SELECT id, name, plant_no, site FROM businesses ORDER BY name")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var businesses []Business
	for rows.Next() {
		var b Business
		if err := rows.Scan(&b.ID, &b.Name, &b.PlantNo, &b.Site); err != nil {
			return nil, err
		}
		businesses = append(businesses, b)
	}
	return businesses, nil
}

func (r *Repository) Create(ctx context.Context, name, plantNo, site string) (*Business, error) {
	var b Business
	err := r.pool.QueryRow(ctx,
		"INSERT INTO businesses (name, plant_no, site) VALUES ($1, $2, $3) RETURNING id, name, plant_no, site",
		name, plantNo, site,
	).Scan(&b.ID, &b.Name, &b.PlantNo, &b.Site)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *Repository) Update(ctx context.Context, id uuid.UUID, name, plantNo, site string) (*Business, error) {
	var b Business
	err := r.pool.QueryRow(ctx,
		"UPDATE businesses SET name=$1, plant_no=$2, site=$3 WHERE id=$4 RETURNING id, name, plant_no, site",
		name, plantNo, site, id,
	).Scan(&b.ID, &b.Name, &b.PlantNo, &b.Site)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *Repository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM businesses WHERE id=$1", id)
	return err
}
