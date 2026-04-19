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

	env := getEnv("ENV", "development")

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

	dbHost, err := getEnvForRuntime("DB_HOST", "localhost", env)
	if err != nil {
		return nil, err
	}
	dbUser, err := getEnvForRuntime("DB_USER", "postgres", env)
	if err != nil {
		return nil, err
	}
	dbName, err := getEnvForRuntime("DB_NAME", "estospaces", env)
	if err != nil {
		return nil, err
	}
	dbSSLMode, err := getEnvForRuntime("DB_SSL_MODE", "disable", env)
	if err != nil {
		return nil, err
	}
	allowedOrigins, err := getEnvForRuntime("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173", env)
	if err != nil {
		return nil, err
	}
	origins := strings.Split(allowedOrigins, ",")

	return &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Env:  env,
		},
		Database: DatabaseConfig{
			Host:     dbHost,
			Port:     getEnv("DB_PORT", "5432"),
			User:     dbUser,
			Password: dbPassword,
			Name:     dbName,
			SSLMode:  dbSSLMode,
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

func getEnvForRuntime(key, fallback, env string) (string, error) {
	if v := os.Getenv(key); v != "" {
		return v, nil
	}
	if isStrictRuntime(env) {
		return "", fmt.Errorf("%s is required when ENV=%s", key, env)
	}
	return fallback, nil
}

func isStrictRuntime(env string) bool {
	switch strings.ToLower(strings.TrimSpace(env)) {
	case "production", "staging":
		return true
	default:
		return false
	}
}
