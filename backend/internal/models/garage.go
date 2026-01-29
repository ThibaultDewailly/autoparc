package models

import (
	"errors"
	"regexp"
	"time"
)

// Garage represents a repair garage or service provider
type Garage struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	ContactPerson  *string   `json:"contactPerson,omitempty"`
	Phone          string    `json:"phone"`
	Email          *string   `json:"email,omitempty"`
	Address        string    `json:"address"`
	Specialization *string   `json:"specialization,omitempty"`
	IsActive       bool      `json:"isActive"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
	CreatedBy      *string   `json:"createdBy,omitempty"`
}

// CreateGarageRequest represents the request to create a new garage
type CreateGarageRequest struct {
	Name           string  `json:"name" binding:"required"`
	ContactPerson  *string `json:"contactPerson,omitempty"`
	Phone          string  `json:"phone" binding:"required"`
	Email          *string `json:"email,omitempty"`
	Address        string  `json:"address" binding:"required"`
	Specialization *string `json:"specialization,omitempty"`
	IsActive       *bool   `json:"isActive,omitempty"`
}

// UpdateGarageRequest represents the request to update a garage
type UpdateGarageRequest struct {
	Name           *string `json:"name,omitempty"`
	ContactPerson  *string `json:"contactPerson,omitempty"`
	Phone          *string `json:"phone,omitempty"`
	Email          *string `json:"email,omitempty"`
	Address        *string `json:"address,omitempty"`
	Specialization *string `json:"specialization,omitempty"`
	IsActive       *bool   `json:"isActive,omitempty"`
}

// Validate validates the CreateGarageRequest
func (r *CreateGarageRequest) Validate() error {
	if r.Name == "" {
		return errors.New("le nom est requis")
	}
	if len(r.Name) > 200 {
		return errors.New("le nom ne peut pas dépasser 200 caractères")
	}
	if r.Phone == "" {
		return errors.New("le téléphone est requis")
	}
	if len(r.Phone) > 50 {
		return errors.New("le téléphone ne peut pas dépasser 50 caractères")
	}
	if r.Email != nil && *r.Email != "" {
		emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
		if !emailRegex.MatchString(*r.Email) {
			return errors.New("format d'email invalide")
		}
		if len(*r.Email) > 255 {
			return errors.New("l'email ne peut pas dépasser 255 caractères")
		}
	}
	if r.Address == "" {
		return errors.New("l'adresse est requise")
	}
	return nil
}

// Validate validates the UpdateGarageRequest
func (r *UpdateGarageRequest) Validate() error {
	if r.Name != nil && *r.Name == "" {
		return errors.New("le nom ne peut pas être vide")
	}
	if r.Name != nil && len(*r.Name) > 200 {
		return errors.New("le nom ne peut pas dépasser 200 caractères")
	}
	if r.Phone != nil && *r.Phone == "" {
		return errors.New("le téléphone ne peut pas être vide")
	}
	if r.Phone != nil && len(*r.Phone) > 50 {
		return errors.New("le téléphone ne peut pas dépasser 50 caractères")
	}
	if r.Email != nil && *r.Email != "" {
		emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
		if !emailRegex.MatchString(*r.Email) {
			return errors.New("format d'email invalide")
		}
		if len(*r.Email) > 255 {
			return errors.New("l'email ne peut pas dépasser 255 caractères")
		}
	}
	if r.Address != nil && *r.Address == "" {
		return errors.New("l'adresse ne peut pas être vide")
	}
	return nil
}
