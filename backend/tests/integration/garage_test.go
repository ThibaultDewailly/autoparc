package integration

import (
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestGarageIntegration(t *testing.T) {
	cleanupDB(t)

	garageRepo := repository.NewGarageRepository(testDB)
	ctx := testContext()

	t.Run("Create garage", func(t *testing.T) {
		email := "test@garage.com"
		garage := &models.Garage{
			ID:        uuid.New().String(),
			Name:      "Garage Test",
			Phone:     "0123456789",
			Email:     &email,
			Address:   "123 Test Street",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		err := garageRepo.Create(ctx, garage)
		assert.NoError(t, err)
		assert.NotEmpty(t, garage.ID)
		assert.False(t, garage.CreatedAt.IsZero())
	})

	t.Run("Get garage by ID", func(t *testing.T) {
		// Create a garage first
		email := "get@garage.com"
		garage := &models.Garage{
			ID:        uuid.New().String(),
			Name:      "Garage Get Test",
			Phone:     "0123456789",
			Email:     &email,
			Address:   "456 Test Avenue",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		err := garageRepo.Create(ctx, garage)
		assert.NoError(t, err)

		// Retrieve it
		retrieved, err := garageRepo.FindByID(ctx, garage.ID)
		assert.NoError(t, err)
		assert.Equal(t, garage.Name, retrieved.Name)
		assert.Equal(t, garage.Phone, retrieved.Phone)
		assert.Equal(t, garage.Email, retrieved.Email)
		assert.Equal(t, garage.Address, retrieved.Address)
	})

	t.Run("Get non-existent garage", func(t *testing.T) {
		_, err := garageRepo.FindByID(ctx, "non-existent-id")
		assert.Error(t, err)
	})

	t.Run("List garages with pagination", func(t *testing.T) {
		// Create multiple garages
		for i := 0; i < 5; i++ {
			garage := &models.Garage{
				ID:        uuid.New().String(),
				Name:      "Garage " + string(rune('A'+i)),
				Phone:     "012345678" + string(rune('0'+i)),
				Address:   "Address " + string(rune('A'+i)),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			err := garageRepo.Create(ctx, garage)
			assert.NoError(t, err)
		}

		// Get first page
		filters := map[string]interface{}{
			"page":  "1",
			"limit": "3",
		}
		garages, err := garageRepo.FindAll(ctx, filters)
		assert.NoError(t, err)
		// Just check we got some results
		assert.NotEmpty(t, garages)
	})

	t.Run("Search garages by name", func(t *testing.T) {
		// Create garages with distinct names
		garage1 := &models.Garage{
			ID:        uuid.New().String(),
			Name:      "Carrosserie Dupont",
			Phone:     "0111111111",
			Address:   "1 Rue Paris",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		garage2 := &models.Garage{
			ID:        uuid.New().String(),
			Name:      "Auto Repair Martin",
			Phone:     "0222222222",
			Address:   "2 Rue Lyon",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		garageRepo.Create(ctx, garage1)
		garageRepo.Create(ctx, garage2)

		// Search for "Dupont"
		filters := map[string]interface{}{
			"search": "Dupont",
		}
		garages, err := garageRepo.FindAll(ctx, filters)
		assert.NoError(t, err)
		assert.NotEmpty(t, garages)

		found := false
		for _, g := range garages {
			if g.Name == "Carrosserie Dupont" {
				found = true
				break
			}
		}
		assert.True(t, found)
	})

	t.Run("Filter active garages only", func(t *testing.T) {
		// This test just verifies the filter parameter works
		// We don't check exact counts since previous tests added garages
		filters := map[string]interface{}{
			"is_active": "true",
		}
		garages, err := garageRepo.FindAll(ctx, filters)
		assert.NoError(t, err)
		assert.NotNil(t, garages)
	})

	t.Run("Update garage", func(t *testing.T) {
		// Create garage
		email := "update@garage.com"
		garage := &models.Garage{
			ID:        uuid.New().String(),
			Name:      "Garage Update Test",
			Phone:     "0555555555",
			Email:     &email,
			Address:   "5 Rue Update",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		err := garageRepo.Create(ctx, garage)
		assert.NoError(t, err)

		// Update it
		updates := map[string]interface{}{
			"name":  "Updated Garage Name",
			"phone": "0666666666",
		}
		err = garageRepo.Update(ctx, garage.ID, updates)
		assert.NoError(t, err)

		// Verify updates
		updated, err := garageRepo.FindByID(ctx, garage.ID)
		assert.NoError(t, err)
		assert.Equal(t, "Updated Garage Name", updated.Name)
		assert.Equal(t, "0666666666", updated.Phone)
		assert.Equal(t, garage.Address, updated.Address) // Unchanged
	})

	t.Run("Delete garage not used by repairs", func(t *testing.T) {
		// Create garage
		garage := &models.Garage{
			ID:        uuid.New().String(),
			Name:      "Garage Delete Test",
			Phone:     "0777777777",
			Address:   "7 Rue Delete",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		err := garageRepo.Create(ctx, garage)
		assert.NoError(t, err)

		// Delete it
		err = garageRepo.Delete(ctx, garage.ID)
		assert.NoError(t, err)

		// Verify it's deleted (marked inactive)
		deleted, err := garageRepo.FindByID(ctx, garage.ID)
		assert.NoError(t, err)
		assert.False(t, deleted.IsActive)
	})

	t.Run("Check if garage is used by repairs", func(t *testing.T) {
		// Create garage
		garage := &models.Garage{
			ID:        uuid.New().String(),
			Name:      "Garage With Repairs",
			Phone:     "0888888888",
			Address:   "8 Rue Repairs",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		err := garageRepo.Create(ctx, garage)
		assert.NoError(t, err)

		// Check usage (should be false initially)
		isUsed, err := garageRepo.IsUsedByRepairs(ctx, garage.ID)
		assert.NoError(t, err)
		assert.False(t, isUsed)

		// Create a car for repair
		carRepo := repository.NewCarRepository(testDB)
		insuranceRepo := repository.NewInsuranceRepository(testDB)
		companies, _ := insuranceRepo.FindAll(ctx)

		car := &models.Car{
			ID:                 uuid.New().String(),
			LicensePlate:       "AA-999-ZZ",
			Brand:              "TestBrand",
			Model:              "TestModel",
			GreyCardNumber:     "GC999",
			InsuranceCompanyID: companies[0].ID,
			Status:             models.CarStatusActive,
			CreatedBy:          "00000000-0000-0000-0000-000000000001",
			CreatedAt:          time.Now(),
			UpdatedAt:          time.Now(),
		}
		err = carRepo.Create(ctx, car)
		assert.NoError(t, err)

		// Create repair linked to this garage
		repairRepo := repository.NewRepairRepository(testDB)
		userID := "00000000-0000-0000-0000-000000000001"
		repair := &models.Repair{
			ID:          uuid.New().String(),
			CarID:       car.ID,
			GarageID:    garage.ID,
			RepairType:  models.RepairTypeMaintenance,
			Description: "Test repair",
			Status:      models.RepairStatusScheduled,
			CreatedBy:   &userID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		err = repairRepo.Create(ctx, repair)
		assert.NoError(t, err)

		// Check usage again (should be true now)
		isUsed, err = garageRepo.IsUsedByRepairs(ctx, garage.ID)
		assert.NoError(t, err)
		assert.True(t, isUsed)
	})

	t.Run("Count garages", func(t *testing.T) {
		count, err := garageRepo.Count(ctx, map[string]interface{}{})
		assert.NoError(t, err)
		assert.Greater(t, count, 0)
	})
}
