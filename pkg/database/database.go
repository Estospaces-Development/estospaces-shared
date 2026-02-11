package database

import (
	"fmt"
	"log"

	"github.com/estospaces/shared/pkg/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB wraps the GORM database connection
type DB struct {
	*gorm.DB
}

// Connect establishes a PostgreSQL connection using the shared config
func Connect(cfg *config.DatabaseConfig) (*DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)

	log.Printf("Connected to database: %s:%s/%s", cfg.Host, cfg.Port, cfg.Name)
	return &DB{db}, nil
}

// Migrate runs auto-migration for the given models
func (d *DB) Migrate(models ...interface{}) error {
	return d.AutoMigrate(models...)
}

// Close closes the database connection
func (d *DB) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
