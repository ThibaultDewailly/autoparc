package repository

import (
	"context"
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Helper function to create a test car
func createTestCar(t *testing.T, ctx context.Context, carID string) {
	query := `
		INSERT INTO cars (id, license_plate, brand, model, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := testDB.ExecContext(ctx, query, carID, "AB-123-CD", "Toyota", "Corolla", "active", time.Now(), time.Now())
	require.NoError(t, err, "Failed to create test car")
}

func TestAccidentRepository_Create(t *testing.T) {
	cleanupDB(t)

	repo := NewAccidentRepository(testDB)
	ctx := testContext()

	// Create test car first
	carID := "550e8400-e29b-41d4-a716-446655440100"
	createTestCar(t, ctx, carID)

	accidentID := "550e8400-e29b-41d4-a716-446655440101"
	damagesDesc := "Front bumper damaged"
	responsibleParty := "Third party"

	accident := &models.Accident{
		ID:                   accidentID,
		CarID:                carID,
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
		CreatedBy:            nil,
	}

	err := repo.Create(ctx, accident)
	require.NoError(t, err)
}

func TestAccidentRepository_FindByID(t *testing.T) {
	cleanupDB(t)

	repo := NewAccidentRepository(testDB)
	ctx := testContext()

	// Create test car and accident
	carID := "550e8400-e29b-41d4-a716-446655440110"
	accidentID := "550e8400-e29b-41d4-a716-446655440111"
	createTestCar(t, ctx, carID)

	damagesDesc := "Front bumper damaged"
	accident := &models.Accident{
		ID:                 accidentID,
		CarID:              carID,
		AccidentDate:       time.Now(),
		Location:           "Highway A1",
		Description:        "Rear-end collision",
		DamagesDescription: &damagesDesc,
		Status:             models.AccidentStatusDeclared,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}
	err := repo.Create(ctx, accident)
	require.NoError(t, err)

	// Find by ID
	found, err := repo.FindByID(ctx, accidentID)
	require.NoError(t, err)
	assert.NotNil(t, found)
	assert.Equal(t, accidentID, found.ID)
}

func TestAccidentRepository_FindAll(t *testing.T) {
	cleanupDB(t)

	repo := NewAccidentRepository(testDB)
	ctx := testContext()

	// Create test car and accidents
	carID := "550e8400-e29b-41d4-a716-446655440120"
	createTestCar(t, ctx, carID)

	// Create test accidents
	accidents := []*models.Accident{
		{
			ID:           "550e8400-e29b-41d4-a716-446655440121",
			CarID:        carID,
			AccidentDate: time.Now(),
			Location:     "Highway A1",
			Description:  "Rear-end collision",
			Status:       models.AccidentStatusDeclared,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           "550e8400-e29b-41d4-a716-446655440122",
			CarID:        carID,
			AccidentDate: time.Now(),
			Location:     "City center",
			Description:  "Minor scratch",
			Status:       models.AccidentStatusUnderReview,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
	}

	for _, acc := range accidents {
		err := repo.Create(ctx, acc)
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

func TestAccidentRepository_FindByCarID(t *testing.T) {
	cleanupDB(t)

	repo := NewAccidentRepository(testDB)
	ctx := testContext()

	// Create test car and accident
	carID := "550e8400-e29b-41d4-a716-446655440130"
	createTestCar(t, ctx, carID)

	accident := &models.Accident{
		ID:           "550e8400-e29b-41d4-a716-446655440131",
		CarID:        carID,
		AccidentDate: time.Now(),
		Location:     "Highway A1",
		Description:  "Test accident",
		Status:       models.AccidentStatusDeclared,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	err := repo.Create(ctx, accident)
	require.NoError(t, err)

	accidents, err := repo.FindByCarID(ctx, carID)
	assert.NoError(t, err)
	assert.NotNil(t, accidents)
	assert.Len(t, accidents, 1)
}

func TestAccidentRepository_Update(t *testing.T) {
	cleanupDB(t)

	repo := NewAccidentRepository(testDB)
	ctx := testContext()

	// Create test car and accident
	carID := "550e8400-e29b-41d4-a716-446655440140"
	accidentID := "550e8400-e29b-41d4-a716-446655440141"
	createTestCar(t, ctx, carID)

	accident := &models.Accident{
		ID:           accidentID,
		CarID:        carID,
		AccidentDate: time.Now(),
		Location:     "Original location",
		Description:  "Test accident",
		Status:       models.AccidentStatusDeclared,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	err := repo.Create(ctx, accident)
	require.NoError(t, err)

	policeReport := "PR-2025-001"
	updates := map[string]interface{}{
		"police_report_number": policeReport,
		"location":             "Updated location",
	}

	err = repo.Update(ctx, accidentID, updates)
	assert.NoError(t, err)

	// Verify update
	updated, err := repo.FindByID(ctx, accidentID)
	require.NoError(t, err)
	assert.Equal(t, "Updated location", updated.Location)
	assert.NotNil(t, updated.PoliceReportNumber)
	assert.Equal(t, policeReport, *updated.PoliceReportNumber)
}

func TestAccidentRepository_UpdateStatus(t *testing.T) {
	cleanupDB(t)

	repo := NewAccidentRepository(testDB)
	ctx := testContext()

	// Create test car and accident
	carID := "550e8400-e29b-41d4-a716-446655440150"
	accidentID := "550e8400-e29b-41d4-a716-446655440151"
	createTestCar(t, ctx, carID)

	accident := &models.Accident{
		ID:           accidentID,
		CarID:        carID,
		AccidentDate: time.Now(),
		Location:     "Test location",
		Description:  "Test accident",
		Status:       models.AccidentStatusDeclared,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	err := repo.Create(ctx, accident)
	require.NoError(t, err)

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
			err := repo.UpdateStatus(ctx, accidentID, tt.status)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				// Verify status was updated
				updated, err := repo.FindByID(ctx, accidentID)
				require.NoError(t, err)
				assert.Equal(t, tt.status, updated.Status)
			}
		})
	}
}

func TestAccidentRepository_Delete(t *testing.T) {
	cleanupDB(t)

	repo := NewAccidentRepository(testDB)
	ctx := testContext()

	// Create test car and accident
	carID := "550e8400-e29b-41d4-a716-446655440160"
	accidentID := "550e8400-e29b-41d4-a716-446655440161"
	createTestCar(t, ctx, carID)

	accident := &models.Accident{
		ID:           accidentID,
		CarID:        carID,
		AccidentDate: time.Now(),
		Location:     "Test location",
		Description:  "Test accident",
		Status:       models.AccidentStatusDeclared,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	err := repo.Create(ctx, accident)
	require.NoError(t, err)

	err = repo.Delete(ctx, accidentID)
	assert.NoError(t, err)

	// Verify deletion (should return error when trying to find)
	_, err = repo.FindByID(ctx, accidentID)
	assert.Error(t, err)
}

func TestAccidentRepository_Count(t *testing.T) {
	cleanupDB(t)

	repo := NewAccidentRepository(testDB)
	ctx := testContext()

	count, err := repo.Count(ctx, map[string]interface{}{})
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, count, 0)
}
