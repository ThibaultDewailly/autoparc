package integration

import (
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestRepairIntegration(t *testing.T) {
	cleanupDB(t)

	repairRepo := repository.NewRepairRepository(testDB)
	garageRepo := repository.NewGarageRepository(testDB)
	accidentRepo := repository.NewAccidentRepository(testDB)
	carRepo := repository.NewCarRepository(testDB)
	insuranceRepo := repository.NewInsuranceRepository(testDB)
	ctx := testContext()
	userID := "00000000-0000-0000-0000-000000000001"

	// Create test data
	companies, _ := insuranceRepo.FindAll(ctx)
	testCar := &models.Car{
		ID:                 uuid.New().String(),
		LicensePlate:       "CC-333-DD",
		Brand:              "RepairTestBrand",
		Model:              "RepairTestModel",
		GreyCardNumber:     "GC333",
		InsuranceCompanyID: companies[0].ID,
		Status:             models.CarStatusActive,
		CreatedBy:          userID,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}
	err := carRepo.Create(ctx, testCar)
	assert.NoError(t, err)

	testGarage := &models.Garage{
		ID:        uuid.New().String(),
		Name:      "Test Repair Garage",
		Phone:     "0999999999",
		Address:   "999 Repair Street",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err = garageRepo.Create(ctx, testGarage)
	assert.NoError(t, err)

	t.Run("Create maintenance repair", func(t *testing.T) {
		repair := &models.Repair{
			ID:          uuid.New().String(),
			CarID:       testCar.ID,
			GarageID:    testGarage.ID,
			RepairType:  models.RepairTypeMaintenance,
			Description: "Regular maintenance",
			StartDate:   time.Now(),
			Status:      models.RepairStatusScheduled,
			CreatedBy:   &userID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		err := repairRepo.Create(ctx, repair)
		assert.NoError(t, err)
		assert.NotEmpty(t, repair.ID)
		assert.Equal(t, models.RepairTypeMaintenance, repair.RepairType)
		assert.Nil(t, repair.AccidentID)
	})

	t.Run("Create repair linked to accident", func(t *testing.T) {
		accident := &models.Accident{
			ID:           uuid.New().String(),
			CarID:        testCar.ID,
			AccidentDate: time.Now().Add(-24 * time.Hour),
			Location:     "Accident location",
			Description:  "Collision",
			Status:       models.AccidentStatusApproved,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		err := accidentRepo.Create(ctx, accident)
		assert.NoError(t, err)

		repair := &models.Repair{
			ID:          uuid.New().String(),
			CarID:       testCar.ID,
			AccidentID:  &accident.ID,
			GarageID:    testGarage.ID,
			RepairType:  models.RepairTypeAccident,
			Description: "Repair damage",
			StartDate:   time.Now(),
			Status:      models.RepairStatusScheduled,
			CreatedBy:   &userID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		err = repairRepo.Create(ctx, repair)
		assert.NoError(t, err)
		assert.NotNil(t, repair.AccidentID)
		assert.Equal(t, accident.ID, *repair.AccidentID)
	})

	t.Run("Repair workflow: scheduled -> in_progress -> completed", func(t *testing.T) {
		repair := &models.Repair{
			ID:          uuid.New().String(),
			CarID:       testCar.ID,
			GarageID:    testGarage.ID,
			RepairType:  models.RepairTypeMaintenance,
			Description: "Workflow test",
			StartDate:   time.Now(),
			Status:      models.RepairStatusScheduled,
			CreatedBy:   &userID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		err := repairRepo.Create(ctx, repair)
		assert.NoError(t, err)

		// Move to in_progress
		updates := map[string]interface{}{
			"status": string(models.RepairStatusInProgress),
		}
		err = repairRepo.Update(ctx, repair.ID, updates)
		assert.NoError(t, err)

		// Move to completed
		updates = map[string]interface{}{
			"status": string(models.RepairStatusCompleted),
		}
		err = repairRepo.Update(ctx, repair.ID, updates)
		assert.NoError(t, err)

		updated, _ := repairRepo.FindByID(ctx, repair.ID)
		assert.Equal(t, models.RepairStatusCompleted, updated.Status)
	})
}

func floatPtr(f float64) *float64 {
	return &f
}
