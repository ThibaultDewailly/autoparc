package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/goldenkiwi/autoparc/pkg/utils"
	"github.com/google/uuid"
)

// CarService handles car business logic
type CarService struct {
	carRepo       *repository.CarRepository
	insuranceRepo *repository.InsuranceRepository
	actionLogRepo *repository.ActionLogRepository
	accidentRepo  *repository.AccidentRepository
	repairRepo    *repository.RepairRepository
}

// NewCarService creates a new car service
func NewCarService(
	carRepo *repository.CarRepository,
	insuranceRepo *repository.InsuranceRepository,
	actionLogRepo *repository.ActionLogRepository,
	accidentRepo *repository.AccidentRepository,
	repairRepo *repository.RepairRepository,
) *CarService {
	return &CarService{
		carRepo:       carRepo,
		insuranceRepo: insuranceRepo,
		actionLogRepo: actionLogRepo,
		accidentRepo:  accidentRepo,
		repairRepo:    repairRepo,
	}
}

// CreateCar creates a new car and logs the action
func (s *CarService) CreateCar(ctx context.Context, req *models.CreateCarRequest, userID string) (*models.Car, error) {
	// Validate license plate
	if !utils.ValidateLicensePlate(req.LicensePlate) {
		return nil, fmt.Errorf("invalid license plate format. Expected format: AA-123-BB")
	}

	// Validate required fields
	if !utils.ValidateRequired(req.Brand) {
		return nil, fmt.Errorf("brand is required")
	}
	if !utils.ValidateRequired(req.Model) {
		return nil, fmt.Errorf("model is required")
	}
	if !utils.ValidateRequired(req.GreyCardNumber) {
		return nil, fmt.Errorf("grey card number is required")
	}
	if !utils.ValidateRequired(req.InsuranceCompanyID) {
		return nil, fmt.Errorf("insurance company is required")
	}

	// Validate insurance company exists
	_, err := s.insuranceRepo.FindByID(ctx, req.InsuranceCompanyID)
	if err != nil {
		return nil, fmt.Errorf("insurance company not found")
	}

	// Validate status
	if req.Status != models.CarStatusActive &&
		req.Status != models.CarStatusMaintenance &&
		req.Status != models.CarStatusRetired {
		return nil, fmt.Errorf("invalid status. Must be: active, maintenance, or retired")
	}

	// Normalize license plate
	licensePlate := utils.NormalizeLicensePlate(req.LicensePlate)

	// Create car
	car := &models.Car{
		ID:                 uuid.New().String(),
		LicensePlate:       licensePlate,
		Brand:              req.Brand,
		Model:              req.Model,
		GreyCardNumber:     req.GreyCardNumber,
		InsuranceCompanyID: req.InsuranceCompanyID,
		RentalStartDate:    req.RentalStartDate,
		Status:             req.Status,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
		CreatedBy:          userID,
	}

	if err := s.carRepo.Create(ctx, car); err != nil {
		return nil, fmt.Errorf("failed to create car: %w", err)
	}

	// Log action
	changes, _ := json.Marshal(car)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  models.EntityTypeCar,
		EntityID:    car.ID,
		ActionType:  models.ActionTypeCreate,
		PerformedBy: userID,
		Changes:     changes,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	// Fetch car with insurance company details
	return s.carRepo.FindByID(ctx, car.ID)
}

// GetCar retrieves a car by ID with its accidents and repairs
func (s *CarService) GetCar(ctx context.Context, id string) (*models.Car, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("car ID is required")
	}

	car, err := s.carRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Fetch accidents for this car
	accidentFilters := map[string]interface{}{
		"car_id": id,
		"limit":  "100",
	}
	accidents, err := s.accidentRepo.FindAll(ctx, accidentFilters)
	if err == nil && len(accidents) > 0 {
		car.Accidents = accidents
	}

	// Fetch repairs for this car
	repairFilters := map[string]interface{}{
		"car_id": id,
		"limit":  "100",
	}
	repairs, err := s.repairRepo.FindAll(ctx, repairFilters)
	if err == nil && len(repairs) > 0 {
		car.Repairs = repairs
	}

	return car, nil
}

// GetCars retrieves cars with pagination and filters
func (s *CarService) GetCars(ctx context.Context, filters *models.CarFilters) (*models.CarListResponse, error) {
	// Set defaults
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.Limit < 1 || filters.Limit > 100 {
		filters.Limit = 20
	}

	cars, totalCount, err := s.carRepo.FindAll(ctx, filters)
	if err != nil {
		return nil, err
	}

	totalPages := (totalCount + filters.Limit - 1) / filters.Limit

	return &models.CarListResponse{
		Cars:       cars,
		TotalCount: totalCount,
		Page:       filters.Page,
		Limit:      filters.Limit,
		TotalPages: totalPages,
	}, nil
}

// UpdateCar updates a car and logs the action
func (s *CarService) UpdateCar(ctx context.Context, id string, req *models.UpdateCarRequest, userID string) (*models.Car, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("car ID is required")
	}

	// Get existing car
	existingCar, err := s.carRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Build updates map
	updates := make(map[string]interface{})
	changes := make(map[string]interface{})

	if req.Brand != nil && *req.Brand != existingCar.Brand {
		if !utils.ValidateRequired(*req.Brand) {
			return nil, fmt.Errorf("brand cannot be empty")
		}
		updates["brand"] = *req.Brand
		changes["brand"] = map[string]string{"old": existingCar.Brand, "new": *req.Brand}
	}

	if req.Model != nil && *req.Model != existingCar.Model {
		if !utils.ValidateRequired(*req.Model) {
			return nil, fmt.Errorf("model cannot be empty")
		}
		updates["model"] = *req.Model
		changes["model"] = map[string]string{"old": existingCar.Model, "new": *req.Model}
	}

	if req.GreyCardNumber != nil && *req.GreyCardNumber != existingCar.GreyCardNumber {
		if !utils.ValidateRequired(*req.GreyCardNumber) {
			return nil, fmt.Errorf("grey card number cannot be empty")
		}
		updates["grey_card_number"] = *req.GreyCardNumber
		changes["greyCardNumber"] = map[string]string{"old": existingCar.GreyCardNumber, "new": *req.GreyCardNumber}
	}

	if req.InsuranceCompanyID != nil && *req.InsuranceCompanyID != existingCar.InsuranceCompanyID {
		if !utils.ValidateRequired(*req.InsuranceCompanyID) {
			return nil, fmt.Errorf("insurance company ID cannot be empty")
		}
		// Validate insurance company exists
		_, err := s.insuranceRepo.FindByID(ctx, *req.InsuranceCompanyID)
		if err != nil {
			return nil, fmt.Errorf("insurance company not found")
		}
		updates["insurance_company_id"] = *req.InsuranceCompanyID
		changes["insuranceCompanyId"] = map[string]string{"old": existingCar.InsuranceCompanyID, "new": *req.InsuranceCompanyID}
	}

	if req.RentalStartDate != nil && !req.RentalStartDate.Equal(existingCar.RentalStartDate) {
		updates["rental_start_date"] = *req.RentalStartDate
		changes["rentalStartDate"] = map[string]string{"old": existingCar.RentalStartDate.Format(time.RFC3339), "new": req.RentalStartDate.Format(time.RFC3339)}
	}

	if req.Status != nil && *req.Status != existingCar.Status {
		if *req.Status != models.CarStatusActive &&
			*req.Status != models.CarStatusMaintenance &&
			*req.Status != models.CarStatusRetired {
			return nil, fmt.Errorf("invalid status. Must be: active, maintenance, or retired")
		}
		updates["status"] = *req.Status
		changes["status"] = map[string]string{"old": string(existingCar.Status), "new": string(*req.Status)}
	}

	if len(updates) == 0 {
		return existingCar, nil
	}

	// Update car
	if err := s.carRepo.Update(ctx, id, updates); err != nil {
		return nil, fmt.Errorf("failed to update car: %w", err)
	}

	// Log action
	changesJSON, _ := json.Marshal(changes)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  models.EntityTypeCar,
		EntityID:    id,
		ActionType:  models.ActionTypeUpdate,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	// Return updated car
	return s.carRepo.FindByID(ctx, id)
}

// DeleteCar soft deletes a car and logs the action
func (s *CarService) DeleteCar(ctx context.Context, id string, userID string) error {
	if !utils.ValidateRequired(id) {
		return fmt.Errorf("car ID is required")
	}

	// Get existing car for logging
	existingCar, err := s.carRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	// Soft delete
	if err := s.carRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete car: %w", err)
	}

	// Log action
	changes := map[string]interface{}{
		"status": map[string]string{"old": string(existingCar.Status), "new": string(models.CarStatusRetired)},
	}
	changesJSON, _ := json.Marshal(changes)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  models.EntityTypeCar,
		EntityID:    id,
		ActionType:  models.ActionTypeDelete,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	return nil
}
