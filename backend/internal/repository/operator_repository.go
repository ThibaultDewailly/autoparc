package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
)

// OperatorRepository handles database operations for car operators
type OperatorRepository struct {
	db *sql.DB
}

// NewOperatorRepository creates a new operator repository
func NewOperatorRepository(db *sql.DB) *OperatorRepository {
	return &OperatorRepository{db: db}
}

// Create creates a new car operator in the database
func (r *OperatorRepository) Create(ctx context.Context, operator *models.CarOperator) error {
	query := `
		INSERT INTO car_operators (id, employee_number, first_name, last_name, 
		                           email, phone, department, is_active, 
		                           created_at, updated_at, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		operator.ID,
		operator.EmployeeNumber,
		operator.FirstName,
		operator.LastName,
		operator.Email,
		operator.Phone,
		operator.Department,
		operator.IsActive,
		operator.CreatedAt,
		operator.UpdatedAt,
		operator.CreatedBy,
	)

	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			return fmt.Errorf("employee number already exists")
		}
		return fmt.Errorf("failed to create operator: %w", err)
	}

	return nil
}

// FindByID retrieves an operator by ID
func (r *OperatorRepository) FindByID(ctx context.Context, id string) (*models.CarOperator, error) {
	query := `
		SELECT id, employee_number, first_name, last_name, 
		       email, phone, department, is_active, 
		       created_at, updated_at, created_by
		FROM car_operators
		WHERE id = $1
	`

	var operator models.CarOperator
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&operator.ID,
		&operator.EmployeeNumber,
		&operator.FirstName,
		&operator.LastName,
		&operator.Email,
		&operator.Phone,
		&operator.Department,
		&operator.IsActive,
		&operator.CreatedAt,
		&operator.UpdatedAt,
		&operator.CreatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("operator not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find operator: %w", err)
	}

	return &operator, nil
}

// FindByEmployeeNumber retrieves an operator by employee number
func (r *OperatorRepository) FindByEmployeeNumber(ctx context.Context, employeeNumber string) (*models.CarOperator, error) {
	query := `
		SELECT id, employee_number, first_name, last_name, 
		       email, phone, department, is_active, 
		       created_at, updated_at, created_by
		FROM car_operators
		WHERE employee_number = $1
	`

	var operator models.CarOperator
	err := r.db.QueryRowContext(ctx, query, employeeNumber).Scan(
		&operator.ID,
		&operator.EmployeeNumber,
		&operator.FirstName,
		&operator.LastName,
		&operator.Email,
		&operator.Phone,
		&operator.Department,
		&operator.IsActive,
		&operator.CreatedAt,
		&operator.UpdatedAt,
		&operator.CreatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("operator not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find operator: %w", err)
	}

	return &operator, nil
}

// FindAll retrieves operators with pagination and filters
func (r *OperatorRepository) FindAll(ctx context.Context, filters *models.OperatorFilters) ([]models.OperatorWithCurrentCar, int, error) {
	// Build WHERE clause
	where := []string{"1=1"}
	args := []interface{}{}
	argCount := 0

	if filters.IsActive != nil {
		argCount++
		where = append(where, fmt.Sprintf("o.is_active = $%d", argCount))
		args = append(args, *filters.IsActive)
	}

	if filters.Department != "" {
		argCount++
		where = append(where, fmt.Sprintf("o.department = $%d", argCount))
		args = append(args, filters.Department)
	}

	if filters.Search != "" {
		argCount++
		searchPattern := "%" + filters.Search + "%"
		where = append(where, fmt.Sprintf("(o.first_name ILIKE $%d OR o.last_name ILIKE $%d OR o.employee_number ILIKE $%d OR o.email ILIKE $%d)", argCount, argCount, argCount, argCount))
		args = append(args, searchPattern)
	}

	whereClause := strings.Join(where, " AND ")

	// Count total records
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM car_operators o WHERE %s`, whereClause)
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count operators: %w", err)
	}

	// Build ORDER BY clause
	orderBy := "o.created_at DESC"
	if filters.SortBy != "" {
		direction := "ASC"
		if filters.SortOrder == "desc" {
			direction = "DESC"
		}
		switch filters.SortBy {
		case "firstName":
			orderBy = fmt.Sprintf("o.first_name %s", direction)
		case "lastName":
			orderBy = fmt.Sprintf("o.last_name %s", direction)
		case "employeeNumber":
			orderBy = fmt.Sprintf("o.employee_number %s", direction)
		case "department":
			orderBy = fmt.Sprintf("o.department %s", direction)
		case "createdAt":
			orderBy = fmt.Sprintf("o.created_at %s", direction)
		}
	}

	// Query with pagination and current assignment
	query := fmt.Sprintf(`
		SELECT o.id, o.employee_number, o.first_name, o.last_name, 
		       o.email, o.phone, o.department, o.is_active, 
		       o.created_at, o.updated_at, o.created_by,
		       c.id, c.license_plate, c.brand, c.model, a.start_date
		FROM car_operators o
		LEFT JOIN car_operator_assignments a ON o.id = a.operator_id AND a.end_date IS NULL
		LEFT JOIN cars c ON a.car_id = c.id
		WHERE %s
		ORDER BY %s
		LIMIT $%d OFFSET $%d
	`, whereClause, orderBy, argCount+1, argCount+2)

	offset := (filters.Page - 1) * filters.Limit
	args = append(args, filters.Limit, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query operators: %w", err)
	}
	defer rows.Close()

	var operators []models.OperatorWithCurrentCar
	for rows.Next() {
		var operator models.OperatorWithCurrentCar
		var carID, licensePlate, brand, model sql.NullString
		var since sql.NullTime

		err := rows.Scan(
			&operator.ID,
			&operator.EmployeeNumber,
			&operator.FirstName,
			&operator.LastName,
			&operator.Email,
			&operator.Phone,
			&operator.Department,
			&operator.IsActive,
			&operator.CreatedAt,
			&operator.UpdatedAt,
			&operator.CreatedBy,
			&carID,
			&licensePlate,
			&brand,
			&model,
			&since,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan operator: %w", err)
		}

		if carID.Valid {
			operator.CurrentCar = &models.CurrentCarInfo{
				ID:           carID.String,
				LicensePlate: licensePlate.String,
				Brand:        brand.String,
				Model:        model.String,
				Since:        since.Time,
			}
		}

		operators = append(operators, operator)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating operators: %w", err)
	}

	return operators, totalCount, nil
}

// Update updates an operator's information
func (r *OperatorRepository) Update(ctx context.Context, id string, updates map[string]interface{}) error {
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
		UPDATE car_operators
		SET %s
		WHERE id = $%d
	`, strings.Join(setClauses, ", "), argCount)

	result, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update operator: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("operator not found")
	}

	return nil
}

// Delete soft deletes an operator by setting is_active to false
func (r *OperatorRepository) Delete(ctx context.Context, id string) error {
	query := `
		UPDATE car_operators
		SET is_active = false, updated_at = $1
		WHERE id = $2
	`

	result, err := r.db.ExecContext(ctx, query, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to delete operator: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("operator not found")
	}

	return nil
}

// CreateAssignment creates a new car-operator assignment
func (r *OperatorRepository) CreateAssignment(ctx context.Context, assignment *models.CarOperatorAssignment) error {
	query := `
		INSERT INTO car_operator_assignments (id, car_id, operator_id, 
		                                      start_date, end_date, notes, 
		                                      created_at, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		assignment.ID,
		assignment.CarID,
		assignment.OperatorID,
		assignment.StartDate,
		assignment.EndDate,
		assignment.Notes,
		assignment.CreatedAt,
		assignment.CreatedBy,
	)

	if err != nil {
		if strings.Contains(err.Error(), "unique_active_operator") {
			return fmt.Errorf("operator already has an active assignment")
		}
		if strings.Contains(err.Error(), "unique_active_car_assignment") {
			return fmt.Errorf("car already has an active assignment")
		}
		return fmt.Errorf("failed to create assignment: %w", err)
	}

	return nil
}

// FindAssignmentByID retrieves an assignment by ID
func (r *OperatorRepository) FindAssignmentByID(ctx context.Context, id string) (*models.CarOperatorAssignment, error) {
	query := `
		SELECT id, car_id, operator_id, start_date, end_date, 
		       notes, created_at, created_by
		FROM car_operator_assignments
		WHERE id = $1
	`

	var assignment models.CarOperatorAssignment
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&assignment.ID,
		&assignment.CarID,
		&assignment.OperatorID,
		&assignment.StartDate,
		&assignment.EndDate,
		&assignment.Notes,
		&assignment.CreatedAt,
		&assignment.CreatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("assignment not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find assignment: %w", err)
	}

	return &assignment, nil
}

// FindActiveAssignmentByCar retrieves the active assignment for a car
func (r *OperatorRepository) FindActiveAssignmentByCar(ctx context.Context, carID string) (*models.CarOperatorAssignment, error) {
	query := `
		SELECT id, car_id, operator_id, start_date, end_date, 
		       notes, created_at, created_by
		FROM car_operator_assignments
		WHERE car_id = $1 AND end_date IS NULL
	`

	var assignment models.CarOperatorAssignment
	err := r.db.QueryRowContext(ctx, query, carID).Scan(
		&assignment.ID,
		&assignment.CarID,
		&assignment.OperatorID,
		&assignment.StartDate,
		&assignment.EndDate,
		&assignment.Notes,
		&assignment.CreatedAt,
		&assignment.CreatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find active assignment: %w", err)
	}

	return &assignment, nil
}

// FindActiveAssignmentByOperator retrieves the active assignment for an operator
func (r *OperatorRepository) FindActiveAssignmentByOperator(ctx context.Context, operatorID string) (*models.CarOperatorAssignment, error) {
	query := `
		SELECT id, car_id, operator_id, start_date, end_date, 
		       notes, created_at, created_by
		FROM car_operator_assignments
		WHERE operator_id = $1 AND end_date IS NULL
	`

	var assignment models.CarOperatorAssignment
	err := r.db.QueryRowContext(ctx, query, operatorID).Scan(
		&assignment.ID,
		&assignment.CarID,
		&assignment.OperatorID,
		&assignment.StartDate,
		&assignment.EndDate,
		&assignment.Notes,
		&assignment.CreatedAt,
		&assignment.CreatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find active assignment: %w", err)
	}

	return &assignment, nil
}

// FindAssignmentHistory retrieves assignment history based on filters
func (r *OperatorRepository) FindAssignmentHistory(ctx context.Context, filters *models.AssignmentFilters) ([]models.CarOperatorAssignment, error) {
	where := []string{"1=1"}
	args := []interface{}{}
	argCount := 0

	if filters.CarID != nil {
		argCount++
		where = append(where, fmt.Sprintf("car_id = $%d", argCount))
		args = append(args, *filters.CarID)
	}

	if filters.OperatorID != nil {
		argCount++
		where = append(where, fmt.Sprintf("operator_id = $%d", argCount))
		args = append(args, *filters.OperatorID)
	}

	if filters.Active != nil && *filters.Active {
		where = append(where, "end_date IS NULL")
	} else if filters.Active != nil && !*filters.Active {
		where = append(where, "end_date IS NOT NULL")
	}

	if filters.StartDate != nil {
		argCount++
		where = append(where, fmt.Sprintf("start_date >= $%d", argCount))
		args = append(args, *filters.StartDate)
	}

	if filters.EndDate != nil {
		argCount++
		where = append(where, fmt.Sprintf("(end_date IS NULL OR end_date <= $%d)", argCount))
		args = append(args, *filters.EndDate)
	}

	whereClause := strings.Join(where, " AND ")

	query := fmt.Sprintf(`
		SELECT id, car_id, operator_id, start_date, end_date, 
		       notes, created_at, created_by
		FROM car_operator_assignments
		WHERE %s
		ORDER BY start_date DESC
	`, whereClause)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query assignment history: %w", err)
	}
	defer rows.Close()

	var assignments []models.CarOperatorAssignment
	for rows.Next() {
		var assignment models.CarOperatorAssignment
		err := rows.Scan(
			&assignment.ID,
			&assignment.CarID,
			&assignment.OperatorID,
			&assignment.StartDate,
			&assignment.EndDate,
			&assignment.Notes,
			&assignment.CreatedAt,
			&assignment.CreatedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan assignment: %w", err)
		}
		assignments = append(assignments, assignment)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating assignments: %w", err)
	}

	return assignments, nil
}

// EndAssignment updates an assignment with an end date
func (r *OperatorRepository) EndAssignment(ctx context.Context, assignmentID string, endDate time.Time, notes *string) error {
	query := `
		UPDATE car_operator_assignments
		SET end_date = $1, notes = COALESCE($2, notes)
		WHERE id = $3 AND end_date IS NULL
	`

	result, err := r.db.ExecContext(ctx, query, endDate, notes, assignmentID)
	if err != nil {
		return fmt.Errorf("failed to end assignment: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("active assignment not found")
	}

	return nil
}

// HasActiveAssignment checks if an operator has an active assignment
func (r *OperatorRepository) HasActiveAssignment(ctx context.Context, operatorID string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM car_operator_assignments
			WHERE operator_id = $1 AND end_date IS NULL
		)
	`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, operatorID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check active assignment: %w", err)
	}

	return exists, nil
}

// CarHasActiveAssignment checks if a car has an active assignment
func (r *OperatorRepository) CarHasActiveAssignment(ctx context.Context, carID string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM car_operator_assignments
			WHERE car_id = $1 AND end_date IS NULL
		)
	`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, carID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check active assignment: %w", err)
	}

	return exists, nil
}
