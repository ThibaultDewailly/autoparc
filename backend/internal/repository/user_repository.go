package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// EmployeeFilters contains filtering options for employee queries
type EmployeeFilters struct {
	IsActive *bool
	Role     string
	Search   string
	Page     int
	Limit    int
	SortBy   string
	SortDesc bool
}

// PaginationResult contains paginated results
type PaginationResult struct {
	Items      interface{} `json:"items"`
	TotalCount int         `json:"totalCount"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	TotalPages int         `json:"totalPages"`
}

// UserRepository handles database operations for users
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// FindByEmail finds a user by email
func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*models.AdministrativeEmployee, error) {
	query := `
		SELECT id, email, password_hash, first_name, last_name, role, is_active, 
		       created_at, updated_at, last_login_at
		FROM administrative_employees
		WHERE email = $1 AND is_active = true
	`

	var user models.AdministrativeEmployee
	var lastLoginAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
		&lastLoginAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}

	return &user, nil
}

// FindByID finds a user by ID
func (r *UserRepository) FindByID(ctx context.Context, id string) (*models.AdministrativeEmployee, error) {
	query := `
		SELECT id, email, password_hash, first_name, last_name, role, is_active, 
		       created_at, updated_at, last_login_at
		FROM administrative_employees
		WHERE id = $1 AND is_active = true
	`

	var user models.AdministrativeEmployee
	var lastLoginAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
		&lastLoginAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}

	return &user, nil
}

// UpdateLastLogin updates the last login timestamp for a user
func (r *UserRepository) UpdateLastLogin(ctx context.Context, id string) error {
	query := `
		UPDATE administrative_employees
		SET last_login_at = $1
		WHERE id = $2
	`

	_, err := r.db.ExecContext(ctx, query, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	return nil
}

// Create creates a new employee in the database
func (r *UserRepository) Create(ctx context.Context, employee *models.AdministrativeEmployee) error {
	// Generate UUID if not provided
	if employee.ID == "" {
		employee.ID = uuid.New().String()
	}

	// Set timestamps
	now := time.Now()
	employee.CreatedAt = now
	employee.UpdatedAt = now

	// Set default values
	if employee.Role == "" {
		employee.Role = "admin"
	}

	query := `
		INSERT INTO administrative_employees (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
		VALUES ($1, LOWER($2), $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		employee.ID,
		employee.Email,
		employee.PasswordHash,
		employee.FirstName,
		employee.LastName,
		employee.Role,
		employee.IsActive,
		employee.CreatedAt,
		employee.UpdatedAt,
	)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint") {
			return fmt.Errorf("email already exists")
		}
		return fmt.Errorf("failed to create employee: %w", err)
	}

	return nil
}

// GetByID retrieves an employee by ID (excludes password hash)
func (r *UserRepository) GetByID(ctx context.Context, id string) (*models.AdministrativeEmployee, error) {
	query := `
		SELECT id, email, first_name, last_name, role, is_active, 
		       created_at, updated_at, last_login_at
		FROM administrative_employees
		WHERE id = $1
	`

	var employee models.AdministrativeEmployee
	var lastLoginAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&employee.ID,
		&employee.Email,
		&employee.FirstName,
		&employee.LastName,
		&employee.Role,
		&employee.IsActive,
		&employee.CreatedAt,
		&employee.UpdatedAt,
		&lastLoginAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("employee not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get employee: %w", err)
	}

	if lastLoginAt.Valid {
		employee.LastLoginAt = &lastLoginAt.Time
	}

	return &employee, nil
}

// GetByEmail retrieves an employee by email (includes password hash for authentication)
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.AdministrativeEmployee, error) {
	query := `
		SELECT id, email, password_hash, first_name, last_name, role, is_active, 
		       created_at, updated_at, last_login_at
		FROM administrative_employees
		WHERE LOWER(email) = LOWER($1)
	`

	var employee models.AdministrativeEmployee
	var lastLoginAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&employee.ID,
		&employee.Email,
		&employee.PasswordHash,
		&employee.FirstName,
		&employee.LastName,
		&employee.Role,
		&employee.IsActive,
		&employee.CreatedAt,
		&employee.UpdatedAt,
		&lastLoginAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("employee not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get employee: %w", err)
	}

	if lastLoginAt.Valid {
		employee.LastLoginAt = &lastLoginAt.Time
	}

	return &employee, nil
}

// GetAll retrieves all employees with optional filtering, pagination, and sorting
func (r *UserRepository) GetAll(ctx context.Context, filters EmployeeFilters) (*PaginationResult, error) {
	// Build WHERE clause
	whereConditions := []string{}
	args := []interface{}{}
	argCounter := 1

	if filters.IsActive != nil {
		whereConditions = append(whereConditions, fmt.Sprintf("is_active = $%d", argCounter))
		args = append(args, *filters.IsActive)
		argCounter++
	}

	if filters.Role != "" {
		whereConditions = append(whereConditions, fmt.Sprintf("role = $%d", argCounter))
		args = append(args, filters.Role)
		argCounter++
	}

	if filters.Search != "" {
		searchPattern := "%" + filters.Search + "%"
		whereConditions = append(whereConditions, fmt.Sprintf("(LOWER(first_name) LIKE LOWER($%d) OR LOWER(last_name) LIKE LOWER($%d) OR LOWER(email) LIKE LOWER($%d))", argCounter, argCounter, argCounter))
		args = append(args, searchPattern)
		argCounter++
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM administrative_employees %s", whereClause)
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("failed to count employees: %w", err)
	}

	// Build ORDER BY clause
	sortBy := "created_at"
	if filters.SortBy != "" {
		switch filters.SortBy {
		case "created_at", "last_name", "first_name", "last_login_at", "email":
			sortBy = filters.SortBy
		}
	}

	sortOrder := "ASC"
	if filters.SortDesc {
		sortOrder = "DESC"
	}

	// Build pagination
	page := filters.Page
	if page < 1 {
		page = 1
	}

	limit := filters.Limit
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	// Query employees
	query := fmt.Sprintf(`
		SELECT id, email, first_name, last_name, role, is_active, 
		       created_at, updated_at, last_login_at
		FROM administrative_employees
		%s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortBy, sortOrder, argCounter, argCounter+1)

	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query employees: %w", err)
	}
	defer rows.Close()

	employees := []*models.AdministrativeEmployee{}
	for rows.Next() {
		var employee models.AdministrativeEmployee
		var lastLoginAt sql.NullTime

		err := rows.Scan(
			&employee.ID,
			&employee.Email,
			&employee.FirstName,
			&employee.LastName,
			&employee.Role,
			&employee.IsActive,
			&employee.CreatedAt,
			&employee.UpdatedAt,
			&lastLoginAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan employee: %w", err)
		}

		if lastLoginAt.Valid {
			employee.LastLoginAt = &lastLoginAt.Time
		}

		employees = append(employees, &employee)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating employees: %w", err)
	}

	totalPages := (totalCount + limit - 1) / limit

	return &PaginationResult{
		Items:      employees,
		TotalCount: totalCount,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// Update updates an employee's details (excludes password)
func (r *UserRepository) Update(ctx context.Context, id string, employee *models.AdministrativeEmployee) error {
	employee.UpdatedAt = time.Now()

	query := `
		UPDATE administrative_employees
		SET email = LOWER($1), first_name = $2, last_name = $3, role = $4, is_active = $5, updated_at = $6
		WHERE id = $7
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		employee.Email,
		employee.FirstName,
		employee.LastName,
		employee.Role,
		employee.IsActive,
		employee.UpdatedAt,
		id,
	)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint") {
			return fmt.Errorf("email already exists")
		}
		return fmt.Errorf("failed to update employee: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("employee not found")
	}

	return nil
}

// UpdatePassword updates an employee's password hash
func (r *UserRepository) UpdatePassword(ctx context.Context, id string, passwordHash string) error {
	query := `
		UPDATE administrative_employees
		SET password_hash = $1, updated_at = $2
		WHERE id = $3
	`

	result, err := r.db.ExecContext(ctx, query, passwordHash, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("employee not found")
	}

	return nil
}

// Delete performs a soft delete by setting is_active to false
func (r *UserRepository) Delete(ctx context.Context, id string) error {
	query := `
		UPDATE administrative_employees
		SET is_active = false, updated_at = $1
		WHERE id = $2
	`

	result, err := r.db.ExecContext(ctx, query, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to delete employee: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("employee not found")
	}

	return nil
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hash), nil
}

// CheckPassword validates a password against a hash
func CheckPassword(password, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}
