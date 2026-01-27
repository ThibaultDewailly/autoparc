package integration

import (
	"context"
	"fmt"
	"sync"
	"testing"

	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/goldenkiwi/autoparc/internal/service"
	"github.com/stretchr/testify/assert"
)

func TestEmployeeIntegration(t *testing.T) {
	cleanupDB(t)

	userRepo := repository.NewUserRepository(testDB)
	actionLogRepo := repository.NewActionLogRepository(testDB)
	employeeService := service.NewEmployeeService(userRepo, actionLogRepo)

	// Get admin user for performedBy
	adminUser, err := userRepo.GetByEmail(context.Background(), "admin@autoparc.fr")
	if err != nil {
		t.Fatalf("Failed to get admin user: %v", err)
	}
	adminID := adminUser.ID

	t.Run("Complete employee lifecycle", func(t *testing.T) {
		ctx := testContext()

		// Create employee
		createReq := service.CreateEmployeeRequest{
			Email:     "john.doe@autoparc.fr",
			Password:  "SecurePass123",
			FirstName: "John",
			LastName:  "Doe",
			Role:      "admin",
		}

		employee, err := employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.NoError(t, err)
		assert.NotNil(t, employee)
		assert.Equal(t, "john.doe@autoparc.fr", employee.Email)
		assert.Equal(t, "John", employee.FirstName)
		assert.Equal(t, "Doe", employee.LastName)
		assert.Equal(t, "admin", employee.Role)
		assert.True(t, employee.IsActive)
		assert.Empty(t, employee.PasswordHash, "Password hash should not be returned")
		employeeID := employee.ID

		// Get employee
		retrieved, err := employeeService.GetEmployee(ctx, employeeID)
		assert.NoError(t, err)
		assert.NotNil(t, retrieved)
		assert.Equal(t, employeeID, retrieved.ID)
		assert.Equal(t, "john.doe@autoparc.fr", retrieved.Email)

		// Update employee
		isActive := true
		updateReq := service.UpdateEmployeeRequest{
			Email:     "john.updated@autoparc.fr",
			FirstName: "Johnny",
			LastName:  "Doe",
			Role:      "admin",
			IsActive:  &isActive,
		}

		updated, err := employeeService.UpdateEmployee(ctx, employeeID, updateReq, adminID)
		assert.NoError(t, err)
		assert.NotNil(t, updated)
		assert.Equal(t, "john.updated@autoparc.fr", updated.Email)
		assert.Equal(t, "Johnny", updated.FirstName)

		// Change password
		changeReq := service.ChangePasswordRequest{
			CurrentPassword: "SecurePass123",
			NewPassword:     "NewSecurePass456",
		}

		err = employeeService.ChangePassword(ctx, employeeID, changeReq, employeeID)
		assert.NoError(t, err)

		// Delete employee (soft delete)
		err = employeeService.DeleteEmployee(ctx, employeeID, adminID)
		assert.NoError(t, err)

		// Verify employee is soft deleted
		filters := repository.EmployeeFilters{
			Page:  1,
			Limit: 10,
		}
		activeTrue := true
		filters.IsActive = &activeTrue

		result, err := employeeService.GetEmployees(ctx, filters)
		assert.NoError(t, err)
		// Should not include the deleted employee
		for _, emp := range result.Employees {
			assert.NotEqual(t, employeeID, emp.ID)
		}
	})

	t.Run("Authentication integration", func(t *testing.T) {
		ctx := testContext()

		// Create employee with credentials
		createReq := service.CreateEmployeeRequest{
			Email:     "auth.test@autoparc.fr",
			Password:  "AuthTest123",
			FirstName: "Auth",
			LastName:  "Test",
			Role:      "admin",
		}

		employee, err := employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.NoError(t, err)
		assert.NotNil(t, employee)
		employeeID := employee.ID

		// Setup auth service for login tests
		sessionRepo := repository.NewSessionRepository(testDB)
		authService := service.NewAuthService(userRepo, sessionRepo)

		// Login with original password
		user, session, err := authService.Login(ctx, "auth.test@autoparc.fr", "AuthTest123", "127.0.0.1", "test-agent")
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.NotNil(t, session)
		assert.Equal(t, "auth.test@autoparc.fr", user.Email)

		// Change password
		changeReq := service.ChangePasswordRequest{
			CurrentPassword: "AuthTest123",
			NewPassword:     "NewAuthTest456",
		}

		err = employeeService.ChangePassword(ctx, employeeID, changeReq, employeeID)
		assert.NoError(t, err)

		// Login with new password
		user2, session2, err := authService.Login(ctx, "auth.test@autoparc.fr", "NewAuthTest456", "127.0.0.1", "test-agent")
		assert.NoError(t, err)
		assert.NotNil(t, user2)
		assert.NotNil(t, session2)

		// Login with old password should fail
		_, _, err = authService.Login(ctx, "auth.test@autoparc.fr", "AuthTest123", "127.0.0.1", "test-agent")
		assert.Error(t, err)

		// Delete employee
		err = employeeService.DeleteEmployee(ctx, employeeID, adminID)
		assert.NoError(t, err)

		// Login should fail after deletion
		_, _, err = authService.Login(ctx, "auth.test@autoparc.fr", "NewAuthTest456", "127.0.0.1", "test-agent")
		assert.Error(t, err)
	})

	t.Run("Pagination and filtering", func(t *testing.T) {
		ctx := testContext()

		// Create 5 test employees with different attributes
		testEmployees := []service.CreateEmployeeRequest{
			{
				Email:     "alice.admin@autoparc.fr",
				Password:  "AlicePass123",
				FirstName: "Alice",
				LastName:  "Admin",
				Role:      "admin",
			},
			{
				Email:     "bob.admin@autoparc.fr",
				Password:  "BobPass123",
				FirstName: "Bob",
				LastName:  "Manager",
				Role:      "admin",
			},
			{
				Email:     "charlie.user@autoparc.fr",
				Password:  "CharliePass123",
				FirstName: "Charlie",
				LastName:  "User",
				Role:      "user",
			},
			{
				Email:     "diana.admin@autoparc.fr",
				Password:  "DianaPass123",
				FirstName: "Diana",
				LastName:  "Smith",
				Role:      "admin",
			},
			{
				Email:     "eve.user@autoparc.fr",
				Password:  "EvePass123",
				FirstName: "Eve",
				LastName:  "Johnson",
				Role:      "user",
			},
		}

		createdIDs := make([]string, 0, len(testEmployees))
		for _, req := range testEmployees {
			emp, err := employeeService.CreateEmployee(ctx, req, adminID)
			assert.NoError(t, err)
			createdIDs = append(createdIDs, emp.ID)
		}

		// Deactivate one employee for filtering tests
		isActive := false
		_, err := employeeService.UpdateEmployee(ctx, createdIDs[2], service.UpdateEmployeeRequest{
			Email:     "charlie.user@autoparc.fr",
			FirstName: "Charlie",
			LastName:  "User",
			Role:      "user",
			IsActive:  &isActive,
		}, adminID)
		assert.NoError(t, err)

		// Test pagination with limit=2
		filters := repository.EmployeeFilters{
			Page:  1,
			Limit: 2,
		}

		result, err := employeeService.GetEmployees(ctx, filters)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Len(t, result.Employees, 2)
		assert.Greater(t, result.TotalCount, 2)
		assert.Greater(t, result.TotalPages, 1)
		assert.Equal(t, 1, result.Page)
		assert.Equal(t, 2, result.Limit)

		// Test page 2
		filters.Page = 2
		result, err = employeeService.GetEmployees(ctx, filters)
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.LessOrEqual(t, len(result.Employees), 2)

		// Test filter by role (admin)
		filters = repository.EmployeeFilters{
			Role:  "admin",
			Page:  1,
			Limit: 10,
		}

		result, err = employeeService.GetEmployees(ctx, filters)
		assert.NoError(t, err)
		for _, emp := range result.Employees {
			assert.Equal(t, "admin", emp.Role)
		}

		// Test filter by role (user)
		filters.Role = "user"
		result, err = employeeService.GetEmployees(ctx, filters)
		assert.NoError(t, err)
		for _, emp := range result.Employees {
			assert.Equal(t, "user", emp.Role)
		}

		// Test filter by is_active=true
		activeTrue := true
		filters = repository.EmployeeFilters{
			IsActive: &activeTrue,
			Page:     1,
			Limit:    10,
		}

		result, err = employeeService.GetEmployees(ctx, filters)
		assert.NoError(t, err)
		for _, emp := range result.Employees {
			assert.True(t, emp.IsActive)
			assert.NotEqual(t, createdIDs[2], emp.ID, "Inactive employee should not be returned")
		}

		// Test filter by is_active=false
		activeFalse := false
		filters.IsActive = &activeFalse

		result, err = employeeService.GetEmployees(ctx, filters)
		assert.NoError(t, err)
		foundInactive := false
		for _, emp := range result.Employees {
			assert.False(t, emp.IsActive)
			if emp.ID == createdIDs[2] {
				foundInactive = true
			}
		}
		assert.True(t, foundInactive, "Inactive employee should be found")

		// Test search by name
		filters = repository.EmployeeFilters{
			Search: "Alice",
			Page:   1,
			Limit:  10,
		}

		result, err = employeeService.GetEmployees(ctx, filters)
		assert.NoError(t, err)
		found := false
		for _, emp := range result.Employees {
			if emp.Email == "alice.admin@autoparc.fr" {
				found = true
				break
			}
		}
		assert.True(t, found, "Search should find Alice")

		// Test search by email
		filters.Search = "bob.admin"
		result, err = employeeService.GetEmployees(ctx, filters)
		assert.NoError(t, err)
		found = false
		for _, emp := range result.Employees {
			if emp.Email == "bob.admin@autoparc.fr" {
				found = true
				break
			}
		}
		assert.True(t, found, "Search should find Bob by email")
	})

	t.Run("Concurrent operations", func(t *testing.T) {
		ctx := testContext()

		// Test concurrent creates with same email
		var wg sync.WaitGroup
		results := make([]error, 3)

		for i := 0; i < 3; i++ {
			wg.Add(1)
			go func(index int) {
				defer wg.Done()
				createReq := service.CreateEmployeeRequest{
					Email:     "concurrent@autoparc.fr",
					Password:  "ConcurrentPass123",
					FirstName: "Concurrent",
					LastName:  fmt.Sprintf("User%d", index),
					Role:      "admin",
				}
				_, err := employeeService.CreateEmployee(context.Background(), createReq, adminID)
				results[index] = err
			}(i)
		}

		wg.Wait()

		// Only one should succeed, two should fail with duplicate email error
		successCount := 0
		errorCount := 0
		for _, err := range results {
			if err == nil {
				successCount++
			} else {
				errorCount++
			}
		}

		assert.Equal(t, 1, successCount, "Only one concurrent create should succeed")
		assert.Equal(t, 2, errorCount, "Two concurrent creates should fail")

		// Test concurrent updates (these should all succeed)
		createReq := service.CreateEmployeeRequest{
			Email:     "update.concurrent@autoparc.fr",
			Password:  "UpdatePass123",
			FirstName: "Update",
			LastName:  "Test",
			Role:      "admin",
		}

		employee, err := employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.NoError(t, err)
		employeeID := employee.ID

		updateResults := make([]error, 3)
		for i := 0; i < 3; i++ {
			wg.Add(1)
			go func(index int) {
				defer wg.Done()
				isActive := true
				updateReq := service.UpdateEmployeeRequest{
					Email:     fmt.Sprintf("update.concurrent%d@autoparc.fr", index),
					FirstName: fmt.Sprintf("Update%d", index),
					LastName:  "Test",
					Role:      "admin",
					IsActive:  &isActive,
				}
				_, err := employeeService.UpdateEmployee(context.Background(), employeeID, updateReq, adminID)
				updateResults[index] = err
			}(i)
		}

		wg.Wait()

		// All updates should succeed (last one wins)
		successfulUpdates := 0
		for _, err := range updateResults {
			if err == nil {
				successfulUpdates++
			}
		}
		assert.Greater(t, successfulUpdates, 0, "At least some updates should succeed")
	})

	t.Run("Error scenarios", func(t *testing.T) {
		ctx := testContext()

		// Test duplicate email
		createReq := service.CreateEmployeeRequest{
			Email:     "duplicate@autoparc.fr",
			Password:  "DuplicatePass123",
			FirstName: "Duplicate",
			LastName:  "Test",
			Role:      "admin",
		}

		_, err := employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.NoError(t, err)

		// Try to create again with same email
		_, err = employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "email already exists")

		// Test weak password
		createReq = service.CreateEmployeeRequest{
			Email:     "weakpass@autoparc.fr",
			Password:  "weak",
			FirstName: "Weak",
			LastName:  "Password",
			Role:      "admin",
		}

		_, err = employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "password")

		// Test invalid email format
		createReq = service.CreateEmployeeRequest{
			Email:     "invalid-email",
			Password:  "ValidPass123",
			FirstName: "Invalid",
			LastName:  "Email",
			Role:      "admin",
		}

		_, err = employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "email")

		// Test not found
		_, err = employeeService.GetEmployee(ctx, "00000000-0000-0000-0000-999999999999")
		assert.Error(t, err)

		// Test invalid UUID format
		_, err = employeeService.GetEmployee(ctx, "invalid-uuid")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid employee ID format")

		// Test wrong current password on change
		createReq = service.CreateEmployeeRequest{
			Email:     "password.change@autoparc.fr",
			Password:  "OriginalPass123",
			FirstName: "Password",
			LastName:  "Change",
			Role:      "admin",
		}

		employee, err := employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.NoError(t, err)

		changeReq := service.ChangePasswordRequest{
			CurrentPassword: "WrongPassword123",
			NewPassword:     "NewPassword456",
		}

		err = employeeService.ChangePassword(ctx, employee.ID, changeReq, employee.ID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "current password is incorrect")

		// Test empty required fields
		createReq = service.CreateEmployeeRequest{
			Email:     "empty.fields@autoparc.fr",
			Password:  "EmptyPass123",
			FirstName: "",
			LastName:  "Test",
			Role:      "admin",
		}

		_, err = employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "first name is required")

		createReq = service.CreateEmployeeRequest{
			Email:     "empty.fields@autoparc.fr",
			Password:  "EmptyPass123",
			FirstName: "Test",
			LastName:  "",
			Role:      "admin",
		}

		_, err = employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "last name is required")

		// Test empty email
		createReq = service.CreateEmployeeRequest{
			Email:     "",
			Password:  "EmptyPass123",
			FirstName: "Test",
			LastName:  "User",
			Role:      "admin",
		}

		_, err = employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "email is required")
	})

	t.Run("Action logging", func(t *testing.T) {
		ctx := testContext()

		// Create employee and verify CREATE action is logged
		createReq := service.CreateEmployeeRequest{
			Email:     "logging.test@autoparc.fr",
			Password:  "LoggingPass123",
			FirstName: "Logging",
			LastName:  "Test",
			Role:      "admin",
		}

		employee, err := employeeService.CreateEmployee(ctx, createReq, adminID)
		assert.NoError(t, err)
		employeeID := employee.ID

		// Check CREATE action log
		var createLogCount int
		err = testDB.QueryRowContext(ctx, `
			SELECT COUNT(*) FROM action_logs 
			WHERE entity_type = 'administrative_employee' 
			AND entity_id = $1 
			AND action_type = 'create'
			AND performed_by = $2
		`, employeeID, adminID).Scan(&createLogCount)
		assert.NoError(t, err)
		assert.Equal(t, 1, createLogCount, "CREATE action should be logged")

		// Update employee and verify UPDATE action is logged
		isActive := true
		updateReq := service.UpdateEmployeeRequest{
			Email:     "logging.updated@autoparc.fr",
			FirstName: "LoggingUpdated",
			LastName:  "Test",
			Role:      "admin",
			IsActive:  &isActive,
		}

		_, err = employeeService.UpdateEmployee(ctx, employeeID, updateReq, adminID)
		assert.NoError(t, err)

		// Check UPDATE action log
		var updateLogCount int
		err = testDB.QueryRowContext(ctx, `
			SELECT COUNT(*) FROM action_logs 
			WHERE entity_type = 'administrative_employee' 
			AND entity_id = $1 
			AND action_type = 'update'
			AND performed_by = $2
		`, employeeID, adminID).Scan(&updateLogCount)
		assert.NoError(t, err)
		assert.Greater(t, updateLogCount, 0, "UPDATE action should be logged")

		// Delete employee and verify DELETE action is logged
		err = employeeService.DeleteEmployee(ctx, employeeID, adminID)
		assert.NoError(t, err)

		// Check DELETE action log
		var deleteLogCount int
		err = testDB.QueryRowContext(ctx, `
			SELECT COUNT(*) FROM action_logs 
			WHERE entity_type = 'administrative_employee' 
			AND entity_id = $1 
			AND action_type = 'delete'
			AND performed_by = $2
		`, employeeID, adminID).Scan(&deleteLogCount)
		assert.NoError(t, err)
		assert.Equal(t, 1, deleteLogCount, "DELETE action should be logged")

		// Verify action log contains proper data
		var actionType, entityType, performedBy string
		err = testDB.QueryRowContext(ctx, `
			SELECT action_type, entity_type, performed_by 
			FROM action_logs 
			WHERE entity_type = 'administrative_employee' 
			AND entity_id = $1 
			AND action_type = 'create'
			LIMIT 1
		`, employeeID).Scan(&actionType, &entityType, &performedBy)
		assert.NoError(t, err)
		assert.Equal(t, "create", actionType)
		assert.Equal(t, "administrative_employee", entityType)
		assert.Equal(t, adminID, performedBy)
	})
}
