package repository

import (
	"fmt"
	"testing"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUserRepository_Create(t *testing.T) {
	cleanupDB(t)
	
	repo := NewUserRepository(testDB)
	ctx := testContext()

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
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	// Create test employee
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
	id := employee.ID

	// Update last login to test it's retrieved
	err = repo.UpdateLastLogin(ctx, id)
	require.NoError(t, err)

	// Get by ID
	retrieved, err := repo.GetByID(ctx, id)
	require.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, id, retrieved.ID)
	assert.Equal(t, "test@example.com", retrieved.Email)
	assert.Equal(t, "John", retrieved.FirstName)
	assert.Equal(t, "Doe", retrieved.LastName)
	assert.NotNil(t, retrieved.LastLoginAt)
}

func TestUserRepository_GetByID_NotFound(t *testing.T) {
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	id := "550e8400-e29b-41d4-a716-446655440999"
	employee, err := repo.GetByID(ctx, id)
	assert.Error(t, err)
	assert.Nil(t, employee)
	assert.Contains(t, err.Error(), "employee not found")
}

func TestUserRepository_GetByEmail(t *testing.T) {
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	// Create test employee
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

	// Get by email
	email := "test@example.com"
	retrieved, err := repo.GetByEmail(ctx, email)
	assert.NoError(t, err)
	assert.NotNil(t, retrieved)
	assert.Equal(t, email, retrieved.Email)
	assert.Equal(t, "hashedpassword", retrieved.PasswordHash)
	assert.Nil(t, retrieved.LastLoginAt)
}

func TestUserRepository_GetByEmail_CaseInsensitive(t *testing.T) {
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	// Create test employee
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

	// Get by email with different case
	email := "Test@EXAMPLE.COM"
	retrieved, err := repo.GetByEmail(ctx, email)
	assert.NoError(t, err)
	assert.NotNil(t, retrieved)
}

func TestUserRepository_GetAll_WithFilters(t *testing.T) {
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	// Create test employees
	employees := []*models.AdministrativeEmployee{
		{
			Email:        "john1@example.com",
			PasswordHash: "hashedpassword",
			FirstName:    "John",
			LastName:     "Doe",
			Role:         "admin",
			IsActive:     true,
		},
		{
			Email:        "john2@example.com",
			PasswordHash: "hashedpassword",
			FirstName:    "John",
			LastName:     "Smith",
			Role:         "admin",
			IsActive:     true,
		},
	}

	for _, emp := range employees {
		err := repo.Create(ctx, emp)
		require.NoError(t, err)
	}

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

	employeeList := result.Items.([]*models.AdministrativeEmployee)
	assert.Len(t, employeeList, 2)
}

func TestUserRepository_GetAll_Pagination(t *testing.T) {
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	// Create 15 test employees
	for i := 0; i < 15; i++ {
		employee := &models.AdministrativeEmployee{
			Email:        fmt.Sprintf("user%d@example.com", i),
			PasswordHash: "hashedpassword",
			FirstName:    fmt.Sprintf("First%d", i),
			LastName:     fmt.Sprintf("Last%d", i),
			Role:         "user",
			IsActive:     true,
		}
		err := repo.Create(ctx, employee)
		require.NoError(t, err)
	}

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
	cleanupDB(t)

	repo := NewUserRepository(testDB)

	
	ctx := testContext()

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
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	// Create test employee
	employee := &models.AdministrativeEmployee{
		Email:        "original@example.com",
		PasswordHash: "hashedpassword",
		FirstName:    "John",
		LastName:     "Doe",
		Role:         "user",
		IsActive:     true,
	}
	err := repo.Create(ctx, employee)
	require.NoError(t, err)
	id := employee.ID

	// Update employee
	updatedEmployee := &models.AdministrativeEmployee{
		Email:     "updated@example.com",
		FirstName: "Jane",
		LastName:  "Smith",
		Role:      "admin",
		IsActive:  true,
	}

	err = repo.Update(ctx, id, updatedEmployee)
	assert.NoError(t, err)
	assert.NotZero(t, updatedEmployee.UpdatedAt)
}

func TestUserRepository_Update_NotFound(t *testing.T) {
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	id := "550e8400-e29b-41d4-a716-446655440998"
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
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	// Create test employee
	employee := &models.AdministrativeEmployee{
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		FirstName:    "John",
		LastName:     "Doe",
		Role:         "user",
		IsActive:     true,
	}
	err := repo.Create(ctx, employee)
	require.NoError(t, err)
	id := employee.ID

	passwordHash := "newhashedpassword"

	err = repo.UpdatePassword(ctx, id, passwordHash)
	assert.NoError(t, err)
}

func TestUserRepository_UpdatePassword_NotFound(t *testing.T) {
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	id := "550e8400-e29b-41d4-a716-446655440997"
	passwordHash := "newhashedpassword"

	err := repo.UpdatePassword(ctx, id, passwordHash)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "employee not found")
}

func TestUserRepository_Delete(t *testing.T) {
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	// Create test employee
	employee := &models.AdministrativeEmployee{
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		FirstName:    "John",
		LastName:     "Doe",
		Role:         "user",
		IsActive:     true,
	}
	err := repo.Create(ctx, employee)
	require.NoError(t, err)
	id := employee.ID

	err = repo.Delete(ctx, id)
	assert.NoError(t, err)
}

func TestUserRepository_Delete_NotFound(t *testing.T) {
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	id := "550e8400-e29b-41d4-a716-446655440996"
	err := repo.Delete(ctx, id)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "employee not found")
}

func TestUserRepository_UpdateLastLogin(t *testing.T) {
	cleanupDB(t)

	repo := NewUserRepository(testDB)
	ctx := testContext()

	// Create test employee
	employee := &models.AdministrativeEmployee{
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
		FirstName:    "John",
		LastName:     "Doe",
		Role:         "user",
		IsActive:     true,
	}
	err := repo.Create(ctx, employee)
	require.NoError(t, err)
	id := employee.ID

	err = repo.UpdateLastLogin(ctx, id)
	assert.NoError(t, err)
}
