package repository

import (
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGarageRepository_Create(t *testing.T) {
	cleanupDB(t)

	repo := NewGarageRepository(testDB)
	ctx := testContext()

	contactPerson := "John Doe"
	email := "test@garage.com"
	specialization := "Body work"

	garage := &models.Garage{
		ID:             "550e8400-e29b-41d4-a716-446655440000",
		Name:           "Test Garage",
		ContactPerson:  &contactPerson,
		Phone:          "0123456789",
		Email:          &email,
		Address:        "123 Test St",
		Specialization: &specialization,
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
		CreatedBy:      nil, // No foreign key constraint issues
	}

	err := repo.Create(ctx, garage)
	require.NoError(t, err)
}

func TestGarageRepository_FindByID(t *testing.T) {
	cleanupDB(t)

	repo := NewGarageRepository(testDB)
	ctx := testContext()

	// Create test garage first
	garageID := "550e8400-e29b-41d4-a716-446655440010"
	name := "Test Garage"
	phone := "0123456789"
	address := "123 Test St"
	garage := &models.Garage{
		ID:        garageID,
		Name:      name,
		Phone:     phone,
		Address:   address,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err := repo.Create(ctx, garage)
	require.NoError(t, err)

	// Now find it
	found, err := repo.FindByID(ctx, garageID)
	require.NoError(t, err)
	assert.NotNil(t, found)
	assert.Equal(t, garageID, found.ID)
	assert.Equal(t, name, found.Name)
}

func TestGarageRepository_FindAll(t *testing.T) {
	cleanupDB(t)

	repo := NewGarageRepository(testDB)
	ctx := testContext()

	// Create test garages
	garages := []*models.Garage{
		{
			ID:        "550e8400-e29b-41d4-a716-446655440020",
			Name:      "Test Garage A",
			Phone:     "0123456789",
			Address:   "123 Test St",
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "550e8400-e29b-41d4-a716-446655440021",
			Name:      "Another Garage",
			Phone:     "0987654321",
			Address:   "456 Other St",
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}
	for _, g := range garages {
		err := repo.Create(ctx, g)
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
			name: "with search",
			filters: map[string]interface{}{
				"search": "Test",
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
		{
			name: "active only",
			filters: map[string]interface{}{
				"is_active": true,
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			garages, err := repo.FindAll(ctx, tt.filters)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, garages)
			}
		})
	}
}

func TestGarageRepository_Update(t *testing.T) {
	cleanupDB(t)

	repo := NewGarageRepository(testDB)
	ctx := testContext()

	// Create test garage first
	garageID := "550e8400-e29b-41d4-a716-446655440030"
	garage := &models.Garage{
		ID:        garageID,
		Name:      "Original Garage",
		Phone:     "0123456789",
		Address:   "123 Test St",
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err := repo.Create(ctx, garage)
	require.NoError(t, err)

	// Update it
	updates := map[string]interface{}{
		"name":  "Updated Garage",
		"phone": "9876543210",
	}

	err = repo.Update(ctx, garageID, updates)
	assert.NoError(t, err)

	// Verify update
	updated, err := repo.FindByID(ctx, garageID)
	require.NoError(t, err)
	assert.Equal(t, "Updated Garage", updated.Name)
	assert.Equal(t, "9876543210", updated.Phone)
}

func TestGarageRepository_Delete(t *testing.T) {
	cleanupDB(t)

	repo := NewGarageRepository(testDB)
	ctx := testContext()

	// Create test garage first
	garageID := "550e8400-e29b-41d4-a716-446655440040"
	garage := &models.Garage{
		ID:        garageID,
		Name:      "To Delete Garage",
		Phone:     "0123456789",
		Address:   "123 Test St",
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err := repo.Create(ctx, garage)
	require.NoError(t, err)

	// Delete it (soft delete sets is_active=false)
	err = repo.Delete(ctx, garageID)
	assert.NoError(t, err)

	// Verify it's marked as inactive
	deleted, err := repo.FindByID(ctx, garageID)
	require.NoError(t, err)
	assert.False(t, deleted.IsActive)
}

func TestGarageRepository_Count(t *testing.T) {
	cleanupDB(t)

	repo := NewGarageRepository(testDB)
	ctx := testContext()

	count, err := repo.Count(ctx, map[string]interface{}{})
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, count, 0)
}

func TestGarageRepository_IsUsedByRepairs(t *testing.T) {
	cleanupDB(t)

	repo := NewGarageRepository(testDB)
	ctx := testContext()

	// Create test garage first
	garageID := "550e8400-e29b-41d4-a716-446655440050"
	garage := &models.Garage{
		ID:        garageID,
		Name:      "Test Garage",
		Phone:     "0123456789",
		Address:   "123 Test St",
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err := repo.Create(ctx, garage)
	require.NoError(t, err)

	// Check if used (should be false since no repairs created)
	isUsed, err := repo.IsUsedByRepairs(ctx, garageID)
	assert.NoError(t, err)
	assert.False(t, isUsed)
}
