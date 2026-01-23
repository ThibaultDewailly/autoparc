package integration

import (
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/goldenkiwi/autoparc/internal/service"
)

func TestCarIntegration(t *testing.T) {
	cleanupDB(t)

	carRepo := repository.NewCarRepository(testDB)
	insuranceRepo := repository.NewInsuranceRepository(testDB)
	actionLogRepo := repository.NewActionLogRepository(testDB)
	carService := service.NewCarService(carRepo, insuranceRepo, actionLogRepo)

	// Get a valid insurance company ID from seed data
	ctx := testContext()
	companies, err := insuranceRepo.FindAll(ctx)
	if err != nil || len(companies) == 0 {
		t.Fatal("No insurance companies found in seed data")
	}
	insuranceCompanyID := companies[0].ID

	// Use the seeded admin user ID
	userID := "00000000-0000-0000-0000-000000000001"

	t.Run("Create car", func(t *testing.T) {
		ctx := testContext()

		req := &models.CreateCarRequest{
			LicensePlate:       "AA-123-BB",
			Brand:              "Renault",
			Model:              "Clio",
			GreyCardNumber:     "GC123456",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now().AddDate(0, -1, 0),
			Status:             models.CarStatusActive,
		}

		car, err := carService.CreateCar(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		if car == nil {
			t.Fatal("Expected car, got nil")
		}

		if car.LicensePlate != "AA-123-BB" {
			t.Errorf("Expected license plate AA-123-BB, got %s", car.LicensePlate)
		}

		if car.Brand != "Renault" {
			t.Errorf("Expected brand Renault, got %s", car.Brand)
		}

		if car.InsuranceCompany == nil {
			t.Error("Expected insurance company to be loaded")
		}
	})

	t.Run("Create car with invalid license plate", func(t *testing.T) {
		ctx := testContext()

		req := &models.CreateCarRequest{
			LicensePlate:       "INVALID",
			Brand:              "Renault",
			Model:              "Clio",
			GreyCardNumber:     "GC123456",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}

		_, err := carService.CreateCar(ctx, req, userID)
		if err == nil {
			t.Error("Expected error for invalid license plate")
		}
	})

	t.Run("Create car with duplicate license plate", func(t *testing.T) {
		ctx := testContext()

		req := &models.CreateCarRequest{
			LicensePlate:       "BB-456-CC",
			Brand:              "Peugeot",
			Model:              "208",
			GreyCardNumber:     "GC789012",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}

		// Create first car
		_, err := carService.CreateCar(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Try to create second car with same license plate
		_, err = carService.CreateCar(ctx, req, userID)
		if err == nil {
			t.Error("Expected error for duplicate license plate")
		}
	})

	t.Run("Get car by ID", func(t *testing.T) {
		ctx := testContext()

		// Create car first
		req := &models.CreateCarRequest{
			LicensePlate:       "CC-789-DD",
			Brand:              "Citroën",
			Model:              "C3",
			GreyCardNumber:     "GC345678",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}

		created, err := carService.CreateCar(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Get car
		car, err := carService.GetCar(ctx, created.ID)
		if err != nil {
			t.Fatalf("GetCar failed: %v", err)
		}

		if car.ID != created.ID {
			t.Errorf("Expected ID %s, got %s", created.ID, car.ID)
		}
	})

	t.Run("Get cars with pagination", func(t *testing.T) {
		ctx := testContext()

		// Create multiple cars
		for i := 0; i < 5; i++ {
			req := &models.CreateCarRequest{
				LicensePlate:       "DD-" + string(rune(100+i)) + string(rune(100+i)) + string(rune(100+i)) + "-EE",
				Brand:              "TestBrand",
				Model:              "TestModel",
				GreyCardNumber:     "GC" + string(rune(900000+i)),
				InsuranceCompanyID: insuranceCompanyID,
				RentalStartDate:    time.Now(),
				Status:             models.CarStatusActive,
			}
			_, err := carService.CreateCar(ctx, req, userID)
			if err != nil {
				t.Logf("Failed to create test car %d: %v", i, err)
			}
		}

		// Get cars with pagination
		filters := &models.CarFilters{
			Page:  1,
			Limit: 10,
		}

		response, err := carService.GetCars(ctx, filters)
		if err != nil {
			t.Fatalf("GetCars failed: %v", err)
		}

		if response.TotalCount == 0 {
			t.Error("Expected cars, got 0")
		}

		if len(response.Cars) == 0 {
			t.Error("Expected cars in response, got empty array")
		}
	})

	t.Run("Search cars", func(t *testing.T) {
		ctx := testContext()

		// Create a car with specific brand
		req := &models.CreateCarRequest{
			LicensePlate:       "EE-111-FF",
			Brand:              "SearchTest",
			Model:              "SearchModel",
			GreyCardNumber:     "GC111111",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}

		_, err := carService.CreateCar(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Search for it
		filters := &models.CarFilters{
			Search: "SearchTest",
			Page:   1,
			Limit:  10,
		}

		response, err := carService.GetCars(ctx, filters)
		if err != nil {
			t.Fatalf("GetCars failed: %v", err)
		}

		if response.TotalCount == 0 {
			t.Error("Expected to find cars with search term")
		}

		found := false
		for _, car := range response.Cars {
			if car.Brand == "SearchTest" {
				found = true
				break
			}
		}

		if !found {
			t.Error("Expected to find SearchTest car in results")
		}
	})

	t.Run("Filter cars by status", func(t *testing.T) {
		ctx := testContext()

		// Create cars with different statuses
		activeReq := &models.CreateCarRequest{
			LicensePlate:       "FF-222-GG",
			Brand:              "ActiveBrand",
			Model:              "ActiveModel",
			GreyCardNumber:     "GC222222",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}

		maintenanceReq := &models.CreateCarRequest{
			LicensePlate:       "GG-333-HH",
			Brand:              "MaintenanceBrand",
			Model:              "MaintenanceModel",
			GreyCardNumber:     "GC333333",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusMaintenance,
		}

		_, _ = carService.CreateCar(ctx, activeReq, userID)
		_, _ = carService.CreateCar(ctx, maintenanceReq, userID)

		// Filter by active status
		activeStatus := models.CarStatusActive
		filters := &models.CarFilters{
			Status: &activeStatus,
			Page:   1,
			Limit:  100,
		}

		response, err := carService.GetCars(ctx, filters)
		if err != nil {
			t.Fatalf("GetCars failed: %v", err)
		}

		// Check all returned cars are active
		for _, car := range response.Cars {
			if car.Status != models.CarStatusActive {
				t.Errorf("Expected only active cars, got %s", car.Status)
			}
		}
	})

	t.Run("Update car", func(t *testing.T) {
		ctx := testContext()

		// Create car first
		req := &models.CreateCarRequest{
			LicensePlate:       "HH-444-II",
			Brand:              "OldBrand",
			Model:              "OldModel",
			GreyCardNumber:     "GC444444",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}

		created, err := carService.CreateCar(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Update car
		newBrand := "NewBrand"
		newModel := "NewModel"
		updateReq := &models.UpdateCarRequest{
			Brand: &newBrand,
			Model: &newModel,
		}

		updated, err := carService.UpdateCar(ctx, created.ID, updateReq, userID)
		if err != nil {
			t.Fatalf("UpdateCar failed: %v", err)
		}

		if updated.Brand != "NewBrand" {
			t.Errorf("Expected brand NewBrand, got %s", updated.Brand)
		}

		if updated.Model != "NewModel" {
			t.Errorf("Expected model NewModel, got %s", updated.Model)
		}
	})

	t.Run("Delete car", func(t *testing.T) {
		ctx := testContext()

		// Create car first
		req := &models.CreateCarRequest{
			LicensePlate:       "II-555-JJ",
			Brand:              "DeleteBrand",
			Model:              "DeleteModel",
			GreyCardNumber:     "GC555555",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}

		created, err := carService.CreateCar(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Delete car
		err = carService.DeleteCar(ctx, created.ID, userID)
		if err != nil {
			t.Fatalf("DeleteCar failed: %v", err)
		}

		// Get car - should still exist but with retired status
		car, err := carService.GetCar(ctx, created.ID)
		if err != nil {
			t.Fatalf("GetCar failed after delete: %v", err)
		}

		if car.Status != models.CarStatusRetired {
			t.Errorf("Expected status retired, got %s", car.Status)
		}
	})
}
