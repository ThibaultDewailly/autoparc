package models

import (
	"errors"
	"time"
)

// RepairType represents the type of repair
type RepairType string

const (
	RepairTypeAccident    RepairType = "accident"
	RepairTypeMaintenance RepairType = "maintenance"
	RepairTypeInspection  RepairType = "inspection"
)

// RepairStatus represents the status of a repair
type RepairStatus string

const (
	RepairStatusScheduled  RepairStatus = "scheduled"
	RepairStatusInProgress RepairStatus = "in_progress"
	RepairStatusCompleted  RepairStatus = "completed"
	RepairStatusCancelled  RepairStatus = "cancelled"
)

// Repair represents a vehicle repair
type Repair struct {
	ID            string        `json:"id"`
	CarID         string        `json:"carId"`
	AccidentID    *string       `json:"accidentId,omitempty"`
	GarageID      string        `json:"garageId"`
	RepairType    RepairType    `json:"repairType"`
	Description   string        `json:"description"`
	StartDate     time.Time     `json:"startDate"`
	EndDate       *time.Time    `json:"endDate,omitempty"`
	Cost          *float64      `json:"cost,omitempty"`
	Status        RepairStatus  `json:"status"`
	InvoiceNumber *string       `json:"invoiceNumber,omitempty"`
	Notes         *string       `json:"notes,omitempty"`
	CreatedAt     time.Time     `json:"createdAt"`
	UpdatedAt     time.Time     `json:"updatedAt"`
	CreatedBy     *string       `json:"createdBy,omitempty"`
	Car           *Car          `json:"car,omitempty"`
	Accident      *Accident     `json:"accident,omitempty"`
	Garage        *Garage       `json:"garage,omitempty"`
}

// CreateRepairRequest represents the request to create a new repair
type CreateRepairRequest struct {
	CarID         string        `json:"carId" binding:"required"`
	AccidentID    *string       `json:"accidentId,omitempty"`
	GarageID      string        `json:"garageId" binding:"required"`
	RepairType    RepairType    `json:"repairType" binding:"required"`
	Description   string        `json:"description" binding:"required"`
	StartDate     time.Time     `json:"startDate" binding:"required"`
	EndDate       *time.Time    `json:"endDate,omitempty"`
	Cost          *float64      `json:"cost,omitempty"`
	Status        *RepairStatus `json:"status,omitempty"`
	InvoiceNumber *string       `json:"invoiceNumber,omitempty"`
	Notes         *string       `json:"notes,omitempty"`
}

// UpdateRepairRequest represents the request to update a repair
type UpdateRepairRequest struct {
	GarageID      *string       `json:"garageId,omitempty"`
	RepairType    *RepairType   `json:"repairType,omitempty"`
	Description   *string       `json:"description,omitempty"`
	StartDate     *time.Time    `json:"startDate,omitempty"`
	EndDate       *time.Time    `json:"endDate,omitempty"`
	Cost          *float64      `json:"cost,omitempty"`
	Status        *RepairStatus `json:"status,omitempty"`
	InvoiceNumber *string       `json:"invoiceNumber,omitempty"`
	Notes         *string       `json:"notes,omitempty"`
}

// UpdateRepairStatusRequest represents the request to update repair status
type UpdateRepairStatusRequest struct {
	Status RepairStatus `json:"status" binding:"required"`
}

// Validate validates the CreateRepairRequest
func (r *CreateRepairRequest) Validate() error {
	if r.CarID == "" {
		return errors.New("l'identifiant du véhicule est requis")
	}
	if r.GarageID == "" {
		return errors.New("l'identifiant du garage est requis")
	}
	if err := ValidateRepairType(r.RepairType); err != nil {
		return err
	}
	if r.RepairType == RepairTypeAccident && (r.AccidentID == nil || *r.AccidentID == "") {
		return errors.New("l'identifiant de l'accident est requis pour une réparation de type accident")
	}
	if r.Description == "" {
		return errors.New("la description est requise")
	}
	if r.StartDate.IsZero() {
		return errors.New("la date de début est requise")
	}
	if r.EndDate != nil && !r.EndDate.IsZero() {
		if r.EndDate.Before(r.StartDate) {
			return errors.New("la date de fin ne peut pas être avant la date de début")
		}
	}
	if r.Cost != nil && *r.Cost < 0 {
		return errors.New("le coût ne peut pas être négatif")
	}
	if r.Status != nil {
		if err := ValidateRepairStatus(*r.Status); err != nil {
			return err
		}
	}
	return nil
}

// Validate validates the UpdateRepairRequest
func (r *UpdateRepairRequest) Validate() error {
	if r.GarageID != nil && *r.GarageID == "" {
		return errors.New("l'identifiant du garage ne peut pas être vide")
	}
	if r.RepairType != nil {
		if err := ValidateRepairType(*r.RepairType); err != nil {
			return err
		}
	}
	if r.Description != nil && *r.Description == "" {
		return errors.New("la description ne peut pas être vide")
	}
	if r.StartDate != nil && r.StartDate.IsZero() {
		return errors.New("la date de début ne peut pas être vide")
	}
	if r.EndDate != nil && !r.EndDate.IsZero() && r.StartDate != nil {
		if r.EndDate.Before(*r.StartDate) {
			return errors.New("la date de fin ne peut pas être avant la date de début")
		}
	}
	if r.Cost != nil && *r.Cost < 0 {
		return errors.New("le coût ne peut pas être négatif")
	}
	if r.Status != nil {
		if err := ValidateRepairStatus(*r.Status); err != nil {
			return err
		}
	}
	return nil
}

// ValidateRepairType validates the repair type
func ValidateRepairType(repairType RepairType) error {
	switch repairType {
	case RepairTypeAccident, RepairTypeMaintenance, RepairTypeInspection:
		return nil
	default:
		return errors.New("type de réparation invalide")
	}
}

// ValidateRepairStatus validates the repair status
func ValidateRepairStatus(status RepairStatus) error {
	switch status {
	case RepairStatusScheduled, RepairStatusInProgress, RepairStatusCompleted, RepairStatusCancelled:
		return nil
	default:
		return errors.New("statut de réparation invalide")
	}
}

// CalculateDuration calculates the repair duration in days
func (r *Repair) CalculateDuration() *int {
	if r.EndDate == nil {
		return nil
	}
	days := int(r.EndDate.Sub(r.StartDate).Hours() / 24)
	return &days
}
