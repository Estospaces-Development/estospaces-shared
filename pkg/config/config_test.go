package config

import (
	"errors"
	"os"
	"strings"
	"testing"
	"time"
)

func prepareConfigEnvironment(t *testing.T) {
	t.Helper()
	t.Chdir(t.TempDir())
	for _, key := range []string{
		"ENV", "PORT", "DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD",
		"DB_NAME", "DB_SSL_MODE", "JWT_SECRET", "JWT_EXPIRY", "ALLOWED_ORIGINS",
	} {
		t.Setenv(key, "")
		if err := os.Unsetenv(key); err != nil {
			t.Fatalf("clear synthetic configuration: %v", err)
		}
	}
	t.Setenv("DB_PASSWORD", "synthetic-db-value")
	t.Setenv("JWT_SECRET", "synthetic-jwt-value")
}

func TestLoadAllowsAbsentOptionalDotEnv(t *testing.T) {
	prepareConfigEnvironment(t)
	cfg, err := Load()
	if err != nil || cfg == nil {
		t.Fatalf("missing optional file should be accepted: %v", err)
	}
	if cfg.Server.Env != "development" || cfg.Server.Port != "8080" ||
		cfg.Database.Host != "localhost" || cfg.Database.Name != "estospaces" ||
		cfg.JWT.Expiry != 24*time.Hour {
		t.Fatal("missing optional file changed configuration defaults")
	}
	if cfg.Database.Password != "synthetic-db-value" || cfg.JWT.Secret != "synthetic-jwt-value" {
		t.Fatal("runtime configuration was not preserved")
	}
}

func TestLoadDotEnvPreservesExistingRuntimeValues(t *testing.T) {
	prepareConfigEnvironment(t)
	t.Setenv("PORT", "9090")
	if err := os.WriteFile(".env", []byte("PORT=7070\nDB_PASSWORD=file-db-value\nJWT_SECRET=file-jwt-value\nDB_HOST=synthetic-db\nJWT_EXPIRY=2h\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	cfg, err := Load()
	if err != nil || cfg == nil {
		t.Fatalf("valid optional file should load: %v", err)
	}
	if cfg.Server.Port != "9090" || cfg.Database.Password != "synthetic-db-value" || cfg.JWT.Secret != "synthetic-jwt-value" {
		t.Fatal("optional file replaced runtime configuration")
	}
	if cfg.Database.Host != "synthetic-db" || cfg.JWT.Expiry != 2*time.Hour {
		t.Fatal("optional file did not fill unset configuration")
	}
}

func TestLoadRejectsMalformedDotEnvWithoutLeakingContents(t *testing.T) {
	prepareConfigEnvironment(t)
	const marker = "synthetic-private-parser-marker"
	if err := os.WriteFile(".env", []byte("DB_HOST=must-not-be-applied\nJWT_SECRET=\""+marker), 0o600); err != nil {
		t.Fatal(err)
	}
	cfg, err := Load()
	if err == nil || cfg != nil {
		t.Fatal("malformed optional file must fail configuration loading")
	}
	if err.Error() != "failed to load optional .env configuration" || strings.Contains(err.Error(), marker) || errors.Unwrap(err) != nil {
		t.Fatal("configuration error must not expose or wrap parser details")
	}
	if os.Getenv("DB_HOST") != "" {
		t.Fatal("malformed file partially changed the runtime environment")
	}
}

func TestLoadRejectsUnreadableDotEnvWithoutLeakingPath(t *testing.T) {
	prepareConfigEnvironment(t)
	// A directory fails the file read on Windows and Unix, including privileged CI.
	if err := os.Mkdir(".env", 0o700); err != nil {
		t.Fatal(err)
	}
	cfg, err := Load()
	if err == nil || cfg != nil {
		t.Fatal("unreadable optional file must fail configuration loading")
	}
	if err.Error() != "failed to load optional .env configuration" || errors.Unwrap(err) != nil {
		t.Fatal("configuration error must not expose or wrap filesystem details")
	}
}

func TestLoadStillRequiresRuntimeConfiguration(t *testing.T) {
	for _, key := range []string{"DB_PASSWORD", "JWT_SECRET"} {
		t.Run(key, func(t *testing.T) {
			prepareConfigEnvironment(t)
			t.Setenv(key, "")
			cfg, err := Load()
			if cfg != nil || err == nil || err.Error() != key+" is required" {
				t.Fatal("missing required runtime configuration must still be rejected")
			}
		})
	}
}

func TestLoadStillRequiresProductionConfiguration(t *testing.T) {
	prepareConfigEnvironment(t)
	t.Setenv("ENV", "production")
	cfg, err := Load()
	if cfg != nil || err == nil || err.Error() != "DB_HOST is required when ENV=production" {
		t.Fatal("missing optional file must not bypass strict runtime validation")
	}
}
