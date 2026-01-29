package repository

import (
	"context"
	"database/sql"
	"testing"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupUserTestDB(t *testing.T) *sql.DB {
	// This would normally connect to a test database
	// For now, we'll skip actual DB tests and focus on structure
	t.Skip("Integration test - requires database")
	return nil
}

func TestUserRepository_Create(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	employee := &models.AdministrativeEmployee{
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		FirstName:    "John",
		LastName:     "Doe",
		Role:         "admin",
		IsActive:     true,
	}

	err := repo.Create(ctx, employee)
	require.NoError(t, err)
	assert.NotEmpty(t, employee.ID)
	assert.NotZero(t, employee.CreatedAt)
	assert.NotZero(t, employee.UpdatedAt)
}

func TestUserRepository_GetByID(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	id := "test-id"
	employee, err := repo.GetByID(ctx, id)
	require.NoError(t, err)
	assert.NotNil(t, employee)
	assert.Equal(t, id, employee.ID)
	assert.Equal(t, "test@example.com", employee.Email)
	assert.Equal(t, "John", employee.FirstName)
	assert.Equal(t, "Doe", employee.LastName)
	assert.NotNil(t, employee.LastLoginAt)
}

func TestUserRepository_GetByID_NotFound(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	id := "non-existent-id"
	employee, err := repo.GetByID(ctx, id)
	assert.Error(t, err)
	assert.Nil(t, employee)
	assert.Contains(t, err.Error(), "employee not found")
}

func TestUserRepository_GetByEmail(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	email := "test@example.com"
	employee, err := repo.GetByEmail(ctx, email)
	assert.NoError(t, err)
	assert.NotNil(t, employee)
	assert.Equal(t, email, employee.Email)
	assert.Equal(t, "hashedpassword", employee.PasswordHash)
	assert.Nil(t, employee.LastLoginAt)
}

func TestUserRepository_GetByEmail_CaseInsensitive(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	email := "Test@EXAMPLE.COM"
	employee, err := repo.GetByEmail(ctx, email)
	assert.NoError(t, err)
	assert.NotNil(t, employee)
}

func TestUserRepository_GetAll_WithFilters(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	isActive := true
	filters := EmployeeFilters{
		IsActive: &isActive,
		Role:     "admin",
		Search:   "John",
		Page:     1,
		Limit:    10,
		SortBy:   "last_name",
		SortDesc: false,
	}

	result, err := repo.GetAll(ctx, filters)
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 2, result.TotalCount)
	assert.Equal(t, 1, result.Page)
	assert.Equal(t, 10, result.Limit)
	assert.Equal(t, 1, result.TotalPages)

	employees := result.Items.([]*models.AdministrativeEmployee)
	assert.Len(t, employees, 2)
}

func TestUserRepository_GetAll_Pagination(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	filters := EmployeeFilters{
		Page:  2,
		Limit: 5,
	}

	result, err := repo.GetAll(ctx, filters)
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 15, result.TotalCount)
	assert.Equal(t, 2, result.Page)
	assert.Equal(t, 3, result.TotalPages) // 15 / 5 = 3
}

func TestUserRepository_GetAll_EmptyResult(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	filters := EmployeeFilters{
		Page:  1,
		Limit: 10,
	}

	result, err := repo.GetAll(ctx, filters)
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 0, result.TotalCount)

	employees := result.Items.([]*models.AdministrativeEmployee)
	assert.Len(t, employees, 0)
}

func TestUserRepository_Update(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	id := "test-id"
	employee := &models.AdministrativeEmployee{
		Email:     "updated@example.com",
		FirstName: "Jane",
		LastName:  "Smith",
		Role:      "admin",
		IsActive:  true,
	}

	err := repo.Update(ctx, id, employee)
	assert.NoError(t, err)
	assert.NotZero(t, employee.UpdatedAt)
}

func TestUserRepository_Update_NotFound(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	id := "non-existent-id"
	employee := &models.AdministrativeEmployee{
		Email:     "updated@example.com",
		FirstName: "Jane",
		LastName:  "Smith",
		Role:      "admin",
		IsActive:  true,
	}

	err := repo.Update(ctx, id, employee)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "employee not found")
}

func TestUserRepository_UpdatePassword(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	id := "test-id"
	passwordHash := "newhashedpassword"

	err := repo.UpdatePassword(ctx, id, passwordHash)
	assert.NoError(t, err)
}

func TestUserRepository_UpdatePassword_NotFound(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	id := "non-existent-id"
	passwordHash := "newhashedpassword"

	err := repo.UpdatePassword(ctx, id, passwordHash)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "employee not found")
}

func TestUserRepository_Delete(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	id := "test-id"
	err := repo.Delete(ctx, id)
	assert.NoError(t, err)
}

func TestUserRepository_Delete_NotFound(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	id := "non-existent-id"
	err := repo.Delete(ctx, id)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "employee not found")
}

func TestUserRepository_UpdateLastLogin(t *testing.T) {
	db := setupUserTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	id := "test-id"
	err := repo.UpdateLastLogin(ctx, id)
	assert.NoError(t, err)
}
