package config

import "os"

type Config struct {
	Port         string
	DBURL        string
	JWTSecret    string
	UploadDir    string
	TemplatePath   string
	DocxGenScript string
}

func Load() *Config {
	return &Config{
		Port:           getEnv("PORT", "8080"),
		DBURL:          getEnv("DB_URL", "postgres://postgres:postgres@localhost:5432/audits?sslmode=disable"),
		JWTSecret:      getEnv("JWT_SECRET", "dev-secret-change-in-production"),
		UploadDir:      getEnv("UPLOAD_DIR", "./uploads"),
		TemplatePath:   getEnv("TEMPLATE_PATH", "./template.docx"),
		DocxGenScript:  getEnv("DOCX_GEN_SCRIPT", "internal/finding/gen_docx.py"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
