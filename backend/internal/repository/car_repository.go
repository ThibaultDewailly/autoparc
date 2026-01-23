package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
)

// CarRepository handles database operations for cars
type CarRepository struct {
	db *sql.DB
}

// NewCarRepository creates a new car repository
func NewCarRepository(db *sql.DB) *CarRepository {
	return &CarRepository{db: db}
}

// Create creates a new car in the database
func (r *CarRepository) Create(ctx context.Context, car *models.Car) error {
	query := `
		INSERT INTO cars (id, license_plate, brand, model, grey_card_number, 
		                  insurance_company_id, rental_start_date, status, 
		                  created_at, updated_at, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		car.ID,
		car.LicensePlate,
		car.Brand,
		car.Model,
		car.GreyCardNumber,
		car.InsuranceCompanyID,
		car.RentalStartDate,
		car.Status,
		car.CreatedAt,
		car.UpdatedAt,
		car.CreatedBy,
	)

	if err != nil {
		return fmt.Errorf("failed to create car: %w", err)
	}

	return nil
}

// FindByID retrieves a car by ID with its insurance company
func (r *CarRepository) FindByID(ctx context.Context, id string) (*models.Car, error) {
	query := `
		SELECT c.id, c.license_plate, c.brand, c.model, c.grey_card_number, 
		       c.insurance_company_id, c.rental_start_date, c.status, 
		       c.created_at, c.updated_at, c.created_by,
		       i.id, i.name, i.contact_person, i.phone, i.email, i.address, 
		       i.policy_number, i.is_active, i.created_at, i.updated_at, i.created_by
		FROM cars c
		LEFT JOIN insurance_companies i ON c.insurance_company_id = i.id
		WHERE c.id = $1
	`

	var car models.Car
	var insurance models.InsuranceCompany

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&car.ID,
		&car.LicensePlate,
		&car.Brand,
		&car.Model,
		&car.GreyCardNumber,
		&car.InsuranceCompanyID,
		&car.RentalStartDate,
		&car.Status,
		&car.CreatedAt,
		&car.UpdatedAt,
		&car.CreatedBy,
		&insurance.ID,
		&insurance.Name,
		&insurance.ContactPerson,
		&insurance.Phone,
		&insurance.Email,
		&insurance.Address,
		&insurance.PolicyNumber,
		&insurance.IsActive,
		&insurance.CreatedAt,
		&insurance.UpdatedAt,
		&insurance.CreatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("car not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find car: %w", err)
	}

	car.InsuranceCompany = &insurance

	return &car, nil
}

// FindAll retrieves cars with pagination and filters
func (r *CarRepository) FindAll(ctx context.Context, filters *models.CarFilters) ([]*models.Car, int, error) {
	// Build WHERE clause
	where := []string{"1=1"}
	args := []interface{}{}
	argCount := 0

	if filters.Status != nil {
		argCount++
		where = append(where, fmt.Sprintf("c.status = $%d", argCount))
		args = append(args, *filters.Status)
	}

	if filters.Search != "" {
		argCount++
		searchPattern := "%" + filters.Search + "%"
		where = append(where, fmt.Sprintf("(c.license_plate ILIKE $%d OR c.brand ILIKE $%d OR c.model ILIKE $%d)", argCount, argCount, argCount))
		args = append(args, searchPattern)
	}

	whereClause := strings.Join(where, " AND ")

	// Count total records
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM cars c WHERE %s`, whereClause)
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count cars: %w", err)
	}

	// Build ORDER BY clause
	orderBy := "c.created_at DESC"
	if filters.SortBy != "" {
		direction := "ASC"
		if filters.SortOrder == "desc" {
			direction = "DESC"
		}
		switch filters.SortBy {
		case "brand":
			orderBy = fmt.Sprintf("c.brand %s", direction)
		case "model":
			orderBy = fmt.Sprintf("c.model %s", direction)
		case "licensePlate":
			orderBy = fmt.Sprintf("c.license_plate %s", direction)
		case "createdAt":
			orderBy = fmt.Sprintf("c.created_at %s", direction)
		}
	}

	// Query with pagination
	query := fmt.Sprintf(`
		SELECT c.id, c.license_plate, c.brand, c.model, c.grey_card_number, 
		       c.insurance_company_id, c.rental_start_date, c.status, 
		       c.created_at, c.updated_at, c.created_by,
		       i.id, i.name, i.contact_person, i.phone, i.email, i.address, 
		       i.policy_number, i.is_active, i.created_at, i.updated_at, i.created_by
		FROM cars c
		LEFT JOIN insurance_companies i ON c.insurance_company_id = i.id
		WHERE %s
		ORDER BY %s
		LIMIT $%d OFFSET $%d
	`, whereClause, orderBy, argCount+1, argCount+2)

	offset := (filters.Page - 1) * filters.Limit
	args = append(args, filters.Limit, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query cars: %w", err)
	}
	defer rows.Close()

	var cars []*models.Car
	for rows.Next() {
		var car models.Car
		var insurance models.InsuranceCompany

		err := rows.Scan(
			&car.ID,
			&car.LicensePlate,
			&car.Brand,
			&car.Model,
			&car.GreyCardNumber,
			&car.InsuranceCompanyID,
			&car.RentalStartDate,
			&car.Status,
			&car.CreatedAt,
			&car.UpdatedAt,
			&car.CreatedBy,
			&insurance.ID,
			&insurance.Name,
			&insurance.ContactPerson,
			&insurance.Phone,
			&insurance.Email,
			&insurance.Address,
			&insurance.PolicyNumber,
			&insurance.IsActive,
			&insurance.CreatedAt,
			&insurance.UpdatedAt,
			&insurance.CreatedBy,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan car: %w", err)
		}

		car.InsuranceCompany = &insurance
		cars = append(cars, &car)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating cars: %w", err)
	}

	return cars, totalCount, nil
}

// Update updates a car's information
func (r *CarRepository) Update(ctx context.Context, id string, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return fmt.Errorf("no updates provided")
	}

	setClauses := []string{"updated_at = $1"}
	args := []interface{}{time.Now()}
	argCount := 1

	for key, value := range updates {
		argCount++
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", key, argCount))
		args = append(args, value)
	}

	argCount++
	args = append(args, id)

	query := fmt.Sprintf(`
		UPDATE cars
		SET %s
		WHERE id = $%d
	`, strings.Join(setClauses, ", "), argCount)

	result, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update car: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("car not found")
	}

	return nil
}

// Delete soft deletes a car by setting status to retired
func (r *CarRepository) Delete(ctx context.Context, id string) error {
	query := `
		UPDATE cars
		SET status = $1, updated_at = $2
		WHERE id = $3
	`

	result, err := r.db.ExecContext(ctx, query, models.CarStatusRetired, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to delete car: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("car not found")
	}

	return nil
}
