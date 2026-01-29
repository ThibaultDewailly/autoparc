package integration

import (
	"fmt"
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/goldenkiwi/autoparc/internal/service"
)

func TestOperatorIntegration(t *testing.T) {
	cleanupDB(t)

	operatorRepo := repository.NewOperatorRepository(testDB)
	carRepo := repository.NewCarRepository(testDB)
	insuranceRepo := repository.NewInsuranceRepository(testDB)
	actionLogRepo := repository.NewActionLogRepository(testDB)
	operatorService := service.NewOperatorService(operatorRepo, carRepo, actionLogRepo)
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

	t.Run("Create operator", func(t *testing.T) {
		ctx := testContext()

		email := "john.doe@example.com"
		phone := "0612345678"
		dept := "Sales"

		req := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP001",
			FirstName:      "John",
			LastName:       "Doe",
			Email:          &email,
			Phone:          &phone,
			Department:     &dept,
		}

		operator, err := operatorService.CreateOperator(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		if operator == nil {
			t.Fatal("Expected operator, got nil")
		}

		if operator.EmployeeNumber != "EMP001" {
			t.Errorf("Expected employee number EMP001, got %s", operator.EmployeeNumber)
		}

		if operator.FirstName != "John" {
			t.Errorf("Expected first name John, got %s", operator.FirstName)
		}

		if !operator.IsActive {
			t.Error("Expected operator to be active")
		}
	})

	t.Run("Create operator with duplicate employee number", func(t *testing.T) {
		ctx := testContext()

		email := "jane.smith@example.com"
		req := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP002",
			FirstName:      "Jane",
			LastName:       "Smith",
			Email:          &email,
		}

		// Create first operator
		_, err := operatorService.CreateOperator(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Try to create second operator with same employee number
		_, err = operatorService.CreateOperator(ctx, req, userID)
		if err == nil {
			t.Error("Expected error for duplicate employee number")
		}
	})

	t.Run("Create operator with invalid email", func(t *testing.T) {
		ctx := testContext()

		email := "invalid-email"
		req := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP003",
			FirstName:      "Invalid",
			LastName:       "Email",
			Email:          &email,
		}

		_, err := operatorService.CreateOperator(ctx, req, userID)
		if err == nil {
			t.Error("Expected error for invalid email")
		}
	})

	t.Run("Get operator by ID", func(t *testing.T) {
		ctx := testContext()

		// Create operator first
		req := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP004",
			FirstName:      "Test",
			LastName:       "User",
		}

		created, err := operatorService.CreateOperator(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Get operator
		operator, err := operatorService.GetOperator(ctx, created.ID)
		if err != nil {
			t.Fatalf("GetOperator failed: %v", err)
		}

		if operator.ID != created.ID {
			t.Errorf("Expected ID %s, got %s", created.ID, operator.ID)
		}

		if operator.CurrentAssignment != nil {
			t.Error("Expected no current assignment")
		}

		if len(operator.AssignmentHistory) != 0 {
			t.Errorf("Expected empty assignment history, got %d", len(operator.AssignmentHistory))
		}
	})

	t.Run("List operators with pagination", func(t *testing.T) {
		ctx := testContext()

		// Create multiple operators
		for i := 0; i < 5; i++ {
			req := &models.CreateOperatorRequest{
				EmployeeNumber: fmt.Sprintf("EMP%03d", 100+i),
				FirstName:      "Test",
				LastName:       fmt.Sprintf("Operator%d", i),
			}
			_, err := operatorService.CreateOperator(ctx, req, userID)
			if err != nil {
				t.Fatalf("CreateOperator failed: %v", err)
			}
		}

		// List operators
		filters := &models.OperatorFilters{
			Page:  1,
			Limit: 3,
		}

		response, err := operatorService.GetOperators(ctx, filters)
		if err != nil {
			t.Fatalf("GetOperators failed: %v", err)
		}

		if len(response.Data) == 0 {
			t.Error("Expected operators")
		}

		if response.Total < 5 {
			t.Errorf("Expected at least 5 operators, got %d", response.Total)
		}
	})

	t.Run("Search operators", func(t *testing.T) {
		ctx := testContext()

		// Create operator with specific name
		req := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP200",
			FirstName:      "SearchableFirst",
			LastName:       "SearchableLast",
		}

		_, err := operatorService.CreateOperator(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Search by first name
		filters := &models.OperatorFilters{
			Search: "SearchableFirst",
			Page:   1,
			Limit:  10,
		}

		response, err := operatorService.GetOperators(ctx, filters)
		if err != nil {
			t.Fatalf("GetOperators failed: %v", err)
		}

		found := false
		for _, op := range response.Data {
			if op.FirstName == "SearchableFirst" {
				found = true
				break
			}
		}

		if !found {
			t.Error("Expected to find operator by first name")
		}
	})

	t.Run("Filter operators by department", func(t *testing.T) {
		ctx := testContext()

		// Create operators with different departments
		dept1 := "Engineering"
		dept2 := "Marketing"

		req1 := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP300",
			FirstName:      "Engineer",
			LastName:       "One",
			Department:     &dept1,
		}
		_, err := operatorService.CreateOperator(ctx, req1, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		req2 := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP301",
			FirstName:      "Marketer",
			LastName:       "One",
			Department:     &dept2,
		}
		_, err = operatorService.CreateOperator(ctx, req2, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Filter by department
		filters := &models.OperatorFilters{
			Department: "Engineering",
			Page:       1,
			Limit:      10,
		}

		response, err := operatorService.GetOperators(ctx, filters)
		if err != nil {
			t.Fatalf("GetOperators failed: %v", err)
		}

		for _, op := range response.Data {
			if op.Department != nil && *op.Department != "Engineering" {
				t.Errorf("Expected only Engineering department, got %s", *op.Department)
			}
		}
	})

	t.Run("Update operator", func(t *testing.T) {
		ctx := testContext()

		// Create operator
		req := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP400",
			FirstName:      "Original",
			LastName:       "Name",
		}

		created, err := operatorService.CreateOperator(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Update operator
		newFirstName := "Updated"
		newEmail := "updated@example.com"
		updateReq := &models.UpdateOperatorRequest{
			FirstName: &newFirstName,
			Email:     &newEmail,
		}

		updated, err := operatorService.UpdateOperator(ctx, created.ID, updateReq, userID)
		if err != nil {
			t.Fatalf("UpdateOperator failed: %v", err)
		}

		if updated.FirstName != "Updated" {
			t.Errorf("Expected first name Updated, got %s", updated.FirstName)
		}

		if updated.Email == nil || *updated.Email != "updated@example.com" {
			t.Error("Expected email to be updated")
		}
	})

	t.Run("Delete operator without active assignment", func(t *testing.T) {
		ctx := testContext()

		// Create operator
		req := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP500",
			FirstName:      "Delete",
			LastName:       "Me",
		}

		created, err := operatorService.CreateOperator(ctx, req, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Delete operator
		err = operatorService.DeleteOperator(ctx, created.ID, userID)
		if err != nil {
			t.Fatalf("DeleteOperator failed: %v", err)
		}

		// Verify operator is inactive
		operator, err := operatorService.GetOperator(ctx, created.ID)
		if err != nil {
			t.Fatalf("GetOperator failed: %v", err)
		}

		if operator.IsActive {
			t.Error("Expected operator to be inactive after deletion")
		}
	})

	t.Run("Assign operator to car", func(t *testing.T) {
		ctx := testContext()

		// Create operator
		operatorReq := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP600",
			FirstName:      "Driver",
			LastName:       "One",
		}
		operator, err := operatorService.CreateOperator(ctx, operatorReq, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Create car
		carReq := &models.CreateCarRequest{
			LicensePlate:       "DD-600-EE",
			Brand:              "Toyota",
			Model:              "Corolla",
			GreyCardNumber:     "GC600",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}
		car, err := carService.CreateCar(ctx, carReq, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Assign operator to car
		assignReq := &models.AssignOperatorRequest{
			OperatorID: operator.ID,
			StartDate:  time.Now().Format("2006-01-02"),
		}

		assignment, err := operatorService.AssignOperatorToCar(ctx, car.ID, assignReq, userID)
		if err != nil {
			t.Fatalf("AssignOperatorToCar failed: %v", err)
		}

		if assignment.CarID != car.ID {
			t.Errorf("Expected car ID %s, got %s", car.ID, assignment.CarID)
		}

		if assignment.OperatorID != operator.ID {
			t.Errorf("Expected operator ID %s, got %s", operator.ID, assignment.OperatorID)
		}

		if assignment.EndDate != nil {
			t.Error("Expected end date to be nil for active assignment")
		}
	})

	t.Run("Prevent duplicate active assignment for operator", func(t *testing.T) {
		ctx := testContext()

		// Create operator
		operatorReq := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP700",
			FirstName:      "Driver",
			LastName:       "Two",
		}
		operator, err := operatorService.CreateOperator(ctx, operatorReq, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Create two cars
		car1Req := &models.CreateCarRequest{
			LicensePlate:       "EE-700-FF",
			Brand:              "Honda",
			Model:              "Civic",
			GreyCardNumber:     "GC700",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}
		car1, err := carService.CreateCar(ctx, car1Req, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		car2Req := &models.CreateCarRequest{
			LicensePlate:       "EE-701-FF",
			Brand:              "Honda",
			Model:              "Accord",
			GreyCardNumber:     "GC701",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}
		car2, err := carService.CreateCar(ctx, car2Req, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Assign operator to first car
		assignReq1 := &models.AssignOperatorRequest{
			OperatorID: operator.ID,
			StartDate:  time.Now().Format("2006-01-02"),
		}
		_, err = operatorService.AssignOperatorToCar(ctx, car1.ID, assignReq1, userID)
		if err != nil {
			t.Fatalf("AssignOperatorToCar failed: %v", err)
		}

		// Try to assign same operator to second car
		assignReq2 := &models.AssignOperatorRequest{
			OperatorID: operator.ID,
			StartDate:  time.Now().Format("2006-01-02"),
		}
		_, err = operatorService.AssignOperatorToCar(ctx, car2.ID, assignReq2, userID)
		if err == nil {
			t.Error("Expected error when assigning operator with active assignment")
		}
	})

	t.Run("Prevent duplicate active assignment for car", func(t *testing.T) {
		ctx := testContext()

		// Create two operators
		op1Req := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP800",
			FirstName:      "Driver",
			LastName:       "Three",
		}
		op1, err := operatorService.CreateOperator(ctx, op1Req, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		op2Req := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP801",
			FirstName:      "Driver",
			LastName:       "Four",
		}
		op2, err := operatorService.CreateOperator(ctx, op2Req, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Create car
		carReq := &models.CreateCarRequest{
			LicensePlate:       "FF-800-GG",
			Brand:              "Mazda",
			Model:              "3",
			GreyCardNumber:     "GC800",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}
		car, err := carService.CreateCar(ctx, carReq, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Assign first operator to car
		assignReq1 := &models.AssignOperatorRequest{
			OperatorID: op1.ID,
			StartDate:  time.Now().Format("2006-01-02"),
		}
		_, err = operatorService.AssignOperatorToCar(ctx, car.ID, assignReq1, userID)
		if err != nil {
			t.Fatalf("AssignOperatorToCar failed: %v", err)
		}

		// Try to assign second operator to same car
		assignReq2 := &models.AssignOperatorRequest{
			OperatorID: op2.ID,
			StartDate:  time.Now().Format("2006-01-02"),
		}
		_, err = operatorService.AssignOperatorToCar(ctx, car.ID, assignReq2, userID)
		if err == nil {
			t.Error("Expected error when assigning car with active assignment")
		}
	})

	t.Run("Unassign operator from car", func(t *testing.T) {
		ctx := testContext()

		// Create operator
		operatorReq := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP900",
			FirstName:      "Driver",
			LastName:       "Five",
		}
		operator, err := operatorService.CreateOperator(ctx, operatorReq, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Create car
		carReq := &models.CreateCarRequest{
			LicensePlate:       "GG-900-HH",
			Brand:              "Nissan",
			Model:              "Sentra",
			GreyCardNumber:     "GC900",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}
		car, err := carService.CreateCar(ctx, carReq, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Assign operator to car
		assignReq := &models.AssignOperatorRequest{
			OperatorID: operator.ID,
			StartDate:  time.Now().Format("2006-01-02"),
		}
		_, err = operatorService.AssignOperatorToCar(ctx, car.ID, assignReq, userID)
		if err != nil {
			t.Fatalf("AssignOperatorToCar failed: %v", err)
		}

		// Unassign operator from car
		unassignReq := &models.UnassignOperatorRequest{
			EndDate: time.Now().Format("2006-01-02"),
		}
		err = operatorService.UnassignOperatorFromCar(ctx, car.ID, unassignReq, userID)
		if err != nil {
			t.Fatalf("UnassignOperatorFromCar failed: %v", err)
		}

		// Verify no active assignment
		hasActive, err := operatorRepo.CarHasActiveAssignment(ctx, car.ID)
		if err != nil {
			t.Fatalf("CarHasActiveAssignment failed: %v", err)
		}
		if hasActive {
			t.Error("Expected no active assignment after unassignment")
		}
	})

	t.Run("Get assignment history for car", func(t *testing.T) {
		ctx := testContext()

		// Create operator
		operatorReq := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP1000",
			FirstName:      "History",
			LastName:       "Test",
		}
		operator, err := operatorService.CreateOperator(ctx, operatorReq, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Create car
		carReq := &models.CreateCarRequest{
			LicensePlate:       "HH-100-II",
			Brand:              "Volkswagen",
			Model:              "Golf",
			GreyCardNumber:     "GC1000",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}
		car, err := carService.CreateCar(ctx, carReq, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Assign and unassign multiple times
		for i := 0; i < 3; i++ {
			assignReq := &models.AssignOperatorRequest{
				OperatorID: operator.ID,
				StartDate:  time.Now().AddDate(0, 0, i).Format("2006-01-02"),
			}
			_, err = operatorService.AssignOperatorToCar(ctx, car.ID, assignReq, userID)
			if err != nil {
				t.Fatalf("AssignOperatorToCar failed: %v", err)
			}

			unassignReq := &models.UnassignOperatorRequest{
				EndDate: time.Now().AddDate(0, 0, i+1).Format("2006-01-02"),
			}
			err = operatorService.UnassignOperatorFromCar(ctx, car.ID, unassignReq, userID)
			if err != nil {
				t.Fatalf("UnassignOperatorFromCar failed: %v", err)
			}
		}

		// Get assignment history
		history, err := operatorService.GetCarAssignmentHistory(ctx, car.ID)
		if err != nil {
			t.Fatalf("GetCarAssignmentHistory failed: %v", err)
		}

		if len(history) < 3 {
			t.Errorf("Expected at least 3 assignments, got %d", len(history))
		}
	})

	t.Run("Get assignment history for operator", func(t *testing.T) {
		ctx := testContext()

		// Create operator
		operatorReq := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP1100",
			FirstName:      "History",
			LastName:       "Operator",
		}
		operator, err := operatorService.CreateOperator(ctx, operatorReq, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Create multiple cars
		for i := 0; i < 2; i++ {
			carReq := &models.CreateCarRequest{
				LicensePlate:       fmt.Sprintf("II-%03d-JJ", 110+i),
				Brand:              "TestBrand",
				Model:              "TestModel",
				GreyCardNumber:     fmt.Sprintf("GC%d", 1100+i),
				InsuranceCompanyID: insuranceCompanyID,
				RentalStartDate:    time.Now(),
				Status:             models.CarStatusActive,
			}
			car, err := carService.CreateCar(ctx, carReq, userID)
			if err != nil {
				t.Fatalf("CreateCar failed: %v", err)
			}

			// Assign operator to car
			assignReq := &models.AssignOperatorRequest{
				OperatorID: operator.ID,
				StartDate:  time.Now().AddDate(0, 0, i).Format("2006-01-02"),
			}
			_, err = operatorService.AssignOperatorToCar(ctx, car.ID, assignReq, userID)
			if err != nil {
				t.Fatalf("AssignOperatorToCar failed: %v", err)
			}

			// Unassign
			unassignReq := &models.UnassignOperatorRequest{
				EndDate: time.Now().AddDate(0, 0, i+1).Format("2006-01-02"),
			}
			err = operatorService.UnassignOperatorFromCar(ctx, car.ID, unassignReq, userID)
			if err != nil {
				t.Fatalf("UnassignOperatorFromCar failed: %v", err)
			}
		}

		// Get assignment history
		history, err := operatorService.GetOperatorAssignmentHistory(ctx, operator.ID)
		if err != nil {
			t.Fatalf("GetOperatorAssignmentHistory failed: %v", err)
		}

		if len(history) < 2 {
			t.Errorf("Expected at least 2 assignments, got %d", len(history))
		}
	})

	t.Run("Prevent deleting operator with active assignment", func(t *testing.T) {
		ctx := testContext()

		// Create operator
		operatorReq := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP1200",
			FirstName:      "Active",
			LastName:       "Assignment",
		}
		operator, err := operatorService.CreateOperator(ctx, operatorReq, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Create car
		carReq := &models.CreateCarRequest{
			LicensePlate:       "JJ-120-KK",
			Brand:              "Ford",
			Model:              "Focus",
			GreyCardNumber:     "GC1200",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}
		car, err := carService.CreateCar(ctx, carReq, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Assign operator to car
		assignReq := &models.AssignOperatorRequest{
			OperatorID: operator.ID,
			StartDate:  time.Now().Format("2006-01-02"),
		}
		_, err = operatorService.AssignOperatorToCar(ctx, car.ID, assignReq, userID)
		if err != nil {
			t.Fatalf("AssignOperatorToCar failed: %v", err)
		}

		// Try to delete operator with active assignment
		err = operatorService.DeleteOperator(ctx, operator.ID, userID)
		if err == nil {
			t.Error("Expected error when deleting operator with active assignment")
		}
	})

	t.Run("Prevent assigning inactive operator", func(t *testing.T) {
		ctx := testContext()

		// Create operator
		operatorReq := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP1300",
			FirstName:      "Inactive",
			LastName:       "Operator",
		}
		operator, err := operatorService.CreateOperator(ctx, operatorReq, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Deactivate operator
		isActive := false
		updateReq := &models.UpdateOperatorRequest{
			IsActive: &isActive,
		}
		_, err = operatorService.UpdateOperator(ctx, operator.ID, updateReq, userID)
		if err != nil {
			t.Fatalf("UpdateOperator failed: %v", err)
		}

		// Create car
		carReq := &models.CreateCarRequest{
			LicensePlate:       "KK-130-LL",
			Brand:              "Chevrolet",
			Model:              "Malibu",
			GreyCardNumber:     "GC1300",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}
		car, err := carService.CreateCar(ctx, carReq, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Try to assign inactive operator
		assignReq := &models.AssignOperatorRequest{
			OperatorID: operator.ID,
			StartDate:  time.Now().Format("2006-01-02"),
		}
		_, err = operatorService.AssignOperatorToCar(ctx, car.ID, assignReq, userID)
		if err == nil {
			t.Error("Expected error when assigning inactive operator")
		}
	})

	t.Run("Operator with current car in list", func(t *testing.T) {
		ctx := testContext()

		// Create operator
		operatorReq := &models.CreateOperatorRequest{
			EmployeeNumber: "EMP1400",
			FirstName:      "WithCar",
			LastName:       "Operator",
		}
		operator, err := operatorService.CreateOperator(ctx, operatorReq, userID)
		if err != nil {
			t.Fatalf("CreateOperator failed: %v", err)
		}

		// Create car
		carReq := &models.CreateCarRequest{
			LicensePlate:       "LL-140-MM",
			Brand:              "Audi",
			Model:              "A4",
			GreyCardNumber:     "GC1400",
			InsuranceCompanyID: insuranceCompanyID,
			RentalStartDate:    time.Now(),
			Status:             models.CarStatusActive,
		}
		car, err := carService.CreateCar(ctx, carReq, userID)
		if err != nil {
			t.Fatalf("CreateCar failed: %v", err)
		}

		// Assign operator to car
		assignReq := &models.AssignOperatorRequest{
			OperatorID: operator.ID,
			StartDate:  time.Now().Format("2006-01-02"),
		}
		_, err = operatorService.AssignOperatorToCar(ctx, car.ID, assignReq, userID)
		if err != nil {
			t.Fatalf("AssignOperatorToCar failed: %v", err)
		}

		// List operators
		filters := &models.OperatorFilters{
			Search: "EMP1400",
			Page:   1,
			Limit:  10,
		}

		response, err := operatorService.GetOperators(ctx, filters)
		if err != nil {
			t.Fatalf("GetOperators failed: %v", err)
		}

		found := false
		for _, op := range response.Data {
			if op.ID == operator.ID {
				found = true
				if op.CurrentCar == nil {
					t.Error("Expected current car to be populated")
				}
				if op.CurrentCar.LicensePlate != "LL-140-MM" {
					t.Errorf("Expected license plate LL-140-MM, got %s", op.CurrentCar.LicensePlate)
				}
			}
		}

		if !found {
			t.Error("Expected to find operator with current car")
		}
	})
}
