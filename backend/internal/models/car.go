package models

import (
	"time"
)

// CarStatus represents the status of a car
type CarStatus string

const (
	CarStatusActive      CarStatus = "active"
	CarStatusMaintenance CarStatus = "maintenance"
	CarStatusRetired     CarStatus = "retired"
)

// Car represents a car in the fleet
type Car struct {
	ID                 string            `json:"id"`
	LicensePlate       string            `json:"licensePlate"`
	Brand              string            `json:"brand"`
	Model              string            `json:"model"`
	GreyCardNumber     string            `json:"greyCardNumber"`
	InsuranceCompanyID string            `json:"insuranceCompanyId"`
	RentalStartDate    time.Time         `json:"rentalStartDate"`
	Status             CarStatus         `json:"status"`
	CreatedAt          time.Time         `json:"createdAt"`
	UpdatedAt          time.Time         `json:"updatedAt"`
	CreatedBy          string            `json:"createdBy"`
	InsuranceCompany   *InsuranceCompany `json:"insuranceCompany,omitempty"`
	Accidents          []*Accident       `json:"accidents,omitempty"`
	Repairs            []*Repair         `json:"repairs,omitempty"`
}

// CreateCarRequest represents the request to create a new car
type CreateCarRequest struct {
	LicensePlate       string    `json:"licensePlate"`
	Brand              string    `json:"brand"`
	Model              string    `json:"model"`
	GreyCardNumber     string    `json:"greyCardNumber"`
	InsuranceCompanyID string    `json:"insuranceCompanyId"`
	RentalStartDate    time.Time `json:"rentalStartDate"`
	Status             CarStatus `json:"status"`
}

// UpdateCarRequest represents the request to update a car
type UpdateCarRequest struct {
	Brand              *string    `json:"brand,omitempty"`
	Model              *string    `json:"model,omitempty"`
	GreyCardNumber     *string    `json:"greyCardNumber,omitempty"`
	InsuranceCompanyID *string    `json:"insuranceCompanyId,omitempty"`
	RentalStartDate    *time.Time `json:"rentalStartDate,omitempty"`
	Status             *CarStatus `json:"status,omitempty"`
}

// CarFilters represents filters for car queries
type CarFilters struct {
	Status    *CarStatus
	Search    string
	Page      int
	Limit     int
	SortBy    string
	SortOrder string
}

// CarListResponse represents a paginated list of cars
type CarListResponse struct {
	Cars       []*Car `json:"cars"`
	TotalCount int    `json:"totalCount"`
	Page       int    `json:"page"`
	Limit      int    `json:"limit"`
	TotalPages int    `json:"totalPages"`
}
