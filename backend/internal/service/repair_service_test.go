package service

import (
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/stretchr/testify/assert"
)

// Service tests for repair validation logic

func TestCreateRepairRequest_Validate(t *testing.T) {
	now := time.Now()
	future := now.Add(24 * time.Hour)
	cost := 1500.50
	negativeCost := -100.0
	accidentID := "accident-123"
	
	tests := []struct {
		name    string
		req     *models.CreateRepairRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid maintenance repair",
			req: &models.CreateRepairRequest{
				CarID:       "car-123",
				GarageID:    "garage-123",
				RepairType:  models.RepairTypeMaintenance,
				Description: "Regular oil change",
				StartDate:   now,
			},
			wantErr: false,
		},
		{
			name: "valid accident repair with accident_id",
			req: &models.CreateRepairRequest{
				CarID:       "car-123",
				AccidentID:  &accidentID,
				GarageID:    "garage-123",
				RepairType:  models.RepairTypeAccident,
				Description: "Front bumper replacement",
				StartDate:   now,
			},
			wantErr: false,
		},
		{
			name: "missing car_id",
			req: &models.CreateRepairRequest{
				GarageID:    "garage-123",
				RepairType:  models.RepairTypeMaintenance,
				Description: "Oil change",
				StartDate:   now,
			},
			wantErr: true,
			errMsg:  "l'identifiant du véhicule est requis",
		},
		{
			name: "missing garage_id",
			req: &models.CreateRepairRequest{
				CarID:       "car-123",
				RepairType:  models.RepairTypeMaintenance,
				Description: "Oil change",
				StartDate:   now,
			},
			wantErr: true,
			errMsg:  "l'identifiant du garage est requis",
		},
		{
			name: "missing description",
			req: &models.CreateRepairRequest{
				CarID:      "car-123",
				GarageID:   "garage-123",
				RepairType: models.RepairTypeMaintenance,
				StartDate:  now,
			},
			wantErr: true,
			errMsg:  "la description est requise",
		},
		{
			name: "missing start_date",
			req: &models.CreateRepairRequest{
				CarID:       "car-123",
				GarageID:    "garage-123",
				RepairType:  models.RepairTypeMaintenance,
				Description: "Oil change",
			},
			wantErr: true,
			errMsg:  "la date de début est requise",
		},
		{
			name: "accident repair without accident_id",
			req: &models.CreateRepairRequest{
				CarID:       "car-123",
				GarageID:    "garage-123",
				RepairType:  models.RepairTypeAccident,
				Description: "Front bumper replacement",
				StartDate:   now,
			},
			wantErr: true,
			errMsg:  "l'identifiant de l'accident est requis pour une réparation de type accident",
		},
		{
			name: "end_date before start_date",
			req: &models.CreateRepairRequest{
				CarID:       "car-123",
				GarageID:    "garage-123",
				RepairType:  models.RepairTypeMaintenance,
				Description: "Oil change",
				StartDate:   future,
				EndDate:     &now,
			},
			wantErr: true,
			errMsg:  "la date de fin ne peut pas être avant la date de début",
		},
		{
			name: "negative cost",
			req: &models.CreateRepairRequest{
				CarID:       "car-123",
				GarageID:    "garage-123",
				RepairType:  models.RepairTypeMaintenance,
				Description: "Oil change",
				StartDate:   now,
				Cost:        &negativeCost,
			},
			wantErr: true,
			errMsg:  "le coût ne peut pas être négatif",
		},
		{
			name: "valid with all optional fields",
			req: &models.CreateRepairRequest{
				CarID:         "car-123",
				AccidentID:    &accidentID,
				GarageID:      "garage-123",
				RepairType:    models.RepairTypeAccident,
				Description:   "Complete body repair",
				StartDate:     now,
				EndDate:       &future,
				Cost:          &cost,
				InvoiceNumber: stringPtr("INV-2025-001"),
				Notes:         stringPtr("Insurance covered"),
			},
			wantErr: false,
		},
		{
			name: "invalid repair type",
			req: &models.CreateRepairRequest{
				CarID:       "car-123",
				GarageID:    "garage-123",
				RepairType:  models.RepairType("invalid"),
				Description: "Oil change",
				StartDate:   now,
			},
			wantErr: true,
			errMsg:  "type de réparation invalide",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.req.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestUpdateRepairRequest_Validate(t *testing.T) {
	now := time.Now()
	future := now.Add(24 * time.Hour)
	past := now.Add(-24 * time.Hour)
	cost := 1500.50
	negativeCost := -100.0
	
	tests := []struct {
		name    string
		req     *models.UpdateRepairRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid update with description",
			req: &models.UpdateRepairRequest{
				Description: stringPtr("Updated description"),
			},
			wantErr: false,
		},
		{
			name: "valid update with cost",
			req: &models.UpdateRepairRequest{
				Cost: &cost,
			},
			wantErr: false,
		},
		{
			name: "empty description",
			req: &models.UpdateRepairRequest{
				Description: stringPtr(""),
			},
			wantErr: true,
			errMsg:  "la description ne peut pas être vide",
		},
		{
			name: "empty garage_id",
			req: &models.UpdateRepairRequest{
				GarageID: stringPtr(""),
			},
			wantErr: true,
			errMsg:  "l'identifiant du garage ne peut pas être vide",
		},
		{
			name: "negative cost",
			req: &models.UpdateRepairRequest{
				Cost: &negativeCost,
			},
			wantErr: true,
			errMsg:  "le coût ne peut pas être négatif",
		},
		{
			name: "end_date before start_date",
			req: &models.UpdateRepairRequest{
				StartDate: &now,
				EndDate:   &past,
			},
			wantErr: true,
			errMsg:  "la date de fin ne peut pas être avant la date de début",
		},
		{
			name:    "empty update",
			req:     &models.UpdateRepairRequest{},
			wantErr: false,
		},
		{
			name: "valid update with all fields",
			req: &models.UpdateRepairRequest{
				GarageID:      stringPtr("garage-456"),
				Description:   stringPtr("Updated repair work"),
				StartDate:     &now,
				EndDate:       &future,
				Cost:          &cost,
				InvoiceNumber: stringPtr("INV-2025-002"),
				Notes:         stringPtr("Warranty work"),
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.req.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestUpdateRepairStatusRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		req     *models.UpdateRepairStatusRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid status - scheduled",
			req: &models.UpdateRepairStatusRequest{
				Status: models.RepairStatusScheduled,
			},
			wantErr: false,
		},
		{
			name: "valid status - in_progress",
			req: &models.UpdateRepairStatusRequest{
				Status: models.RepairStatusInProgress,
			},
			wantErr: false,
		},
		{
			name: "valid status - completed",
			req: &models.UpdateRepairStatusRequest{
				Status: models.RepairStatusCompleted,
			},
			wantErr: false,
		},
		{
			name: "valid status - cancelled",
			req: &models.UpdateRepairStatusRequest{
				Status: models.RepairStatusCancelled,
			},
			wantErr: false,
		},
		{
			name: "invalid status",
			req: &models.UpdateRepairStatusRequest{
				Status: models.RepairStatus("pending"),
			},
			wantErr: true,
			errMsg:  "statut de réparation invalide",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.req.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestRepairType_Validation(t *testing.T) {
	tests := []struct {
		name       string
		repairType models.RepairType
		wantErr    bool
	}{
		{
			name:       "valid - accident",
			repairType: models.RepairTypeAccident,
			wantErr:    false,
		},
		{
			name:       "valid - maintenance",
			repairType: models.RepairTypeMaintenance,
			wantErr:    false,
		},
		{
			name:       "valid - inspection",
			repairType: models.RepairTypeInspection,
			wantErr:    false,
		},
		{
			name:       "invalid type",
			repairType: models.RepairType("custom"),
			wantErr:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := models.ValidateRepairType(tt.repairType)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestRepairStatus_Validation(t *testing.T) {
	tests := []struct {
		name   string
		status models.RepairStatus
		wantErr    bool
	}{
		{
			name:   "valid - scheduled",
			status: models.RepairStatusScheduled,
			wantErr:    false,
		},
		{
			name:   "valid - in_progress",
			status: models.RepairStatusInProgress,
			wantErr:    false,
		},
		{
			name:   "valid - completed",
			status: models.RepairStatusCompleted,
			wantErr:    false,
		},
		{
			name:   "valid - cancelled",
			status: models.RepairStatusCancelled,
			wantErr:    false,
		},
		{
			name:   "invalid status",
			status: models.RepairStatus("pending"),
			wantErr:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := models.ValidateRepairStatus(tt.status)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
