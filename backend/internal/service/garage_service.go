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

// GarageService handles garage business logic
type GarageService struct {
	garageRepo    *repository.GarageRepository
	actionLogRepo *repository.ActionLogRepository
}

// NewGarageService creates a new garage service
func NewGarageService(
	garageRepo *repository.GarageRepository,
	actionLogRepo *repository.ActionLogRepository,
) *GarageService {
	return &GarageService{
		garageRepo:    garageRepo,
		actionLogRepo: actionLogRepo,
	}
}

// CreateGarage creates a new garage and logs the action
func (s *GarageService) CreateGarage(ctx context.Context, req *models.CreateGarageRequest, userID string) (*models.Garage, error) {
	// Validate request
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// Create garage
	createdBy := userID
	garage := &models.Garage{
		ID:             uuid.New().String(),
		Name:           req.Name,
		ContactPerson:  req.ContactPerson,
		Phone:          req.Phone,
		Email:          req.Email,
		Address:        req.Address,
		Specialization: req.Specialization,
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
		CreatedBy:      &createdBy,
	}

	if err := s.garageRepo.Create(ctx, garage); err != nil {
		return nil, fmt.Errorf("échec de la création du garage: %w", err)
	}

	// Log action
	changes, _ := json.Marshal(garage)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "garage",
		EntityID:    garage.ID,
		ActionType:  models.ActionTypeCreate,
		PerformedBy: userID,
		Changes:     changes,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	return garage, nil
}

// GetGarage retrieves a garage by ID
func (s *GarageService) GetGarage(ctx context.Context, id string) (*models.Garage, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("l'ID du garage est requis")
	}

	garage, err := s.garageRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return garage, nil
}

// GetGarages retrieves garages with pagination and filters
func (s *GarageService) GetGarages(ctx context.Context, filters map[string]interface{}) ([]*models.Garage, int, error) {
	// Apply pagination defaults
	if _, ok := filters["limit"]; !ok {
		filters["limit"] = 20
	}
	if _, ok := filters["offset"]; !ok {
		filters["offset"] = 0
	}

	garages, err := s.garageRepo.FindAll(ctx, filters)
	if err != nil {
		return nil, 0, err
	}

	count, err := s.garageRepo.Count(ctx, filters)
	if err != nil {
		return nil, 0, err
	}

	return garages, count, nil
}

// UpdateGarage updates a garage and logs the action
func (s *GarageService) UpdateGarage(ctx context.Context, id string, req *models.UpdateGarageRequest, userID string) (*models.Garage, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("l'ID du garage est requis")
	}

	// Validate request
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// Get existing garage
	existingGarage, err := s.garageRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Build updates map
	updates := make(map[string]interface{})
	changes := make(map[string]interface{})

	if req.Name != nil && *req.Name != existingGarage.Name {
		updates["name"] = *req.Name
		changes["name"] = map[string]string{"old": existingGarage.Name, "new": *req.Name}
	}

	if req.ContactPerson != nil {
		oldValue := ""
		if existingGarage.ContactPerson != nil {
			oldValue = *existingGarage.ContactPerson
		}
		if existingGarage.ContactPerson == nil || *req.ContactPerson != *existingGarage.ContactPerson {
			updates["contact_person"] = *req.ContactPerson
			changes["contactPerson"] = map[string]string{"old": oldValue, "new": *req.ContactPerson}
		}
	}

	if req.Phone != nil && *req.Phone != existingGarage.Phone {
		updates["phone"] = *req.Phone
		changes["phone"] = map[string]string{"old": existingGarage.Phone, "new": *req.Phone}
	}

	if req.Email != nil {
		oldValue := ""
		if existingGarage.Email != nil {
			oldValue = *existingGarage.Email
		}
		if existingGarage.Email == nil || *req.Email != *existingGarage.Email {
			updates["email"] = *req.Email
			changes["email"] = map[string]string{"old": oldValue, "new": *req.Email}
		}
	}

	if req.Address != nil && *req.Address != existingGarage.Address {
		updates["address"] = *req.Address
		changes["address"] = map[string]string{"old": existingGarage.Address, "new": *req.Address}
	}

	if req.Specialization != nil {
		oldValue := ""
		if existingGarage.Specialization != nil {
			oldValue = *existingGarage.Specialization
		}
		if existingGarage.Specialization == nil || *req.Specialization != *existingGarage.Specialization {
			updates["specialization"] = *req.Specialization
			changes["specialization"] = map[string]string{"old": oldValue, "new": *req.Specialization}
		}
	}

	if len(updates) == 0 {
		return existingGarage, nil
	}

	// Update garage
	if err := s.garageRepo.Update(ctx, id, updates); err != nil {
		return nil, fmt.Errorf("échec de la mise à jour du garage: %w", err)
	}

	// Log action
	changesJSON, _ := json.Marshal(changes)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "garage",
		EntityID:    id,
		ActionType:  models.ActionTypeUpdate,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	// Return updated garage
	return s.garageRepo.FindByID(ctx, id)
}

// DeleteGarage soft deletes a garage and logs the action
func (s *GarageService) DeleteGarage(ctx context.Context, id string, userID string) error {
	if !utils.ValidateRequired(id) {
		return fmt.Errorf("l'ID du garage est requis")
	}

	// Check if garage exists
	garage, err := s.garageRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	// Check if garage is used by any repairs
	isUsed, err := s.garageRepo.IsUsedByRepairs(ctx, id)
	if err != nil {
		return fmt.Errorf("échec de la vérification de l'utilisation du garage: %w", err)
	}

	if isUsed {
		return fmt.Errorf("impossible de supprimer le garage car il est utilisé par des réparations")
	}

	// Delete garage
	if err := s.garageRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("échec de la suppression du garage: %w", err)
	}

	// Log action
	changesJSON, _ := json.Marshal(garage)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "garage",
		EntityID:    id,
		ActionType:  models.ActionTypeDelete,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	return nil
}
