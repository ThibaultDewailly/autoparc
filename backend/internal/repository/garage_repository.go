package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
)

// GarageRepository handles database operations for garages
type GarageRepository struct {
	db *sql.DB
}

// NewGarageRepository creates a new garage repository
func NewGarageRepository(db *sql.DB) *GarageRepository {
	return &GarageRepository{db: db}
}

// Create creates a new garage in the database
func (r *GarageRepository) Create(ctx context.Context, garage *models.Garage) error {
	query := `
		INSERT INTO garages (id, name, contact_person, phone, email, address, 
		                     specialization, is_active, created_at, updated_at, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		garage.ID,
		garage.Name,
		garage.ContactPerson,
		garage.Phone,
		garage.Email,
		garage.Address,
		garage.Specialization,
		garage.IsActive,
		garage.CreatedAt,
		garage.UpdatedAt,
		garage.CreatedBy,
	)

	if err != nil {
		return fmt.Errorf("échec de la création du garage: %w", err)
	}

	return nil
}

// FindByID retrieves a garage by ID
func (r *GarageRepository) FindByID(ctx context.Context, id string) (*models.Garage, error) {
	query := `
		SELECT id, name, contact_person, phone, email, address, 
		       specialization, is_active, created_at, updated_at, created_by
		FROM garages
		WHERE id = $1
	`

	var garage models.Garage
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&garage.ID,
		&garage.Name,
		&garage.ContactPerson,
		&garage.Phone,
		&garage.Email,
		&garage.Address,
		&garage.Specialization,
		&garage.IsActive,
		&garage.CreatedAt,
		&garage.UpdatedAt,
		&garage.CreatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("garage non trouvé")
	}
	if err != nil {
		return nil, fmt.Errorf("échec de la recherche du garage: %w", err)
	}

	return &garage, nil
}

// FindAll retrieves all garages with optional filters
func (r *GarageRepository) FindAll(ctx context.Context, filters map[string]interface{}) ([]*models.Garage, error) {
	query := `
		SELECT id, name, contact_person, phone, email, address, 
		       specialization, is_active, created_at, updated_at, created_by
		FROM garages
		WHERE 1=1
	`

	var args []interface{}
	argCount := 1

	// Apply filters
	if isActive, ok := filters["is_active"].(bool); ok {
		query += fmt.Sprintf(" AND is_active = $%d", argCount)
		args = append(args, isActive)
		argCount++
	}

	if search, ok := filters["search"].(string); ok && search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query += fmt.Sprintf(" AND (LOWER(name) LIKE $%d OR LOWER(specialization) LIKE $%d)", argCount, argCount)
		args = append(args, searchPattern)
		argCount++
	}

	// Add ordering
	query += " ORDER BY name ASC"

	// Add pagination
	if limit, ok := filters["limit"].(int); ok && limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d", argCount)
		args = append(args, limit)
		argCount++
	}

	if offset, ok := filters["offset"].(int); ok && offset > 0 {
		query += fmt.Sprintf(" OFFSET $%d", argCount)
		args = append(args, offset)
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("échec de la recherche des garages: %w", err)
	}
	defer rows.Close()

	var garages []*models.Garage
	for rows.Next() {
		var garage models.Garage
		err := rows.Scan(
			&garage.ID,
			&garage.Name,
			&garage.ContactPerson,
			&garage.Phone,
			&garage.Email,
			&garage.Address,
			&garage.Specialization,
			&garage.IsActive,
			&garage.CreatedAt,
			&garage.UpdatedAt,
			&garage.CreatedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("échec du scan du garage: %w", err)
		}
		garages = append(garages, &garage)
	}

	return garages, nil
}

// Update updates a garage in the database
func (r *GarageRepository) Update(ctx context.Context, id string, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return fmt.Errorf("aucune mise à jour fournie")
	}

	query := "UPDATE garages SET "
	var setClauses []string
	var args []interface{}
	argCount := 1

	for key, value := range updates {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", key, argCount))
		args = append(args, value)
		argCount++
	}

	// Always update updated_at
	setClauses = append(setClauses, fmt.Sprintf("updated_at = $%d", argCount))
	args = append(args, time.Now())
	argCount++

	query += strings.Join(setClauses, ", ")
	query += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, id)

	result, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("échec de la mise à jour du garage: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("échec de la vérification des lignes affectées: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("garage non trouvé")
	}

	return nil
}

// Delete soft deletes a garage by setting is_active to false
func (r *GarageRepository) Delete(ctx context.Context, id string) error {
	query := `UPDATE garages SET is_active = false, updated_at = $1 WHERE id = $2`

	result, err := r.db.ExecContext(ctx, query, time.Now(), id)
	if err != nil {
		return fmt.Errorf("échec de la suppression du garage: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("échec de la vérification des lignes affectées: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("garage non trouvé")
	}

	return nil
}

// Count counts garages with optional filters
func (r *GarageRepository) Count(ctx context.Context, filters map[string]interface{}) (int, error) {
	query := "SELECT COUNT(*) FROM garages WHERE 1=1"
	var args []interface{}
	argCount := 1

	if isActive, ok := filters["is_active"].(bool); ok {
		query += fmt.Sprintf(" AND is_active = $%d", argCount)
		args = append(args, isActive)
		argCount++
	}

	if search, ok := filters["search"].(string); ok && search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query += fmt.Sprintf(" AND (LOWER(name) LIKE $%d OR LOWER(specialization) LIKE $%d)", argCount, argCount)
		args = append(args, searchPattern)
	}

	var count int
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("échec du comptage des garages: %w", err)
	}

	return count, nil
}

// IsUsedByRepairs checks if a garage is being used by any repairs
func (r *GarageRepository) IsUsedByRepairs(ctx context.Context, id string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM repairs WHERE garage_id = $1 LIMIT 1)`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, id).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("échec de la vérification de l'utilisation du garage: %w", err)
	}

	return exists, nil
}
