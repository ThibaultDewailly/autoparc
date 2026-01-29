package repository

import (
	"context"
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRepairRepository_Create(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewRepairRepository(db)
	ctx := context.Background()

	accidentID := "accident-1"
	cost := 1500.50
	invoiceNum := "INV-2025-001"
	notes := "Front bumper replacement"
	createdBy := "admin-id"

	repair := &models.Repair{
		ID:            "repair-1",
		CarID:         "car-1",
		AccidentID:    &accidentID,
		GarageID:      "garage-1",
		RepairType:    models.RepairTypeAccident,
		Description:   "Body work repair",
		StartDate:     time.Now(),
		EndDate:       nil,
		Cost:          &cost,
		Status:        models.RepairStatusScheduled,
		InvoiceNumber: &invoiceNum,
		Notes:         &notes,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
		CreatedBy:     &createdBy,
	}

	err := repo.Create(ctx, repair)
	require.NoError(t, err)
}

func TestRepairRepository_FindByID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewRepairRepository(db)
	ctx := context.Background()

	repair, err := repo.FindByID(ctx, "repair-1")
	require.NoError(t, err)
	assert.NotNil(t, repair)
	assert.Equal(t, "repair-1", repair.ID)
}

func TestRepairRepository_FindAll(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewRepairRepository(db)
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
			name: "filter by accident",
			filters: map[string]interface{}{
				"accident_id": "accident-1",
			},
			wantErr: false,
		},
		{
			name: "filter by garage",
			filters: map[string]interface{}{
				"garage_id": "garage-1",
			},
			wantErr: false,
		},
		{
			name: "filter by type",
			filters: map[string]interface{}{
				"repair_type": string(models.RepairTypeAccident),
			},
			wantErr: false,
		},
		{
			name: "filter by status",
			filters: map[string]interface{}{
				"status": string(models.RepairStatusScheduled),
			},
			wantErr: false,
		},
		{
			name: "with search",
			filters: map[string]interface{}{
				"search": "bumper",
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
			repairs, err := repo.FindAll(ctx, tt.filters)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, repairs)
			}
		})
	}
}

func TestRepairRepository_FindByCarID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewRepairRepository(db)
	ctx := context.Background()

	repairs, err := repo.FindByCarID(ctx, "car-1")
	assert.NoError(t, err)
	assert.NotNil(t, repairs)
}

func TestRepairRepository_Update(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewRepairRepository(db)
	ctx := context.Background()

	endDate := time.Now().Add(24 * time.Hour)
	cost := 2000.00

	updates := map[string]interface{}{
		"end_date": endDate,
		"cost":     cost,
	}

	err := repo.Update(ctx, "repair-1", updates)
	assert.NoError(t, err)
}

func TestRepairRepository_Delete(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewRepairRepository(db)
	ctx := context.Background()

	err := repo.Delete(ctx, "repair-1")
	assert.NoError(t, err)
}
