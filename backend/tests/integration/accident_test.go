package integration

import (
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestAccidentIntegration(t *testing.T) {
	cleanupDB(t)

	accidentRepo := repository.NewAccidentRepository(testDB)
	carRepo := repository.NewCarRepository(testDB)
	insuranceRepo := repository.NewInsuranceRepository(testDB)
	ctx := testContext()

	// Create test car
	companies, _ := insuranceRepo.FindAll(ctx)
	testCar := &models.Car{
		ID:                 uuid.New().String(),
		LicensePlate:       "AA-111-BB",
		Brand:              "TestBrand",
		Model:              "TestModel",
		GreyCardNumber:     "GC111",
		InsuranceCompanyID: companies[0].ID,
		Status:             models.CarStatusActive,
		CreatedBy:          "00000000-0000-0000-0000-000000000001",
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}
	err := carRepo.Create(ctx, testCar)
	assert.NoError(t, err)

	t.Run("Create accident", func(t *testing.T) {
		accident := &models.Accident{
			ID:           uuid.New().String(),
			CarID:        testCar.ID,
			AccidentDate: time.Now().Add(-24 * time.Hour),
			Location:     "Paris, France",
			Description:  "Minor collision",
			Status:       models.AccidentStatusDeclared,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		err := accidentRepo.Create(ctx, accident)
		assert.NoError(t, err)
		assert.NotEmpty(t, accident.ID)
	})

	t.Run("Get accident by ID", func(t *testing.T) {
		accident := &models.Accident{
			ID:           uuid.New().String(),
			CarID:        testCar.ID,
			AccidentDate: time.Now().Add(-2 * time.Hour),
			Location:     "Lyon, France",
			Description:  "Get test accident",
			Status:       models.AccidentStatusDeclared,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		err := accidentRepo.Create(ctx, accident)
		assert.NoError(t, err)

		retrieved, err := accidentRepo.FindByID(ctx, accident.ID)
		assert.NoError(t, err)
		assert.Equal(t, accident.CarID, retrieved.CarID)
		assert.Equal(t, accident.Location, retrieved.Location)
	})

	t.Run("Accident workflow: declared -> approved -> closed", func(t *testing.T) {
		accident := &models.Accident{
			ID:           uuid.New().String(),
			CarID:        testCar.ID,
			AccidentDate: time.Now().Add(-1 * time.Hour),
			Location:     "Workflow test",
			Description:  "Workflow",
			Status:       models.AccidentStatusDeclared,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		err := accidentRepo.Create(ctx, accident)
		assert.NoError(t, err)

		// Move to approved
		err = accidentRepo.UpdateStatus(ctx, accident.ID, models.AccidentStatusApproved)
		assert.NoError(t, err)

		// Move to closed
		err = accidentRepo.UpdateStatus(ctx, accident.ID, models.AccidentStatusClosed)
		assert.NoError(t, err)

		updated, _ := accidentRepo.FindByID(ctx, accident.ID)
		assert.Equal(t, models.AccidentStatusClosed, updated.Status)
	})
}
