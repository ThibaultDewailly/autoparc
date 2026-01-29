package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
)

// RepairRepository handles database operations for repairs
type RepairRepository struct {
	db *sql.DB
}

// NewRepairRepository creates a new repair repository
func NewRepairRepository(db *sql.DB) *RepairRepository {
	return &RepairRepository{db: db}
}

// Create creates a new repair in the database
func (r *RepairRepository) Create(ctx context.Context, repair *models.Repair) error {
	query := `
		INSERT INTO repairs (id, car_id, accident_id, garage_id, repair_type, description, 
		                     start_date, end_date, cost, status, invoice_number, notes, 
		                     created_at, updated_at, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		repair.ID,
		repair.CarID,
		repair.AccidentID,
		repair.GarageID,
		repair.RepairType,
		repair.Description,
		repair.StartDate,
		repair.EndDate,
		repair.Cost,
		repair.Status,
		repair.InvoiceNumber,
		repair.Notes,
		repair.CreatedAt,
		repair.UpdatedAt,
		repair.CreatedBy,
	)

	if err != nil {
		return fmt.Errorf("échec de la création de la réparation: %w", err)
	}

	return nil
}

// FindByID retrieves a repair by ID
func (r *RepairRepository) FindByID(ctx context.Context, id string) (*models.Repair, error) {
	query := `
		SELECT id, car_id, accident_id, garage_id, repair_type, description, 
		       start_date, end_date, cost, status, invoice_number, notes, 
		       created_at, updated_at, created_by
		FROM repairs
		WHERE id = $1
	`

	var repair models.Repair
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&repair.ID,
		&repair.CarID,
		&repair.AccidentID,
		&repair.GarageID,
		&repair.RepairType,
		&repair.Description,
		&repair.StartDate,
		&repair.EndDate,
		&repair.Cost,
		&repair.Status,
		&repair.InvoiceNumber,
		&repair.Notes,
		&repair.CreatedAt,
		&repair.UpdatedAt,
		&repair.CreatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("réparation non trouvée")
	}
	if err != nil {
		return nil, fmt.Errorf("échec de la recherche de la réparation: %w", err)
	}

	return &repair, nil
}

// FindAll retrieves all repairs with optional filters
func (r *RepairRepository) FindAll(ctx context.Context, filters map[string]interface{}) ([]*models.Repair, error) {
	query := `
		SELECT id, car_id, accident_id, garage_id, repair_type, description, 
		       start_date, end_date, cost, status, invoice_number, notes, 
		       created_at, updated_at, created_by
		FROM repairs
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

	if accidentID, ok := filters["accident_id"].(string); ok && accidentID != "" {
		query += fmt.Sprintf(" AND accident_id = $%d", argCount)
		args = append(args, accidentID)
		argCount++
	}

	if garageID, ok := filters["garage_id"].(string); ok && garageID != "" {
		query += fmt.Sprintf(" AND garage_id = $%d", argCount)
		args = append(args, garageID)
		argCount++
	}

	if repairType, ok := filters["repair_type"].(string); ok && repairType != "" {
		query += fmt.Sprintf(" AND repair_type = $%d", argCount)
		args = append(args, repairType)
		argCount++
	}

	if status, ok := filters["status"].(string); ok && status != "" {
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
		argCount++
	}

	if search, ok := filters["search"].(string); ok && search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query += fmt.Sprintf(" AND LOWER(description) LIKE $%d", argCount)
		args = append(args, searchPattern)
		argCount++
	}

	// Add ordering
	query += " ORDER BY start_date DESC"

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
		return nil, fmt.Errorf("échec de la recherche des réparations: %w", err)
	}
	defer rows.Close()

	var repairs []*models.Repair
	for rows.Next() {
		var repair models.Repair
		err := rows.Scan(
			&repair.ID,
			&repair.CarID,
			&repair.AccidentID,
			&repair.GarageID,
			&repair.RepairType,
			&repair.Description,
			&repair.StartDate,
			&repair.EndDate,
			&repair.Cost,
			&repair.Status,
			&repair.InvoiceNumber,
			&repair.Notes,
			&repair.CreatedAt,
			&repair.UpdatedAt,
			&repair.CreatedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("échec du scan de la réparation: %w", err)
		}
		repairs = append(repairs, &repair)
	}

	return repairs, nil
}

// FindByCarID retrieves all repairs for a specific car
func (r *RepairRepository) FindByCarID(ctx context.Context, carID string) ([]*models.Repair, error) {
	query := `
		SELECT id, car_id, accident_id, garage_id, repair_type, description, 
		       start_date, end_date, cost, status, invoice_number, notes, 
		       created_at, updated_at, created_by
		FROM repairs
		WHERE car_id = $1
		ORDER BY start_date DESC
	`

	rows, err := r.db.QueryContext(ctx, query, carID)
	if err != nil {
		return nil, fmt.Errorf("échec de la recherche des réparations: %w", err)
	}
	defer rows.Close()

	var repairs []*models.Repair
	for rows.Next() {
		var repair models.Repair
		err := rows.Scan(
			&repair.ID,
			&repair.CarID,
			&repair.AccidentID,
			&repair.GarageID,
			&repair.RepairType,
			&repair.Description,
			&repair.StartDate,
			&repair.EndDate,
			&repair.Cost,
			&repair.Status,
			&repair.InvoiceNumber,
			&repair.Notes,
			&repair.CreatedAt,
			&repair.UpdatedAt,
			&repair.CreatedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("échec du scan de la réparation: %w", err)
		}
		repairs = append(repairs, &repair)
	}

	return repairs, nil
}

// FindByAccidentID retrieves all repairs for a specific accident
func (r *RepairRepository) FindByAccidentID(ctx context.Context, accidentID string) ([]*models.Repair, error) {
	query := `
		SELECT id, car_id, accident_id, garage_id, repair_type, description, 
		       start_date, end_date, cost, status, invoice_number, notes, 
		       created_at, updated_at, created_by
		FROM repairs
		WHERE accident_id = $1
		ORDER BY start_date DESC
	`

	rows, err := r.db.QueryContext(ctx, query, accidentID)
	if err != nil {
		return nil, fmt.Errorf("échec de la recherche des réparations: %w", err)
	}
	defer rows.Close()

	var repairs []*models.Repair
	for rows.Next() {
		var repair models.Repair
		err := rows.Scan(
			&repair.ID,
			&repair.CarID,
			&repair.AccidentID,
			&repair.GarageID,
			&repair.RepairType,
			&repair.Description,
			&repair.StartDate,
			&repair.EndDate,
			&repair.Cost,
			&repair.Status,
			&repair.InvoiceNumber,
			&repair.Notes,
			&repair.CreatedAt,
			&repair.UpdatedAt,
			&repair.CreatedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("échec du scan de la réparation: %w", err)
		}
		repairs = append(repairs, &repair)
	}

	return repairs, nil
}

// FindByGarageID retrieves all repairs for a specific garage
func (r *RepairRepository) FindByGarageID(ctx context.Context, garageID string) ([]*models.Repair, error) {
	query := `
		SELECT id, car_id, accident_id, garage_id, repair_type, description, 
		       start_date, end_date, cost, status, invoice_number, notes, 
		       created_at, updated_at, created_by
		FROM repairs
		WHERE garage_id = $1
		ORDER BY start_date DESC
	`

	rows, err := r.db.QueryContext(ctx, query, garageID)
	if err != nil {
		return nil, fmt.Errorf("échec de la recherche des réparations: %w", err)
	}
	defer rows.Close()

	var repairs []*models.Repair
	for rows.Next() {
		var repair models.Repair
		err := rows.Scan(
			&repair.ID,
			&repair.CarID,
			&repair.AccidentID,
			&repair.GarageID,
			&repair.RepairType,
			&repair.Description,
			&repair.StartDate,
			&repair.EndDate,
			&repair.Cost,
			&repair.Status,
			&repair.InvoiceNumber,
			&repair.Notes,
			&repair.CreatedAt,
			&repair.UpdatedAt,
			&repair.CreatedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("échec du scan de la réparation: %w", err)
		}
		repairs = append(repairs, &repair)
	}

	return repairs, nil
}

// Update updates a repair in the database
func (r *RepairRepository) Update(ctx context.Context, id string, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return fmt.Errorf("aucune mise à jour fournie")
	}

	query := "UPDATE repairs SET "
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
		return fmt.Errorf("échec de la mise à jour de la réparation: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("échec de la vérification des lignes affectées: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("réparation non trouvée")
	}

	return nil
}

// UpdateStatus updates the status of a repair
func (r *RepairRepository) UpdateStatus(ctx context.Context, id string, status models.RepairStatus) error {
	query := `UPDATE repairs SET status = $1, updated_at = $2 WHERE id = $3`

	result, err := r.db.ExecContext(ctx, query, status, time.Now(), id)
	if err != nil {
		return fmt.Errorf("échec de la mise à jour du statut: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("échec de la vérification des lignes affectées: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("réparation non trouvée")
	}

	return nil
}

// Delete deletes a repair
func (r *RepairRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM repairs WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("échec de la suppression de la réparation: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("échec de la vérification des lignes affectées: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("réparation non trouvée")
	}

	return nil
}

// Count counts repairs with optional filters
func (r *RepairRepository) Count(ctx context.Context, filters map[string]interface{}) (int, error) {
	query := "SELECT COUNT(*) FROM repairs WHERE 1=1"
	var args []interface{}
	argCount := 1

	if carID, ok := filters["car_id"].(string); ok && carID != "" {
		query += fmt.Sprintf(" AND car_id = $%d", argCount)
		args = append(args, carID)
		argCount++
	}

	if accidentID, ok := filters["accident_id"].(string); ok && accidentID != "" {
		query += fmt.Sprintf(" AND accident_id = $%d", argCount)
		args = append(args, accidentID)
		argCount++
	}

	if garageID, ok := filters["garage_id"].(string); ok && garageID != "" {
		query += fmt.Sprintf(" AND garage_id = $%d", argCount)
		args = append(args, garageID)
		argCount++
	}

	if repairType, ok := filters["repair_type"].(string); ok && repairType != "" {
		query += fmt.Sprintf(" AND repair_type = $%d", argCount)
		args = append(args, repairType)
		argCount++
	}

	if status, ok := filters["status"].(string); ok && status != "" {
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
	}

	var count int
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("échec du comptage des réparations: %w", err)
	}

	return count, nil
}
