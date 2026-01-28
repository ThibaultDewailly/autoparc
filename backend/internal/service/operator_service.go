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

// OperatorService handles car operator business logic
type OperatorService struct {
	operatorRepo  *repository.OperatorRepository
	carRepo       *repository.CarRepository
	actionLogRepo *repository.ActionLogRepository
}

// NewOperatorService creates a new operator service
func NewOperatorService(
	operatorRepo *repository.OperatorRepository,
	carRepo *repository.CarRepository,
	actionLogRepo *repository.ActionLogRepository,
) *OperatorService {
	return &OperatorService{
		operatorRepo:  operatorRepo,
		carRepo:       carRepo,
		actionLogRepo: actionLogRepo,
	}
}

// CreateOperator creates a new car operator and logs the action
func (s *OperatorService) CreateOperator(ctx context.Context, req *models.CreateOperatorRequest, userID string) (*models.CarOperator, error) {
	// Validate required fields
	if !utils.ValidateRequired(req.EmployeeNumber) {
		return nil, fmt.Errorf("employee number is required")
	}
	if !utils.ValidateRequired(req.FirstName) {
		return nil, fmt.Errorf("first name is required")
	}
	if !utils.ValidateRequired(req.LastName) {
		return nil, fmt.Errorf("last name is required")
	}

	// Validate email if provided
	if req.Email != nil && *req.Email != "" {
		if !utils.ValidateEmail(*req.Email) {
			return nil, fmt.Errorf("invalid email format")
		}
	}

	// Check if employee number already exists
	existing, _ := s.operatorRepo.FindByEmployeeNumber(ctx, req.EmployeeNumber)
	if existing != nil {
		return nil, fmt.Errorf("employee number already exists")
	}

	// Create operator
	operator := &models.CarOperator{
		ID:             uuid.New().String(),
		EmployeeNumber: req.EmployeeNumber,
		FirstName:      req.FirstName,
		LastName:       req.LastName,
		Email:          req.Email,
		Phone:          req.Phone,
		Department:     req.Department,
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
		CreatedBy:      &userID,
	}

	if err := s.operatorRepo.Create(ctx, operator); err != nil {
		return nil, fmt.Errorf("failed to create operator: %w", err)
	}

	// Log action
	changes, _ := json.Marshal(operator)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "operator",
		EntityID:    operator.ID,
		ActionType:  models.ActionTypeCreate,
		PerformedBy: userID,
		Changes:     changes,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	return operator, nil
}

// GetOperator retrieves an operator by ID with current assignment and history
func (s *OperatorService) GetOperator(ctx context.Context, id string) (*models.OperatorDetailResponse, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("operator ID is required")
	}

	operator, err := s.operatorRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Get current assignment
	currentAssignment, _ := s.operatorRepo.FindActiveAssignmentByOperator(ctx, id)

	// Get assignment history
	filters := &models.AssignmentFilters{
		OperatorID: &id,
	}
	history, err := s.operatorRepo.FindAssignmentHistory(ctx, filters)
	if err != nil {
		history = []models.CarOperatorAssignment{}
	}

	return &models.OperatorDetailResponse{
		CarOperator:       *operator,
		CurrentAssignment: currentAssignment,
		AssignmentHistory: history,
	}, nil
}

// GetOperators retrieves operators with pagination and filters
func (s *OperatorService) GetOperators(ctx context.Context, filters *models.OperatorFilters) (*models.OperatorListResponse, error) {
	// Set defaults
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.Limit < 1 || filters.Limit > 100 {
		filters.Limit = 20
	}

	operators, totalCount, err := s.operatorRepo.FindAll(ctx, filters)
	if err != nil {
		return nil, err
	}

	totalPages := (totalCount + filters.Limit - 1) / filters.Limit

	return &models.OperatorListResponse{
		Operators:  operators,
		TotalCount: totalCount,
		Page:       filters.Page,
		Limit:      filters.Limit,
		TotalPages: totalPages,
	}, nil
}

// UpdateOperator updates an operator and logs the action
func (s *OperatorService) UpdateOperator(ctx context.Context, id string, req *models.UpdateOperatorRequest, userID string) (*models.CarOperator, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("operator ID is required")
	}

	// Get existing operator
	existingOperator, err := s.operatorRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Build updates map
	updates := make(map[string]interface{})
	changes := make(map[string]interface{})

	if req.FirstName != nil && *req.FirstName != existingOperator.FirstName {
		if !utils.ValidateRequired(*req.FirstName) {
			return nil, fmt.Errorf("first name cannot be empty")
		}
		updates["first_name"] = *req.FirstName
		changes["firstName"] = map[string]string{"old": existingOperator.FirstName, "new": *req.FirstName}
	}

	if req.LastName != nil && *req.LastName != existingOperator.LastName {
		if !utils.ValidateRequired(*req.LastName) {
			return nil, fmt.Errorf("last name cannot be empty")
		}
		updates["last_name"] = *req.LastName
		changes["lastName"] = map[string]string{"old": existingOperator.LastName, "new": *req.LastName}
	}

	if req.Email != nil {
		if *req.Email != "" && !utils.ValidateEmail(*req.Email) {
			return nil, fmt.Errorf("invalid email format")
		}
		updates["email"] = req.Email
		oldEmail := ""
		if existingOperator.Email != nil {
			oldEmail = *existingOperator.Email
		}
		changes["email"] = map[string]string{"old": oldEmail, "new": *req.Email}
	}

	if req.Phone != nil {
		updates["phone"] = req.Phone
		oldPhone := ""
		if existingOperator.Phone != nil {
			oldPhone = *existingOperator.Phone
		}
		newPhone := ""
		if req.Phone != nil {
			newPhone = *req.Phone
		}
		changes["phone"] = map[string]string{"old": oldPhone, "new": newPhone}
	}

	if req.Department != nil {
		updates["department"] = req.Department
		oldDept := ""
		if existingOperator.Department != nil {
			oldDept = *existingOperator.Department
		}
		newDept := ""
		if req.Department != nil {
			newDept = *req.Department
		}
		changes["department"] = map[string]string{"old": oldDept, "new": newDept}
	}

	if req.IsActive != nil && *req.IsActive != existingOperator.IsActive {
		updates["is_active"] = *req.IsActive
		changes["isActive"] = map[string]bool{"old": existingOperator.IsActive, "new": *req.IsActive}
	}

	if len(updates) == 0 {
		return existingOperator, nil
	}

	// Update operator
	if err := s.operatorRepo.Update(ctx, id, updates); err != nil {
		return nil, fmt.Errorf("failed to update operator: %w", err)
	}

	// Log action
	changesJSON, _ := json.Marshal(changes)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "operator",
		EntityID:    id,
		ActionType:  models.ActionTypeUpdate,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	// Fetch updated operator
	return s.operatorRepo.FindByID(ctx, id)
}

// DeleteOperator soft deletes an operator and logs the action
func (s *OperatorService) DeleteOperator(ctx context.Context, id string, userID string) error {
	if !utils.ValidateRequired(id) {
		return fmt.Errorf("operator ID is required")
	}

	// Check if operator exists
	operator, err := s.operatorRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	// Check if operator has an active assignment
	hasActive, err := s.operatorRepo.HasActiveAssignment(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check active assignments: %w", err)
	}
	if hasActive {
		return fmt.Errorf("cannot delete operator with active car assignment")
	}

	// Soft delete
	if err := s.operatorRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete operator: %w", err)
	}

	// Log action
	changes, _ := json.Marshal(map[string]interface{}{
		"isActive": map[string]bool{"old": operator.IsActive, "new": false},
	})
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "operator",
		EntityID:    id,
		ActionType:  models.ActionTypeDelete,
		PerformedBy: userID,
		Changes:     changes,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	return nil
}

// AssignOperatorToCar assigns an operator to a car and logs the action
func (s *OperatorService) AssignOperatorToCar(ctx context.Context, carID string, req *models.AssignOperatorRequest, userID string) (*models.CarOperatorAssignment, error) {
	// Validate required fields
	if !utils.ValidateRequired(carID) {
		return nil, fmt.Errorf("car ID is required")
	}
	if !utils.ValidateRequired(req.OperatorID) {
		return nil, fmt.Errorf("operator ID is required")
	}
	if !utils.ValidateRequired(req.StartDate) {
		return nil, fmt.Errorf("start date is required")
	}

	// Parse start date
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start date format. Expected: YYYY-MM-DD")
	}

	// Validate start date is not too far in the past
	if startDate.Before(time.Now().AddDate(0, 0, -7)) {
		return nil, fmt.Errorf("start date cannot be more than 7 days in the past")
	}

	// Validate car exists and is active
	car, err := s.carRepo.FindByID(ctx, carID)
	if err != nil {
		return nil, fmt.Errorf("car not found")
	}
	if car.Status != models.CarStatusActive {
		return nil, fmt.Errorf("car must be active to assign an operator")
	}

	// Validate operator exists and is active
	operator, err := s.operatorRepo.FindByID(ctx, req.OperatorID)
	if err != nil {
		return nil, fmt.Errorf("operator not found")
	}
	if !operator.IsActive {
		return nil, fmt.Errorf("operator must be active to be assigned")
	}

	// Check if operator has active assignment
	operatorHasActive, err := s.operatorRepo.HasActiveAssignment(ctx, req.OperatorID)
	if err != nil {
		return nil, fmt.Errorf("failed to check operator assignments: %w", err)
	}
	if operatorHasActive {
		return nil, fmt.Errorf("operator already has an active car assignment")
	}

	// Check if car has active assignment
	carHasActive, err := s.operatorRepo.CarHasActiveAssignment(ctx, carID)
	if err != nil {
		return nil, fmt.Errorf("failed to check car assignments: %w", err)
	}
	if carHasActive {
		return nil, fmt.Errorf("car already has an active operator assignment")
	}

	// Create assignment
	assignment := &models.CarOperatorAssignment{
		ID:         uuid.New().String(),
		CarID:      carID,
		OperatorID: req.OperatorID,
		StartDate:  startDate,
		EndDate:    nil,
		Notes:      req.Notes,
		CreatedAt:  time.Now(),
		CreatedBy:  &userID,
	}

	if err := s.operatorRepo.CreateAssignment(ctx, assignment); err != nil {
		return nil, fmt.Errorf("failed to create assignment: %w", err)
	}

	// Log action for car
	carChanges, _ := json.Marshal(map[string]interface{}{
		"action":     "assign_operator",
		"operatorId": req.OperatorID,
		"startDate":  req.StartDate,
	})
	carLog := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  models.EntityTypeCar,
		EntityID:    carID,
		ActionType:  "assign",
		PerformedBy: userID,
		Changes:     carChanges,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, carLog)

	// Log action for operator
	operatorChanges, _ := json.Marshal(map[string]interface{}{
		"action":    "assign_to_car",
		"carId":     carID,
		"startDate": req.StartDate,
	})
	operatorLog := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "operator",
		EntityID:    req.OperatorID,
		ActionType:  "assign",
		PerformedBy: userID,
		Changes:     operatorChanges,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, operatorLog)

	return assignment, nil
}

// UnassignOperatorFromCar ends a car-operator assignment and logs the action
func (s *OperatorService) UnassignOperatorFromCar(ctx context.Context, carID string, req *models.UnassignOperatorRequest, userID string) error {
	// Validate required fields
	if !utils.ValidateRequired(carID) {
		return fmt.Errorf("car ID is required")
	}
	if !utils.ValidateRequired(req.EndDate) {
		return fmt.Errorf("end date is required")
	}

	// Parse end date
	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return fmt.Errorf("invalid end date format. Expected: YYYY-MM-DD")
	}

	// Get active assignment for car
	assignment, err := s.operatorRepo.FindActiveAssignmentByCar(ctx, carID)
	if err != nil {
		return fmt.Errorf("failed to find active assignment: %w", err)
	}
	if assignment == nil {
		return fmt.Errorf("no active assignment found for this car")
	}

	// Validate end date is >= start date
	if endDate.Before(assignment.StartDate) {
		return fmt.Errorf("end date must be on or after start date")
	}

	// Update assignment with end date
	if err := s.operatorRepo.EndAssignment(ctx, assignment.ID, endDate, req.Notes); err != nil {
		return fmt.Errorf("failed to end assignment: %w", err)
	}

	// Log action for car
	carChanges, _ := json.Marshal(map[string]interface{}{
		"action":     "unassign_operator",
		"operatorId": assignment.OperatorID,
		"endDate":    req.EndDate,
	})
	carLog := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  models.EntityTypeCar,
		EntityID:    carID,
		ActionType:  "unassign",
		PerformedBy: userID,
		Changes:     carChanges,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, carLog)

	// Log action for operator
	operatorChanges, _ := json.Marshal(map[string]interface{}{
		"action":  "unassign_from_car",
		"carId":   carID,
		"endDate": req.EndDate,
	})
	operatorLog := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "operator",
		EntityID:    assignment.OperatorID,
		ActionType:  "unassign",
		PerformedBy: userID,
		Changes:     operatorChanges,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, operatorLog)

	return nil
}

// GetCarAssignmentHistory retrieves assignment history for a car
func (s *OperatorService) GetCarAssignmentHistory(ctx context.Context, carID string) ([]models.CarOperatorAssignment, error) {
	if !utils.ValidateRequired(carID) {
		return nil, fmt.Errorf("car ID is required")
	}

	filters := &models.AssignmentFilters{
		CarID: &carID,
	}

	return s.operatorRepo.FindAssignmentHistory(ctx, filters)
}

// GetOperatorAssignmentHistory retrieves assignment history for an operator
func (s *OperatorService) GetOperatorAssignmentHistory(ctx context.Context, operatorID string) ([]models.CarOperatorAssignment, error) {
	if !utils.ValidateRequired(operatorID) {
		return nil, fmt.Errorf("operator ID is required")
	}

	filters := &models.AssignmentFilters{
		OperatorID: &operatorID,
	}

	return s.operatorRepo.FindAssignmentHistory(ctx, filters)
}
