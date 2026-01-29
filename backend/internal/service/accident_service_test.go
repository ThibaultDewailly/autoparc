package service

import (
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/stretchr/testify/assert"
)

// Service tests for accident validation logic

func TestCreateAccidentRequest_Validate(t *testing.T) {
	now := time.Now()
	future := now.Add(24 * time.Hour)

	tests := []struct {
		name    string
		req     *models.CreateAccidentRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid request",
			req: &models.CreateAccidentRequest{
				CarID:        "car-123",
				AccidentDate: now,
				Location:     "123 Main St",
				Description:  "Front collision",
			},
			wantErr: false,
		},
		{
			name: "missing car_id",
			req: &models.CreateAccidentRequest{
				AccidentDate: now,
				Location:     "123 Main St",
				Description:  "Front collision",
			},
			wantErr: true,
			errMsg:  "l'identifiant du véhicule est requis",
		},
		{
			name: "missing accident date",
			req: &models.CreateAccidentRequest{
				CarID:       "car-123",
				Location:    "123 Main St",
				Description: "Front collision",
			},
			wantErr: true,
			errMsg:  "la date de l'accident est requise",
		},
		{
			name: "future accident date",
			req: &models.CreateAccidentRequest{
				CarID:        "car-123",
				AccidentDate: future,
				Location:     "123 Main St",
				Description:  "Front collision",
			},
			wantErr: true,
			errMsg:  "la date de l'accident ne peut pas être dans le futur",
		},
		{
			name: "missing location",
			req: &models.CreateAccidentRequest{
				CarID:        "car-123",
				AccidentDate: now,
				Description:  "Front collision",
			},
			wantErr: true,
			errMsg:  "le lieu est requis",
		},
		{
			name: "missing description",
			req: &models.CreateAccidentRequest{
				CarID:        "car-123",
				AccidentDate: now,
				Location:     "123 Main St",
			},
			wantErr: true,
			errMsg:  "la description est requise",
		},
		{
			name: "valid with optional fields",
			req: &models.CreateAccidentRequest{
				CarID:                "car-123",
				AccidentDate:         now,
				Location:             "123 Main St",
				Description:          "Front collision",
				DamagesDescription:   stringPtr("Minor dent"),
				ResponsibleParty:     stringPtr("Other driver"),
				PoliceReportNumber:   stringPtr("PR-2025-001"),
				InsuranceClaimNumber: stringPtr("IC-2025-001"),
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

func TestUpdateAccidentRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		req     *models.UpdateAccidentRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid update with location",
			req: &models.UpdateAccidentRequest{
				Location: stringPtr("Updated Location"),
			},
			wantErr: false,
		},
		{
			name: "valid update with description",
			req: &models.UpdateAccidentRequest{
				Description: stringPtr("Updated description"),
			},
			wantErr: false,
		},
		{
			name: "empty location",
			req: &models.UpdateAccidentRequest{
				Location: stringPtr(""),
			},
			wantErr: true,
			errMsg:  "le lieu ne peut pas être vide",
		},
		{
			name: "empty description",
			req: &models.UpdateAccidentRequest{
				Description: stringPtr(""),
			},
			wantErr: true,
			errMsg:  "la description ne peut pas être vide",
		},
		{
			name:    "empty update",
			req:     &models.UpdateAccidentRequest{},
			wantErr: false,
		},
		{
			name: "valid update with all optional fields",
			req: &models.UpdateAccidentRequest{
				Location:             stringPtr("New Location"),
				Description:          stringPtr("New description"),
				DamagesDescription:   stringPtr("Extensive damage"),
				ResponsibleParty:     stringPtr("Driver A"),
				PoliceReportNumber:   stringPtr("PR-2025-002"),
				InsuranceClaimNumber: stringPtr("IC-2025-002"),
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

func TestUpdateAccidentStatusRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		req     *models.UpdateAccidentStatusRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid status - declared",
			req: &models.UpdateAccidentStatusRequest{
				Status: models.AccidentStatusDeclared,
			},
			wantErr: false,
		},
		{
			name: "valid status - under_review",
			req: &models.UpdateAccidentStatusRequest{
				Status: models.AccidentStatusUnderReview,
			},
			wantErr: false,
		},
		{
			name: "valid status - approved",
			req: &models.UpdateAccidentStatusRequest{
				Status: models.AccidentStatusApproved,
			},
			wantErr: false,
		},
		{
			name: "valid status - closed",
			req: &models.UpdateAccidentStatusRequest{
				Status: models.AccidentStatusClosed,
			},
			wantErr: false,
		},
		{
			name: "invalid status",
			req: &models.UpdateAccidentStatusRequest{
				Status: models.AccidentStatus("invalid"),
			},
			wantErr: true,
			errMsg:  "statut d'accident invalide",
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

func TestAccidentStatus_Validation(t *testing.T) {
	tests := []struct {
		name    string
		status  models.AccidentStatus
		wantErr bool
	}{
		{
			name:    "valid - declared",
			status:  models.AccidentStatusDeclared,
			wantErr: false,
		},
		{
			name:    "valid - under_review",
			status:  models.AccidentStatusUnderReview,
			wantErr: false,
		},
		{
			name:    "valid - approved",
			status:  models.AccidentStatusApproved,
			wantErr: false,
		},
		{
			name:    "valid - closed",
			status:  models.AccidentStatusClosed,
			wantErr: false,
		},
		{
			name:    "invalid status",
			status:  models.AccidentStatus("pending"),
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := models.ValidateAccidentStatus(tt.status)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
