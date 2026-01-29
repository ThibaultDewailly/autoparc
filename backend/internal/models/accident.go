package models

import (
	"errors"
	"time"
)

// AccidentStatus represents the status of an accident
type AccidentStatus string

const (
	AccidentStatusDeclared    AccidentStatus = "declared"
	AccidentStatusUnderReview AccidentStatus = "under_review"
	AccidentStatusApproved    AccidentStatus = "approved"
	AccidentStatusClosed      AccidentStatus = "closed"
)

// Accident represents a vehicle accident
type Accident struct {
	ID                   string          `json:"id"`
	CarID                string          `json:"carId"`
	AccidentDate         time.Time       `json:"accidentDate"`
	Location             string          `json:"location"`
	Description          string          `json:"description"`
	DamagesDescription   *string         `json:"damagesDescription,omitempty"`
	ResponsibleParty     *string         `json:"responsibleParty,omitempty"`
	PoliceReportNumber   *string         `json:"policeReportNumber,omitempty"`
	InsuranceClaimNumber *string         `json:"insuranceClaimNumber,omitempty"`
	Status               AccidentStatus  `json:"status"`
	CreatedAt            time.Time       `json:"createdAt"`
	UpdatedAt            time.Time       `json:"updatedAt"`
	CreatedBy            *string         `json:"createdBy,omitempty"`
	Car                  *Car            `json:"car,omitempty"`
	Photos               []AccidentPhoto `json:"photos,omitempty"`
	Repairs              []Repair        `json:"repairs,omitempty"`
}

// CreateAccidentRequest represents the request to create a new accident
type CreateAccidentRequest struct {
	CarID                string          `json:"carId" binding:"required"`
	AccidentDate         time.Time       `json:"accidentDate" binding:"required"`
	Location             string          `json:"location" binding:"required"`
	Description          string          `json:"description" binding:"required"`
	DamagesDescription   *string         `json:"damagesDescription,omitempty"`
	ResponsibleParty     *string         `json:"responsibleParty,omitempty"`
	PoliceReportNumber   *string         `json:"policeReportNumber,omitempty"`
	InsuranceClaimNumber *string         `json:"insuranceClaimNumber,omitempty"`
	Status               *AccidentStatus `json:"status,omitempty"`
}

// UpdateAccidentRequest represents the request to update an accident
type UpdateAccidentRequest struct {
	AccidentDate         *time.Time      `json:"accidentDate,omitempty"`
	Location             *string         `json:"location,omitempty"`
	Description          *string         `json:"description,omitempty"`
	DamagesDescription   *string         `json:"damagesDescription,omitempty"`
	ResponsibleParty     *string         `json:"responsibleParty,omitempty"`
	PoliceReportNumber   *string         `json:"policeReportNumber,omitempty"`
	InsuranceClaimNumber *string         `json:"insuranceClaimNumber,omitempty"`
	Status               *AccidentStatus `json:"status,omitempty"`
}

// UpdateAccidentStatusRequest represents the request to update accident status
type UpdateAccidentStatusRequest struct {
	Status AccidentStatus `json:"status" binding:"required"`
}

// Validate validates the CreateAccidentRequest
func (r *CreateAccidentRequest) Validate() error {
	if r.CarID == "" {
		return errors.New("l'identifiant du véhicule est requis")
	}
	if r.AccidentDate.IsZero() {
		return errors.New("la date de l'accident est requise")
	}
	if r.AccidentDate.After(time.Now()) {
		return errors.New("la date de l'accident ne peut pas être dans le futur")
	}
	if r.Location == "" {
		return errors.New("le lieu est requis")
	}
	if r.Description == "" {
		return errors.New("la description est requise")
	}
	if r.Status != nil {
		if err := ValidateAccidentStatus(*r.Status); err != nil {
			return err
		}
	}
	return nil
}

// Validate validates the UpdateAccidentRequest
func (r *UpdateAccidentRequest) Validate() error {
	if r.AccidentDate != nil {
		if r.AccidentDate.IsZero() {
			return errors.New("la date de l'accident ne peut pas être vide")
		}
		if r.AccidentDate.After(time.Now()) {
			return errors.New("la date de l'accident ne peut pas être dans le futur")
		}
	}
	if r.Location != nil && *r.Location == "" {
		return errors.New("le lieu ne peut pas être vide")
	}
	if r.Description != nil && *r.Description == "" {
		return errors.New("la description ne peut pas être vide")
	}
	if r.Status != nil {
		if err := ValidateAccidentStatus(*r.Status); err != nil {
			return err
		}
	}
	return nil
}

// ValidateAccidentStatus validates the accident status
func ValidateAccidentStatus(status AccidentStatus) error {
	switch status {
	case AccidentStatusDeclared, AccidentStatusUnderReview, AccidentStatusApproved, AccidentStatusClosed:
		return nil
	default:
		return errors.New("statut d'accident invalide")
	}
}

// Validate validates the UpdateAccidentStatusRequest
func (r *UpdateAccidentStatusRequest) Validate() error {
	return ValidateAccidentStatus(r.Status)
}
