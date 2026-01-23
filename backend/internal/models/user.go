package models

import (
	"time"
)

// AdministrativeEmployee represents an administrative employee in the system
type AdministrativeEmployee struct {
	ID           string     `json:"id"`
	Email        string     `json:"email"`
	PasswordHash string     `json:"-"` // Never expose password hash in JSON
	FirstName    string     `json:"firstName"`
	LastName     string     `json:"lastName"`
	Role         string     `json:"role"`
	IsActive     bool       `json:"isActive"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
	LastLoginAt  *time.Time `json:"lastLoginAt,omitempty"`
}

// LoginRequest represents the login request payload
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse represents the login response
type LoginResponse struct {
	User *AdministrativeEmployee `json:"user"`
}
