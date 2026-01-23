package models

import (
	"time"
)

// InsuranceCompany represents an insurance company
type InsuranceCompany struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	ContactPerson string    `json:"contactPerson"`
	Phone         string    `json:"phone"`
	Email         string    `json:"email"`
	Address       string    `json:"address"`
	PolicyNumber  string    `json:"policyNumber"`
	IsActive      bool      `json:"isActive"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
	CreatedBy     string    `json:"createdBy"`
}
