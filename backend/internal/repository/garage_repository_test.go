package repository

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestDB(t *testing.T) *sql.DB {
	// This would normally connect to a test database
	// For now, we'll skip actual DB tests and focus on structure
	t.Skip("Integration test - requires database")
	return nil
}

func TestGarageRepository_Create(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewGarageRepository(db)
	ctx := context.Background()

	contactPerson := "John Doe"
	email := "test@garage.com"
	specialization := "Body work"
	createdBy := "admin-id"

	garage := &models.Garage{
		ID:             "garage-1",
		Name:           "Test Garage",
		ContactPerson:  &contactPerson,
		Phone:          "0123456789",
		Email:          &email,
		Address:        "123 Test St",
		Specialization: &specialization,
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
		CreatedBy:      &createdBy,
	}

	err := repo.Create(ctx, garage)
	require.NoError(t, err)
}

func TestGarageRepository_FindByID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewGarageRepository(db)
	ctx := context.Background()

	garage, err := repo.FindByID(ctx, "garage-1")
	require.NoError(t, err)
	assert.NotNil(t, garage)
	assert.Equal(t, "garage-1", garage.ID)
}

func TestGarageRepository_FindAll(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewGarageRepository(db)
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
			name: "with search",
			filters: map[string]interface{}{
				"search": "test",
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
	db := setupTestDB(t)
	defer db.Close()

	repo := NewGarageRepository(db)
	ctx := context.Background()

	updates := map[string]interface{}{
		"name":  "Updated Garage",
		"phone": "9876543210",
	}

	err := repo.Update(ctx, "garage-1", updates)
	assert.NoError(t, err)
}

func TestGarageRepository_Delete(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewGarageRepository(db)
	ctx := context.Background()

	err := repo.Delete(ctx, "garage-1")
	assert.NoError(t, err)
}

func TestGarageRepository_Count(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewGarageRepository(db)
	ctx := context.Background()

	count, err := repo.Count(ctx, map[string]interface{}{})
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, count, 0)
}

func TestGarageRepository_IsUsedByRepairs(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewGarageRepository(db)
	ctx := context.Background()

	isUsed, err := repo.IsUsedByRepairs(ctx, "garage-1")
	assert.NoError(t, err)
	assert.False(t, isUsed)
}
