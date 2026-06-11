package auth

import (
    "context"
    "errors"
    "strings"

    "github.com/google/uuid"
    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgconn"
    "github.com/jackc/pgx/v5/pgxpool"
    "golang.org/x/crypto/bcrypt"
)

var (
    ErrDuplicate         = errors.New("duplicate")
    ErrInvalidCredentials = errors.New("invalid credentials")
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Surname  string `json:"surname"`
	SapNo    string `json:"sap_no"`
	WorkTel  string `json:"work_tel"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string  `json:"token"`
	User  UserDTO `json:"user"`
}

type UserDTO struct {
	ID      uuid.UUID `json:"id"`
	Name    string    `json:"name"`
	Surname string    `json:"surname"`
	SapNo   string    `json:"sap_no"`
	WorkTel string    `json:"work_tel"`
	Email   string    `json:"email"`
}

type Service struct {
	pool      *pgxpool.Pool
	jwtSecret string
}

func NewService(pool *pgxpool.Pool, jwtSecret string) *Service {
	return &Service{pool: pool, jwtSecret: jwtSecret}
}

func (s *Service) Register(ctx context.Context, req RegisterRequest) (*AuthResponse, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	var user UserDTO
	err = s.pool.QueryRow(ctx,
		`INSERT INTO users (name, surname, sap_no, work_tel, email, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, surname, sap_no, work_tel, email`,
		req.Name, req.Surname, req.SapNo, req.WorkTel, strings.ToLower(req.Email), string(hash),
	).Scan(&user.ID, &user.Name, &user.Surname, &user.SapNo, &user.WorkTel, &user.Email)
    if err != nil {
        var pgErr *pgconn.PgError
        if errors.As(err, &pgErr) && pgErr.Code == "23505" {
            return nil, ErrDuplicate
        }
        return nil, err
    }

	token, err := GenerateToken(user.ID, user.Email, user.Name, s.jwtSecret)
	if err != nil {
		return nil, err
	}
	return &AuthResponse{Token: token, User: user}, nil
}

func (s *Service) Login(ctx context.Context, req LoginRequest) (*AuthResponse, error) {
	var (
		id                                          uuid.UUID
		name, surname, sapNo, workTel, email, hash string
	)
	err := s.pool.QueryRow(ctx,
		`SELECT id, name, surname, sap_no, work_tel, email, password_hash FROM users WHERE email = $1`,
		strings.ToLower(req.Email),
	).Scan(&id, &name, &surname, &sapNo, &workTel, &email, &hash)
    if err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return nil, ErrInvalidCredentials
        }
        return nil, err
    }

    if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
        return nil, ErrInvalidCredentials
    }

	token, err := GenerateToken(id, email, name, s.jwtSecret)
	if err != nil {
		return nil, err
	}
	return &AuthResponse{
		Token: token,
		User:  UserDTO{ID: id, Name: name, Surname: surname, SapNo: sapNo, WorkTel: workTel, Email: email},
	}, nil
}

func (s *Service) Pool() *pgxpool.Pool { return s.pool }
func (s *Service) Secret() string { return s.jwtSecret }
