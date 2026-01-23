package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
)

// SessionRepository handles database operations for sessions
type SessionRepository struct {
	db *sql.DB
}

// NewSessionRepository creates a new session repository
func NewSessionRepository(db *sql.DB) *SessionRepository {
	return &SessionRepository{db: db}
}

// Create creates a new session in the database
func (r *SessionRepository) Create(ctx context.Context, session *models.Session) error {
	query := `
		INSERT INTO sessions (id, user_id, session_token, expires_at, ip_address, user_agent, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		session.ID,
		session.UserID,
		session.SessionToken,
		session.ExpiresAt,
		session.IPAddress,
		session.UserAgent,
		session.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}

	return nil
}

// FindByToken finds a session by its token
func (r *SessionRepository) FindByToken(ctx context.Context, token string) (*models.Session, error) {
	query := `
		SELECT id, user_id, session_token, expires_at, ip_address, user_agent, created_at
		FROM sessions
		WHERE session_token = $1 AND expires_at > $2
	`

	var session models.Session
	err := r.db.QueryRowContext(ctx, query, token, time.Now()).Scan(
		&session.ID,
		&session.UserID,
		&session.SessionToken,
		&session.ExpiresAt,
		&session.IPAddress,
		&session.UserAgent,
		&session.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("session not found or expired")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find session: %w", err)
	}

	return &session, nil
}

// Delete deletes a session by token
func (r *SessionRepository) Delete(ctx context.Context, token string) error {
	query := `DELETE FROM sessions WHERE session_token = $1`

	_, err := r.db.ExecContext(ctx, query, token)
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	return nil
}

// DeleteExpired deletes all expired sessions
func (r *SessionRepository) DeleteExpired(ctx context.Context) error {
	query := `DELETE FROM sessions WHERE expires_at < $1`

	_, err := r.db.ExecContext(ctx, query, time.Now())
	if err != nil {
		return fmt.Errorf("failed to delete expired sessions: %w", err)
	}

	return nil
}
