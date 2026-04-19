package config

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// Config is the shared configuration structure used by all microservices
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	CORS     CORSConfig
}

type ServerConfig struct {
	Port string
	Env  string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

type JWTConfig struct {
	Secret string
	Expiry time.Duration
}

type CORSConfig struct {
	AllowedOrigins []string
}

// DSN returns the PostgreSQL connection string
func (d *DatabaseConfig) DSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		d.Host, d.Port, d.User, d.Password, d.Name, d.SSLMode)
}

// Load reads configuration from environment variables with sensible defaults
func Load() (*Config, error) {
	godotenv.Load() // ignore error; .env is optional

	expiry, err := time.ParseDuration(getEnv("JWT_EXPIRY", "24h"))
	if err != nil {
		expiry = 24 * time.Hour
	}

	dbPassword, err := getRequiredEnv("DB_PASSWORD")
	if err != nil {
		return nil, err
	}
	jwtSecret, err := getRequiredEnv("JWT_SECRET")
	if err != nil {
		return nil, err
	}

	origins := strings.Split(getEnv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173"), ",")

	return &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Env:  getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: dbPassword,
			Name:     getEnv("DB_NAME", "estospaces"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		JWT: JWTConfig{
			Secret: jwtSecret,
			Expiry: expiry,
		},
		CORS: CORSConfig{
			AllowedOrigins: origins,
		},
	}, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getRequiredEnv(key string) (string, error) {
	if v := os.Getenv(key); v != "" {
		return v, nil
	}
	return "", fmt.Errorf("%s is required", key)
}
