package models

import (
	"time"
)

// CarOperator represents an employee who uses company cars
type CarOperator struct {
	ID             string    `json:"id"`
	EmployeeNumber string    `json:"employee_number"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	Email          *string   `json:"email,omitempty"`
	Phone          *string   `json:"phone,omitempty"`
	Department     *string   `json:"department,omitempty"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	CreatedBy      *string   `json:"created_by,omitempty"`
}

// CarOperatorAssignment represents the assignment of an operator to a car
type CarOperatorAssignment struct {
	ID         string     `json:"id"`
	CarID      string     `json:"car_id"`
	OperatorID string     `json:"operator_id"`
	StartDate  time.Time  `json:"start_date"`
	EndDate    *time.Time `json:"end_date,omitempty"`
	Notes      *string    `json:"notes,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	CreatedBy  *string    `json:"created_by,omitempty"`
}

// CreateOperatorRequest represents the request to create a new operator
type CreateOperatorRequest struct {
	EmployeeNumber string  `json:"employee_number"`
	FirstName      string  `json:"first_name"`
	LastName       string  `json:"last_name"`
	Email          *string `json:"email,omitempty"`
	Phone          *string `json:"phone,omitempty"`
	Department     *string `json:"department,omitempty"`
}

// UpdateOperatorRequest represents the request to update an operator
type UpdateOperatorRequest struct {
	FirstName  *string `json:"first_name,omitempty"`
	LastName   *string `json:"last_name,omitempty"`
	Email      *string `json:"email,omitempty"`
	Phone      *string `json:"phone,omitempty"`
	Department *string `json:"department,omitempty"`
	IsActive   *bool   `json:"is_active,omitempty"`
}

// AssignOperatorRequest represents the request to assign an operator to a car
type AssignOperatorRequest struct {
	OperatorID string  `json:"operator_id"`
	StartDate  string  `json:"start_date"` // Format: YYYY-MM-DD
	Notes      *string `json:"notes,omitempty"`
}

// UnassignOperatorRequest represents the request to unassign an operator from a car
type UnassignOperatorRequest struct {
	EndDate string  `json:"end_date"` // Format: YYYY-MM-DD
	Notes   *string `json:"notes,omitempty"`
}

// OperatorWithCurrentCar represents an operator with their current car assignment
type OperatorWithCurrentCar struct {
	CarOperator
	CurrentCar *CurrentCarInfo `json:"current_car,omitempty"`
}

// CurrentCarInfo represents summary information about an operator's current car
type CurrentCarInfo struct {
	ID           string    `json:"id"`
	LicensePlate string    `json:"license_plate"`
	Brand        string    `json:"brand"`
	Model        string    `json:"model"`
	Since        time.Time `json:"since"`
}

// OperatorDetailResponse represents detailed information about an operator
type OperatorDetailResponse struct {
	CarOperator
	CurrentAssignment *CarOperatorAssignment  `json:"current_assignment,omitempty"`
	AssignmentHistory []CarOperatorAssignment `json:"assignment_history"`
}

// OperatorFilters represents filters for operator queries
type OperatorFilters struct {
	Search     string
	Department string
	IsActive   *bool
	Page       int
	Limit      int
	SortBy     string
	SortOrder  string
}

// OperatorListResponse represents a paginated list of operators
type OperatorListResponse struct {
	Data       []OperatorWithCurrentCar `json:"data"`
	Total      int                      `json:"total"`
	Page       int                      `json:"page"`
	Limit      int                      `json:"limit"`
	TotalPages int                      `json:"total_pages"`
}

// AssignmentFilters represents filters for assignment queries
type AssignmentFilters struct {
	CarID      *string
	OperatorID *string
	Active     *bool
	StartDate  *time.Time
	EndDate    *time.Time
}
