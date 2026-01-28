package models

import (
	"time"
)

// CarOperator represents an employee who uses company cars
type CarOperator struct {
	ID             string    `json:"id"`
	EmployeeNumber string    `json:"employeeNumber"`
	FirstName      string    `json:"firstName"`
	LastName       string    `json:"lastName"`
	Email          *string   `json:"email,omitempty"`
	Phone          *string   `json:"phone,omitempty"`
	Department     *string   `json:"department,omitempty"`
	IsActive       bool      `json:"isActive"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
	CreatedBy      *string   `json:"createdBy,omitempty"`
}

// CarOperatorAssignment represents the assignment of an operator to a car
type CarOperatorAssignment struct {
	ID         string     `json:"id"`
	CarID      string     `json:"carId"`
	OperatorID string     `json:"operatorId"`
	StartDate  time.Time  `json:"startDate"`
	EndDate    *time.Time `json:"endDate,omitempty"`
	Notes      *string    `json:"notes,omitempty"`
	CreatedAt  time.Time  `json:"createdAt"`
	CreatedBy  *string    `json:"createdBy,omitempty"`
}

// CreateOperatorRequest represents the request to create a new operator
type CreateOperatorRequest struct {
	EmployeeNumber string  `json:"employeeNumber"`
	FirstName      string  `json:"firstName"`
	LastName       string  `json:"lastName"`
	Email          *string `json:"email,omitempty"`
	Phone          *string `json:"phone,omitempty"`
	Department     *string `json:"department,omitempty"`
}

// UpdateOperatorRequest represents the request to update an operator
type UpdateOperatorRequest struct {
	FirstName  *string `json:"firstName,omitempty"`
	LastName   *string `json:"lastName,omitempty"`
	Email      *string `json:"email,omitempty"`
	Phone      *string `json:"phone,omitempty"`
	Department *string `json:"department,omitempty"`
	IsActive   *bool   `json:"isActive,omitempty"`
}

// AssignOperatorRequest represents the request to assign an operator to a car
type AssignOperatorRequest struct {
	OperatorID string  `json:"operatorId"`
	StartDate  string  `json:"startDate"` // Format: YYYY-MM-DD
	Notes      *string `json:"notes,omitempty"`
}

// UnassignOperatorRequest represents the request to unassign an operator from a car
type UnassignOperatorRequest struct {
	EndDate string  `json:"endDate"` // Format: YYYY-MM-DD
	Notes   *string `json:"notes,omitempty"`
}

// OperatorWithCurrentCar represents an operator with their current car assignment
type OperatorWithCurrentCar struct {
	CarOperator
	CurrentCar *CurrentCarInfo `json:"currentCar,omitempty"`
}

// CurrentCarInfo represents summary information about an operator's current car
type CurrentCarInfo struct {
	ID           string    `json:"id"`
	LicensePlate string    `json:"licensePlate"`
	Brand        string    `json:"brand"`
	Model        string    `json:"model"`
	Since        time.Time `json:"since"`
}

// OperatorDetailResponse represents detailed information about an operator
type OperatorDetailResponse struct {
	CarOperator
	CurrentAssignment *CarOperatorAssignment  `json:"currentAssignment,omitempty"`
	AssignmentHistory []CarOperatorAssignment `json:"assignmentHistory"`
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
	Operators  []OperatorWithCurrentCar `json:"operators"`
	TotalCount int                      `json:"totalCount"`
	Page       int                      `json:"page"`
	Limit      int                      `json:"limit"`
	TotalPages int                      `json:"totalPages"`
}

// AssignmentFilters represents filters for assignment queries
type AssignmentFilters struct {
	CarID      *string
	OperatorID *string
	Active     *bool
	StartDate  *time.Time
	EndDate    *time.Time
}
