package service

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/google/uuid"
)

// CreateEmployeeRequest represents the request to create an employee
type CreateEmployeeRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Role      string `json:"role"`
}

// UpdateEmployeeRequest represents the request to update an employee
type UpdateEmployeeRequest struct {
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Role      string `json:"role"`
	IsActive  *bool  `json:"isActive"`
}

// ChangePasswordRequest represents the request to change password
type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

// EmployeeResponse represents the employee response DTO
type EmployeeResponse struct {
	*models.AdministrativeEmployee
}

// PaginatedEmployeesResponse represents paginated employee results
type PaginatedEmployeesResponse struct {
	Employees  []*EmployeeResponse `json:"employees"`
	TotalCount int                 `json:"totalCount"`
	Page       int                 `json:"page"`
	Limit      int                 `json:"limit"`
	TotalPages int                 `json:"totalPages"`
}

// EmployeeService handles employee business logic
type EmployeeService struct {
	userRepo      *repository.UserRepository
	actionLogRepo *repository.ActionLogRepository
}

// NewEmployeeService creates a new employee service
func NewEmployeeService(
	userRepo *repository.UserRepository,
	actionLogRepo *repository.ActionLogRepository,
) *EmployeeService {
	return &EmployeeService{
		userRepo:      userRepo,
		actionLogRepo: actionLogRepo,
	}
}

// ValidateEmail validates email format
func ValidateEmail(email string) error {
	if email == "" {
		return fmt.Errorf("email is required")
	}

	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return fmt.Errorf("invalid email format")
	}

	return nil
}

// ValidatePasswordStrength validates password strength
func ValidatePasswordStrength(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	}

	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)

	if !hasUpper || !hasLower || !hasNumber {
		return fmt.Errorf("password must contain at least one uppercase letter, one lowercase letter, and one number")
	}

	return nil
}

// CreateEmployee creates a new employee
func (s *EmployeeService) CreateEmployee(ctx context.Context, req CreateEmployeeRequest, performedBy string) (*EmployeeResponse, error) {
	// Validate email
	if err := ValidateEmail(req.Email); err != nil {
		return nil, err
	}

	// Check email uniqueness
	existing, _ := s.userRepo.GetByEmail(ctx, req.Email)
	if existing != nil {
		return nil, fmt.Errorf("email already exists")
	}

	// Validate password strength
	if err := ValidatePasswordStrength(req.Password); err != nil {
		return nil, err
	}

	// Validate required fields
	if strings.TrimSpace(req.FirstName) == "" {
		return nil, fmt.Errorf("first name is required")
	}
	if strings.TrimSpace(req.LastName) == "" {
		return nil, fmt.Errorf("last name is required")
	}

	// Set default role if not provided
	role := req.Role
	if role == "" {
		role = "admin"
	}

	// Hash password
	passwordHash, err := repository.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create employee
	employee := &models.AdministrativeEmployee{
		ID:           uuid.New().String(),
		Email:        strings.ToLower(strings.TrimSpace(req.Email)),
		PasswordHash: passwordHash,
		FirstName:    strings.TrimSpace(req.FirstName),
		LastName:     strings.TrimSpace(req.LastName),
		Role:         role,
		IsActive:     true,
	}

	err = s.userRepo.Create(ctx, employee)
	if err != nil {
		return nil, err
	}

	// Log action
	actionData := map[string]interface{}{
		"employeeId": employee.ID,
		"email":      employee.Email,
		"firstName":  employee.FirstName,
		"lastName":   employee.LastName,
		"role":       employee.Role,
	}
	jsonData, _ := json.Marshal(actionData)

	actionLog := &models.ActionLog{
		ID:          uuid.New().String(),
		ActionType:  models.ActionTypeCreate,
		EntityType:  models.EntityTypeAdministrativeEmployee,
		EntityID:    employee.ID,
		PerformedBy: performedBy,
		Changes:     jsonData,
	}

	_ = s.actionLogRepo.Create(ctx, actionLog)

	// Return sanitized response (no password hash)
	employee.PasswordHash = ""
	return &EmployeeResponse{AdministrativeEmployee: employee}, nil
}

// GetEmployee retrieves an employee by ID
func (s *EmployeeService) GetEmployee(ctx context.Context, id string) (*EmployeeResponse, error) {
	// Validate UUID format
	if _, err := uuid.Parse(id); err != nil {
		return nil, fmt.Errorf("invalid employee ID format")
	}

	employee, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return &EmployeeResponse{AdministrativeEmployee: employee}, nil
}

// GetEmployees retrieves all employees with filtering and pagination
func (s *EmployeeService) GetEmployees(ctx context.Context, filters repository.EmployeeFilters) (*PaginatedEmployeesResponse, error) {
	// Validate pagination parameters
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.Limit < 1 || filters.Limit > 100 {
		filters.Limit = 20
	}

	result, err := s.userRepo.GetAll(ctx, filters)
	if err != nil {
		return nil, err
	}

	employees := result.Items.([]*models.AdministrativeEmployee)
	responseEmployees := make([]*EmployeeResponse, len(employees))
	for i, emp := range employees {
		responseEmployees[i] = &EmployeeResponse{AdministrativeEmployee: emp}
	}

	return &PaginatedEmployeesResponse{
		Employees:  responseEmployees,
		TotalCount: result.TotalCount,
		Page:       result.Page,
		Limit:      result.Limit,
		TotalPages: result.TotalPages,
	}, nil
}

// UpdateEmployee updates an employee's details
func (s *EmployeeService) UpdateEmployee(ctx context.Context, id string, req UpdateEmployeeRequest, performedBy string) (*EmployeeResponse, error) {
	// Validate UUID format
	if _, err := uuid.Parse(id); err != nil {
		return nil, fmt.Errorf("invalid employee ID format")
	}

	// Get existing employee
	existing, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Track changes for logging
	changes := make(map[string]interface{})

	// Validate and update email if changed
	if req.Email != "" && req.Email != existing.Email {
		if err := ValidateEmail(req.Email); err != nil {
			return nil, err
		}

		// Check email uniqueness
		emailCheck, _ := s.userRepo.GetByEmail(ctx, req.Email)
		if emailCheck != nil && emailCheck.ID != id {
			return nil, fmt.Errorf("email already exists")
		}

		changes["email"] = map[string]string{
			"old": existing.Email,
			"new": req.Email,
		}
		existing.Email = strings.ToLower(strings.TrimSpace(req.Email))
	}

	// Update first name if provided
	if req.FirstName != "" && req.FirstName != existing.FirstName {
		if strings.TrimSpace(req.FirstName) == "" {
			return nil, fmt.Errorf("first name cannot be empty")
		}
		changes["firstName"] = map[string]string{
			"old": existing.FirstName,
			"new": req.FirstName,
		}
		existing.FirstName = strings.TrimSpace(req.FirstName)
	}

	// Update last name if provided
	if req.LastName != "" && req.LastName != existing.LastName {
		if strings.TrimSpace(req.LastName) == "" {
			return nil, fmt.Errorf("last name cannot be empty")
		}
		changes["lastName"] = map[string]string{
			"old": existing.LastName,
			"new": req.LastName,
		}
		existing.LastName = strings.TrimSpace(req.LastName)
	}

	// Update role if provided
	if req.Role != "" && req.Role != existing.Role {
		changes["role"] = map[string]string{
			"old": existing.Role,
			"new": req.Role,
		}
		existing.Role = req.Role
	}

	// Update is_active if provided
	if req.IsActive != nil && *req.IsActive != existing.IsActive {
		changes["isActive"] = map[string]bool{
			"old": existing.IsActive,
			"new": *req.IsActive,
		}
		existing.IsActive = *req.IsActive
	}

	// Update in database
	err = s.userRepo.Update(ctx, id, existing)
	if err != nil {
		return nil, err
	}

	// Log action if there were changes
	if len(changes) > 0 {
		jsonData, _ := json.Marshal(changes)
		actionLog := &models.ActionLog{
			ID:          uuid.New().String(),
			ActionType:  models.ActionTypeUpdate,
			EntityType:  models.EntityTypeAdministrativeEmployee,
			EntityID:    id,
			PerformedBy: performedBy,
			Changes:     jsonData,
		}
		_ = s.actionLogRepo.Create(ctx, actionLog)
	}

	return &EmployeeResponse{AdministrativeEmployee: existing}, nil
}

// ChangePassword changes an employee's password
func (s *EmployeeService) ChangePassword(ctx context.Context, id string, req ChangePasswordRequest, performedBy string) error {
	// Validate UUID format
	if _, err := uuid.Parse(id); err != nil {
		return fmt.Errorf("invalid employee ID format")
	}

	// Get employee with password hash
	employee, err := s.userRepo.GetByEmail(ctx, "")
	if err != nil {
		// Use FindByID from auth flow
		employee, err = s.userRepo.FindByID(ctx, id)
		if err != nil {
			return fmt.Errorf("employee not found")
		}
	}

	// For self-service, validate current password
	if id == performedBy && req.CurrentPassword != "" {
		err = repository.CheckPassword(req.CurrentPassword, employee.PasswordHash)
		if err != nil {
			return fmt.Errorf("current password is incorrect")
		}
	}

	// Validate new password strength
	if err := ValidatePasswordStrength(req.NewPassword); err != nil {
		return err
	}

	// Hash new password
	newPasswordHash, err := repository.HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password
	err = s.userRepo.UpdatePassword(ctx, id, newPasswordHash)
	if err != nil {
		return err
	}

	// Log action
	actionData := map[string]interface{}{
		"employeeId": id,
	}
	jsonData, _ := json.Marshal(actionData)

	actionLog := &models.ActionLog{
		ID:          uuid.New().String(),
		ActionType:  models.ActionTypeUpdate,
		EntityType:  models.EntityTypeAdministrativeEmployee,
		EntityID:    id,
		PerformedBy: performedBy,
		Changes:     jsonData,
	}
	_ = s.actionLogRepo.Create(ctx, actionLog)

	return nil
}

// DeleteEmployee performs a soft delete on an employee
func (s *EmployeeService) DeleteEmployee(ctx context.Context, id string, performedBy string) error {
	// Validate UUID format
	if _, err := uuid.Parse(id); err != nil {
		return fmt.Errorf("invalid employee ID format")
	}

	// Check if employee exists
	_, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Soft delete
	err = s.userRepo.Delete(ctx, id)
	if err != nil {
		return err
	}

	// Log action
	actionData := map[string]interface{}{
		"employeeId": id,
	}
	jsonData, _ := json.Marshal(actionData)

	actionLog := &models.ActionLog{
		ID:          uuid.New().String(),
		ActionType:  models.ActionTypeDelete,
		EntityType:  models.EntityTypeAdministrativeEmployee,
		EntityID:    id,
		PerformedBy: performedBy,
		Changes:     jsonData,
	}
	_ = s.actionLogRepo.Create(ctx, actionLog)

	return nil
}
