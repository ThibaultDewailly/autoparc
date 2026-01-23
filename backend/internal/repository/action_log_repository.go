package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/goldenkiwi/autoparc/internal/models"
)

// ActionLogRepository handles database operations for action logs
type ActionLogRepository struct {
	db *sql.DB
}

// NewActionLogRepository creates a new action log repository
func NewActionLogRepository(db *sql.DB) *ActionLogRepository {
	return &ActionLogRepository{db: db}
}

// Create creates a new action log entry
func (r *ActionLogRepository) Create(ctx context.Context, log *models.ActionLog) error {
	query := `
		INSERT INTO action_logs (id, entity_type, entity_id, action_type, performed_by, changes, timestamp)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		log.ID,
		log.EntityType,
		log.EntityID,
		log.ActionType,
		log.PerformedBy,
		log.Changes,
		log.Timestamp,
	)

	if err != nil {
		return fmt.Errorf("failed to create action log: %w", err)
	}

	return nil
}
