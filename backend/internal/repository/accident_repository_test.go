package repository

import (
	"context"
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAccidentRepository_Create(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewAccidentRepository(db)
	ctx := context.Background()

	createdBy := "admin-id"
	damagesDesc := "Front bumper damaged"
	responsibleParty := "Third party"

	accident := &models.Accident{
		ID:                   "accident-1",
		CarID:                "car-1",
		AccidentDate:         time.Now(),
		Location:             "Highway A1",
		Description:          "Rear-end collision",
		DamagesDescription:   &damagesDesc,
		ResponsibleParty:     &responsibleParty,
		PoliceReportNumber:   nil,
		InsuranceClaimNumber: nil,
		Status:               models.AccidentStatusDeclared,
		CreatedAt:            time.Now(),
		UpdatedAt:            time.Now(),
		CreatedBy:            &createdBy,
	}

	err := repo.Create(ctx, accident)
	require.NoError(t, err)
}

func TestAccidentRepository_FindByID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewAccidentRepository(db)
	ctx := context.Background()

	accident, err := repo.FindByID(ctx, "accident-1")
	require.NoError(t, err)
	assert.NotNil(t, accident)
	assert.Equal(t, "accident-1", accident.ID)
}

func TestAccidentRepository_FindAll(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewAccidentRepository(db)
	ctx := context.Background()

	tests := []struct {
		name    string
		filters map[string]interface{}
		wantErr bool
	}{
		{
			name:    "no filters",
			filters: map[string]interface{}{},
			wantErr: false,
		},
		{
			name: "filter by car",
			filters: map[string]interface{}{
				"car_id": "car-1",
			},
			wantErr: false,
		},
		{
			name: "filter by status",
			filters: map[string]interface{}{
				"status": string(models.AccidentStatusDeclared),
			},
			wantErr: false,
		},
		{
			name: "with search",
			filters: map[string]interface{}{
				"search": "collision",
			},
			wantErr: false,
		},
		{
			name: "with pagination",
			filters: map[string]interface{}{
				"limit":  10,
				"offset": 0,
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			accidents, err := repo.FindAll(ctx, tt.filters)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, accidents)
			}
		})
	}
}

func TestAccidentRepository_FindByCarID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewAccidentRepository(db)
	ctx := context.Background()

	accidents, err := repo.FindByCarID(ctx, "car-1")
	assert.NoError(t, err)
	assert.NotNil(t, accidents)
}

func TestAccidentRepository_Update(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewAccidentRepository(db)
	ctx := context.Background()

	policeReport := "PR-2025-001"
	updates := map[string]interface{}{
		"police_report_number": policeReport,
		"location":             "Updated location",
	}

	err := repo.Update(ctx, "accident-1", updates)
	assert.NoError(t, err)
}

func TestAccidentRepository_UpdateStatus(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewAccidentRepository(db)
	ctx := context.Background()

	tests := []struct {
		name    string
		status  models.AccidentStatus
		wantErr bool
	}{
		{
			name:    "declared to under_review",
			status:  models.AccidentStatusUnderReview,
			wantErr: false,
		},
		{
			name:    "under_review to approved",
			status:  models.AccidentStatusApproved,
			wantErr: false,
		},
		{
			name:    "approved to closed",
			status:  models.AccidentStatusClosed,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := repo.UpdateStatus(ctx, "accident-1", tt.status)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestAccidentRepository_Delete(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewAccidentRepository(db)
	ctx := context.Background()

	err := repo.Delete(ctx, "accident-1")
	assert.NoError(t, err)
}

func TestAccidentRepository_Count(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewAccidentRepository(db)
	ctx := context.Background()

	count, err := repo.Count(ctx, map[string]interface{}{})
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, count, 0)
}
