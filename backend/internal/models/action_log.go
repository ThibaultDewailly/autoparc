package models

import (
	"encoding/json"
	"time"
)

// ActionType represents the type of action performed
type ActionType string

const (
	ActionTypeCreate       ActionType = "create"
	ActionTypeUpdate       ActionType = "update"
	ActionTypeDelete       ActionType = "delete"
	ActionTypeStatusChange ActionType = "status_change"
	ActionTypePhotoUpload  ActionType = "photo_upload"
)

// EntityType represents the type of entity
type EntityType string

const (
	EntityTypeCar                    EntityType = "car"
	EntityTypeInsuranceCompany       EntityType = "insurance_company"
	EntityTypeAdministrativeEmployee EntityType = "administrative_employee"
	EntityTypeOperator               EntityType = "operator"
	EntityTypeGarage                 EntityType = "garage"
	EntityTypeAccident               EntityType = "accident"
	EntityTypeRepair                 EntityType = "repair"
)

// ActionLog represents an audit log entry
type ActionLog struct {
	ID          string          `json:"id"`
	EntityType  EntityType      `json:"entityType"`
	EntityID    string          `json:"entityId"`
	ActionType  ActionType      `json:"actionType"`
	PerformedBy string          `json:"performedBy"`
	Changes     json.RawMessage `json:"changes"`
	Timestamp   time.Time       `json:"timestamp"`
}
