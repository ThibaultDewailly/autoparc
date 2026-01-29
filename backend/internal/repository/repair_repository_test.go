package repository

import (
	"context"
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Helper functions to create test data
func createTestCarForRepair(t *testing.T, ctx context.Context, carID string) {
	query := `
		INSERT INTO cars (id, license_plate, brand, model, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := testDB.ExecContext(ctx, query, carID, "AB-456-EF", "Honda", "Civic", "active", time.Now(), time.Now())
	require.NoError(t, err, "Failed to create test car")
}

func createTestGarageForRepair(t *testing.T, ctx context.Context, garageID string) {
	query := `
		INSERT INTO garages (id, name, phone, address, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := testDB.ExecContext(ctx, query, garageID, "Test Garage", "0123456789", "123 Test St", true, time.Now(), time.Now())
	require.NoError(t, err, "Failed to create test garage")
}

func createTestAccidentForRepair(t *testing.T, ctx context.Context, accidentID, carID string) {
	query := `
		INSERT INTO accidents (id, car_id, accident_date, location, description, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := testDB.ExecContext(ctx, query, accidentID, carID, time.Now(), "Test location", "Test accident", string(models.AccidentStatusDeclared), time.Now(), time.Now())
	require.NoError(t, err, "Failed to create test accident")
}

func TestRepairRepository_Create(t *testing.T) {
	cleanupDB(t)

	repo := NewRepairRepository(testDB)
	ctx := testContext()

	// Create test data
	carID := "550e8400-e29b-41d4-a716-446655440200"
	garageID := "550e8400-e29b-41d4-a716-446655440201"
	accidentID := "550e8400-e29b-41d4-a716-446655440202"
	repairID := "550e8400-e29b-41d4-a716-446655440203"

	createTestCarForRepair(t, ctx, carID)
	createTestGarageForRepair(t, ctx, garageID)
	createTestAccidentForRepair(t, ctx, accidentID, carID)

	cost := 1500.50
	invoiceNum := "INV-2025-001"
	notes := "Front bumper replacement"

	repair := &models.Repair{
		ID:            repairID,
		CarID:         carID,
		AccidentID:    &accidentID,
		GarageID:      garageID,
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
		CreatedBy:     nil,
	}

	err := repo.Create(ctx, repair)
	require.NoError(t, err)
}

func TestRepairRepository_FindByID(t *testing.T) {
	cleanupDB(t)

	repo := NewRepairRepository(testDB)
	ctx := testContext()

	// Create test data
	carID := "550e8400-e29b-41d4-a716-446655440210"
	garageID := "550e8400-e29b-41d4-a716-446655440211"
	repairID := "550e8400-e29b-41d4-a716-446655440212"

	createTestCarForRepair(t, ctx, carID)
	createTestGarageForRepair(t, ctx, garageID)

	repair := &models.Repair{
		ID:          repairID,
		CarID:       carID,
		GarageID:    garageID,
		RepairType:  models.RepairTypeMaintenance,
		Description: "Oil change",
		StartDate:   time.Now(),
		Status:      models.RepairStatusScheduled,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	err := repo.Create(ctx, repair)
	require.NoError(t, err)

	// Find by ID
	found, err := repo.FindByID(ctx, repairID)
	require.NoError(t, err)
	assert.NotNil(t, found)
	assert.Equal(t, repairID, found.ID)
}

func TestRepairRepository_FindAll(t *testing.T) {
	cleanupDB(t)

	repo := NewRepairRepository(testDB)
	ctx := testContext()

	// Create test data
	carID := "550e8400-e29b-41d4-a716-446655440220"
	garageID := "550e8400-e29b-41d4-a716-446655440221"
	accidentID := "550e8400-e29b-41d4-a716-446655440222"

	createTestCarForRepair(t, ctx, carID)
	createTestGarageForRepair(t, ctx, garageID)
	createTestAccidentForRepair(t, ctx, accidentID, carID)

	// Create test repairs
	repairs := []*models.Repair{
		{
			ID:          "550e8400-e29b-41d4-a716-446655440223",
			CarID:       carID,
			GarageID:    garageID,
			AccidentID:  &accidentID,
			RepairType:  models.RepairTypeAccident,
			Description: "Front bumper replacement",
			StartDate:   time.Now(),
			Status:      models.RepairStatusScheduled,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "550e8400-e29b-41d4-a716-446655440224",
			CarID:       carID,
			GarageID:    garageID,
			RepairType:  models.RepairTypeMaintenance,
			Description: "Oil change",
			StartDate:   time.Now(),
			Status:      models.RepairStatusInProgress,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	for _, rep := range repairs {
		err := repo.Create(ctx, rep)
		require.NoError(t, err)
	}

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
				"car_id": carID,
			},
			wantErr: false,
		},
		{
			name: "filter by accident",
			filters: map[string]interface{}{
				"accident_id": accidentID,
			},
			wantErr: false,
		},
		{
			name: "filter by garage",
			filters: map[string]interface{}{
				"garage_id": garageID,
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
			result, err := repo.FindAll(ctx, tt.filters)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
			}
		})
	}
}

func TestRepairRepository_FindByCarID(t *testing.T) {
	cleanupDB(t)

	repo := NewRepairRepository(testDB)
	ctx := testContext()

	// Create test data
	carID := "550e8400-e29b-41d4-a716-446655440230"
	garageID := "550e8400-e29b-41d4-a716-446655440231"

	createTestCarForRepair(t, ctx, carID)
	createTestGarageForRepair(t, ctx, garageID)

	repair := &models.Repair{
		ID:          "550e8400-e29b-41d4-a716-446655440232",
		CarID:       carID,
		GarageID:    garageID,
		RepairType:  models.RepairTypeMaintenance,
		Description: "Test repair",
		StartDate:   time.Now(),
		Status:      models.RepairStatusScheduled,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	err := repo.Create(ctx, repair)
	require.NoError(t, err)

	repairs, err := repo.FindByCarID(ctx, carID)
	assert.NoError(t, err)
	assert.NotNil(t, repairs)
	assert.Len(t, repairs, 1)
}

func TestRepairRepository_Update(t *testing.T) {
	cleanupDB(t)

	repo := NewRepairRepository(testDB)
	ctx := testContext()

	// Create test data
	carID := "550e8400-e29b-41d4-a716-446655440240"
	garageID := "550e8400-e29b-41d4-a716-446655440241"
	repairID := "550e8400-e29b-41d4-a716-446655440242"

	createTestCarForRepair(t, ctx, carID)
	createTestGarageForRepair(t, ctx, garageID)

	cost := 1000.00
	repair := &models.Repair{
		ID:          repairID,
		CarID:       carID,
		GarageID:    garageID,
		RepairType:  models.RepairTypeMaintenance,
		Description: "Initial description",
		StartDate:   time.Now(),
		Cost:        &cost,
		Status:      models.RepairStatusScheduled,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	err := repo.Create(ctx, repair)
	require.NoError(t, err)

	endDate := time.Now().Add(24 * time.Hour)
	newCost := 2000.00

	updates := map[string]interface{}{
		"end_date": endDate,
		"cost":     newCost,
	}

	err = repo.Update(ctx, repairID, updates)
	assert.NoError(t, err)

	// Verify update
	updated, err := repo.FindByID(ctx, repairID)
	require.NoError(t, err)
	assert.NotNil(t, updated.EndDate)
	assert.NotNil(t, updated.Cost)
	assert.Equal(t, newCost, *updated.Cost)
}

func TestRepairRepository_Delete(t *testing.T) {
	cleanupDB(t)

	repo := NewRepairRepository(testDB)
	ctx := testContext()

	// Create test data
	carID := "550e8400-e29b-41d4-a716-446655440250"
	garageID := "550e8400-e29b-41d4-a716-446655440251"
	repairID := "550e8400-e29b-41d4-a716-446655440252"

	createTestCarForRepair(t, ctx, carID)
	createTestGarageForRepair(t, ctx, garageID)

	repair := &models.Repair{
		ID:          repairID,
		CarID:       carID,
		GarageID:    garageID,
		RepairType:  models.RepairTypeMaintenance,
		Description: "Test repair",
		StartDate:   time.Now(),
		Status:      models.RepairStatusScheduled,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	err := repo.Create(ctx, repair)
	require.NoError(t, err)

	err = repo.Delete(ctx, repairID)
	assert.NoError(t, err)

	// Verify deletion
	_, err = repo.FindByID(ctx, repairID)
	assert.Error(t, err)
}
