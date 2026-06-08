package config

import "os"

type Config struct {
	Port      string
	DBURL     string
	JWTSecret string
	UploadDir string
}

func Load() *Config {
	return &Config{
		Port:      getEnv("PORT", "8080"),
		DBURL:     getEnv("DB_URL", "postgres://postgres:postgres@localhost:5432/audits?sslmode=disable"),
		JWTSecret: getEnv("JWT_SECRET", "dev-secret-change-in-production"),
		UploadDir: getEnv("UPLOAD_DIR", "./uploads"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
