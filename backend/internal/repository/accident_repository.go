package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
)

// AccidentRepository handles database operations for accidents
type AccidentRepository struct {
	db *sql.DB
}

// NewAccidentRepository creates a new accident repository
func NewAccidentRepository(db *sql.DB) *AccidentRepository {
	return &AccidentRepository{db: db}
}

// Create creates a new accident in the database
func (r *AccidentRepository) Create(ctx context.Context, accident *models.Accident) error {
	query := `
		INSERT INTO accidents (id, car_id, accident_date, location, description, 
		                       damages_description, responsible_party, police_report_number, 
		                       insurance_claim_number, status, created_at, updated_at, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		accident.ID,
		accident.CarID,
		accident.AccidentDate,
		accident.Location,
		accident.Description,
		accident.DamagesDescription,
		accident.ResponsibleParty,
		accident.PoliceReportNumber,
		accident.InsuranceClaimNumber,
		accident.Status,
		accident.CreatedAt,
		accident.UpdatedAt,
		accident.CreatedBy,
	)

	if err != nil {
		return fmt.Errorf("échec de la création de l'accident: %w", err)
	}

	return nil
}

// FindByID retrieves an accident by ID
func (r *AccidentRepository) FindByID(ctx context.Context, id string) (*models.Accident, error) {
	query := `
		SELECT id, car_id, accident_date, location, description, 
		       damages_description, responsible_party, police_report_number, 
		       insurance_claim_number, status, created_at, updated_at, created_by
		FROM accidents
		WHERE id = $1
	`

	var accident models.Accident
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&accident.ID,
		&accident.CarID,
		&accident.AccidentDate,
		&accident.Location,
		&accident.Description,
		&accident.DamagesDescription,
		&accident.ResponsibleParty,
		&accident.PoliceReportNumber,
		&accident.InsuranceClaimNumber,
		&accident.Status,
		&accident.CreatedAt,
		&accident.UpdatedAt,
		&accident.CreatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("accident non trouvé")
	}
	if err != nil {
		return nil, fmt.Errorf("échec de la recherche de l'accident: %w", err)
	}

	return &accident, nil
}

// FindAll retrieves all accidents with optional filters
func (r *AccidentRepository) FindAll(ctx context.Context, filters map[string]interface{}) ([]*models.Accident, error) {
	query := `
		SELECT id, car_id, accident_date, location, description, 
		       damages_description, responsible_party, police_report_number, 
		       insurance_claim_number, status, created_at, updated_at, created_by
		FROM accidents
		WHERE 1=1
	`

	var args []interface{}
	argCount := 1

	// Apply filters
	if carID, ok := filters["car_id"].(string); ok && carID != "" {
		query += fmt.Sprintf(" AND car_id = $%d", argCount)
		args = append(args, carID)
		argCount++
	}

	if status, ok := filters["status"].(string); ok && status != "" {
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
		argCount++
	}

	if search, ok := filters["search"].(string); ok && search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query += fmt.Sprintf(" AND (LOWER(location) LIKE $%d OR LOWER(description) LIKE $%d)", argCount, argCount)
		args = append(args, searchPattern)
		argCount++
	}

	// Add ordering
	query += " ORDER BY accident_date DESC"

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
		return nil, fmt.Errorf("échec de la recherche des accidents: %w", err)
	}
	defer rows.Close()

	var accidents []*models.Accident
	for rows.Next() {
		var accident models.Accident
		err := rows.Scan(
			&accident.ID,
			&accident.CarID,
			&accident.AccidentDate,
			&accident.Location,
			&accident.Description,
			&accident.DamagesDescription,
			&accident.ResponsibleParty,
			&accident.PoliceReportNumber,
			&accident.InsuranceClaimNumber,
			&accident.Status,
			&accident.CreatedAt,
			&accident.UpdatedAt,
			&accident.CreatedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("échec du scan de l'accident: %w", err)
		}
		accidents = append(accidents, &accident)
	}

	return accidents, nil
}

// FindByCarID retrieves all accidents for a specific car
func (r *AccidentRepository) FindByCarID(ctx context.Context, carID string) ([]*models.Accident, error) {
	query := `
		SELECT id, car_id, accident_date, location, description, 
		       damages_description, responsible_party, police_report_number, 
		       insurance_claim_number, status, created_at, updated_at, created_by
		FROM accidents
		WHERE car_id = $1
		ORDER BY accident_date DESC
	`

	rows, err := r.db.QueryContext(ctx, query, carID)
	if err != nil {
		return nil, fmt.Errorf("échec de la recherche des accidents: %w", err)
	}
	defer rows.Close()

	var accidents []*models.Accident
	for rows.Next() {
		var accident models.Accident
		err := rows.Scan(
			&accident.ID,
			&accident.CarID,
			&accident.AccidentDate,
			&accident.Location,
			&accident.Description,
			&accident.DamagesDescription,
			&accident.ResponsibleParty,
			&accident.PoliceReportNumber,
			&accident.InsuranceClaimNumber,
			&accident.Status,
			&accident.CreatedAt,
			&accident.UpdatedAt,
			&accident.CreatedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("échec du scan de l'accident: %w", err)
		}
		accidents = append(accidents, &accident)
	}

	return accidents, nil
}

// Update updates an accident in the database
func (r *AccidentRepository) Update(ctx context.Context, id string, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return fmt.Errorf("aucune mise à jour fournie")
	}

	query := "UPDATE accidents SET "
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
		return fmt.Errorf("échec de la mise à jour de l'accident: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("échec de la vérification des lignes affectées: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("accident non trouvé")
	}

	return nil
}

// UpdateStatus updates the status of an accident
func (r *AccidentRepository) UpdateStatus(ctx context.Context, id string, status models.AccidentStatus) error {
	query := `UPDATE accidents SET status = $1, updated_at = $2 WHERE id = $3`

	result, err := r.db.ExecContext(ctx, query, status, time.Now(), id)
	if err != nil {
		return fmt.Errorf("échec de la mise à jour du statut: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("échec de la vérification des lignes affectées: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("accident non trouvé")
	}

	return nil
}

// Delete deletes an accident
func (r *AccidentRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM accidents WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("échec de la suppression de l'accident: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("échec de la vérification des lignes affectées: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("accident non trouvé")
	}

	return nil
}

// Count counts accidents with optional filters
func (r *AccidentRepository) Count(ctx context.Context, filters map[string]interface{}) (int, error) {
	query := "SELECT COUNT(*) FROM accidents WHERE 1=1"
	var args []interface{}
	argCount := 1

	if carID, ok := filters["car_id"].(string); ok && carID != "" {
		query += fmt.Sprintf(" AND car_id = $%d", argCount)
		args = append(args, carID)
		argCount++
	}

	if status, ok := filters["status"].(string); ok && status != "" {
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
		argCount++
	}

	if search, ok := filters["search"].(string); ok && search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query += fmt.Sprintf(" AND (LOWER(location) LIKE $%d OR LOWER(description) LIKE $%d)", argCount, argCount)
		args = append(args, searchPattern)
	}

	var count int
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("échec du comptage des accidents: %w", err)
	}

	return count, nil
}
