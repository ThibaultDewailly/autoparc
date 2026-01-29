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

// RepairService handles repair business logic
type RepairService struct {
	repairRepo    *repository.RepairRepository
	carRepo       *repository.CarRepository
	accidentRepo  *repository.AccidentRepository
	garageRepo    *repository.GarageRepository
	actionLogRepo *repository.ActionLogRepository
}

// NewRepairService creates a new repair service
func NewRepairService(
	repairRepo *repository.RepairRepository,
	carRepo *repository.CarRepository,
	accidentRepo *repository.AccidentRepository,
	garageRepo *repository.GarageRepository,
	actionLogRepo *repository.ActionLogRepository,
) *RepairService {
	return &RepairService{
		repairRepo:    repairRepo,
		carRepo:       carRepo,
		accidentRepo:  accidentRepo,
		garageRepo:    garageRepo,
		actionLogRepo: actionLogRepo,
	}
}

// CreateRepair creates a new repair and logs the action
func (s *RepairService) CreateRepair(ctx context.Context, req *models.CreateRepairRequest, userID string) (*models.Repair, error) {
	// Validate request
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// Validate car exists
	if _, err := s.carRepo.FindByID(ctx, req.CarID); err != nil {
		return nil, fmt.Errorf("véhicule non trouvé")
	}

	// Validate accident exists if provided
	if req.AccidentID != nil && *req.AccidentID != "" {
		if _, err := s.accidentRepo.FindByID(ctx, *req.AccidentID); err != nil {
			return nil, fmt.Errorf("accident non trouvé")
	}
	}

	// Validate garage exists
	if _, err := s.garageRepo.FindByID(ctx, req.GarageID); err != nil {
		return nil, fmt.Errorf("garage non trouvé")
	}

	// Create repair
	createdBy := userID
	repair := &models.Repair{
		ID:            uuid.New().String(),
		CarID:         req.CarID,
		AccidentID:    req.AccidentID,
		GarageID:      req.GarageID,
		RepairType:    req.RepairType,
		Description:   req.Description,
		StartDate:     req.StartDate,
		EndDate:       req.EndDate,
		Cost:          req.Cost,
		Status:        models.RepairStatusScheduled,
		InvoiceNumber: req.InvoiceNumber,
		Notes:         req.Notes,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
		CreatedBy:     &createdBy,
	}

	if err := s.repairRepo.Create(ctx, repair); err != nil {
		return nil, fmt.Errorf("échec de la création de la réparation: %w", err)
	}

	// Log action
	changes, _ := json.Marshal(repair)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "repair",
		EntityID:    repair.ID,
		ActionType:  models.ActionTypeCreate,
		PerformedBy: userID,
		Changes:     changes,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	return repair, nil
}

// GetRepair retrieves a repair by ID
func (s *RepairService) GetRepair(ctx context.Context, id string) (*models.Repair, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("l'ID de la réparation est requis")
	}

	repair, err := s.repairRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return repair, nil
}

// GetRepairs retrieves repairs with pagination and filters
func (s *RepairService) GetRepairs(ctx context.Context, filters map[string]interface{}) ([]*models.Repair, int, error) {
	// Apply pagination defaults
	if _, ok := filters["limit"]; !ok {
		filters["limit"] = 20
	}
	if _, ok := filters["offset"]; !ok {
		filters["offset"] = 0
	}

	repairs, err := s.repairRepo.FindAll(ctx, filters)
	if err != nil {
		return nil, 0, err
	}

	count, err := s.repairRepo.Count(ctx, filters)
	if err != nil {
		return nil, 0, err
	}

	return repairs, count, nil
}

// GetRepairsByCarID retrieves all repairs for a specific car
func (s *RepairService) GetRepairsByCarID(ctx context.Context, carID string) ([]*models.Repair, error) {
	if !utils.ValidateRequired(carID) {
		return nil, fmt.Errorf("l'ID du véhicule est requis")
	}

	return s.repairRepo.FindByCarID(ctx, carID)
}

// GetRepairsByAccidentID retrieves all repairs for a specific accident
func (s *RepairService) GetRepairsByAccidentID(ctx context.Context, accidentID string) ([]*models.Repair, error) {
	if !utils.ValidateRequired(accidentID) {
		return nil, fmt.Errorf("l'ID de l'accident est requis")
	}

	return s.repairRepo.FindByAccidentID(ctx, accidentID)
}

// GetRepairsByGarageID retrieves all repairs for a specific garage
func (s *RepairService) GetRepairsByGarageID(ctx context.Context, garageID string) ([]*models.Repair, error) {
	if !utils.ValidateRequired(garageID) {
		return nil, fmt.Errorf("l'ID du garage est requis")
	}

	return s.repairRepo.FindByGarageID(ctx, garageID)
}

// UpdateRepair updates a repair and logs the action
func (s *RepairService) UpdateRepair(ctx context.Context, id string, req *models.UpdateRepairRequest, userID string) (*models.Repair, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("l'ID de la réparation est requis")
	}

	// Validate request
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// Get existing repair
	existingRepair, err := s.repairRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Build updates map
	updates := make(map[string]interface{})
	changes := make(map[string]interface{})

	if req.Description != nil && *req.Description != existingRepair.Description {
		updates["description"] = *req.Description
		changes["description"] = map[string]string{"old": existingRepair.Description, "new": *req.Description}
	}

	if req.StartDate != nil && !req.StartDate.Equal(existingRepair.StartDate) {
		updates["start_date"] = *req.StartDate
		changes["startDate"] = map[string]string{
			"old": existingRepair.StartDate.Format("2006-01-02"),
			"new": req.StartDate.Format("2006-01-02"),
		}
	}

	if req.EndDate != nil && (existingRepair.EndDate == nil || !req.EndDate.Equal(*existingRepair.EndDate)) {
		updates["end_date"] = *req.EndDate
		oldDate := "null"
		if existingRepair.EndDate != nil {
			oldDate = existingRepair.EndDate.Format("2006-01-02")
		}
		changes["endDate"] = map[string]string{
			"old": oldDate,
			"new": req.EndDate.Format("2006-01-02"),
		}
	}

	if req.Cost != nil {
		oldValue := float64(0)
		if existingRepair.Cost != nil {
			oldValue = *existingRepair.Cost
		}
		if existingRepair.Cost == nil || *req.Cost != *existingRepair.Cost {
			updates["cost"] = *req.Cost
			changes["cost"] = map[string]interface{}{
				"old": oldValue,
				"new": *req.Cost,
			}
		}
	}

	if req.InvoiceNumber != nil {
		oldValue := ""
		if existingRepair.InvoiceNumber != nil {
			oldValue = *existingRepair.InvoiceNumber
		}
		if existingRepair.InvoiceNumber == nil || *req.InvoiceNumber != *existingRepair.InvoiceNumber {
			updates["invoice_number"] = *req.InvoiceNumber
			changes["invoiceNumber"] = map[string]string{"old": oldValue, "new": *req.InvoiceNumber}
		}
	}

	if req.Notes != nil {
		oldValue := ""
		if existingRepair.Notes != nil {
			oldValue = *existingRepair.Notes
		}
		if existingRepair.Notes == nil || *req.Notes != *existingRepair.Notes {
			updates["notes"] = *req.Notes
			changes["notes"] = map[string]string{"old": oldValue, "new": *req.Notes}
		}
	}

	if len(updates) == 0 {
		return existingRepair, nil
	}

	// Update repair
	if err := s.repairRepo.Update(ctx, id, updates); err != nil {
		return nil, fmt.Errorf("échec de la mise à jour de la réparation: %w", err)
	}

	// Log action
	changesJSON, _ := json.Marshal(changes)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "repair",
		EntityID:    id,
		ActionType:  models.ActionTypeUpdate,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	// Return updated repair
	return s.repairRepo.FindByID(ctx, id)
}

// UpdateRepairStatus updates the status of a repair and logs the action
func (s *RepairService) UpdateRepairStatus(ctx context.Context, id string, status models.RepairStatus, userID string) (*models.Repair, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("l'ID de la réparation est requis")
	}

	// Validate status
	validStatuses := map[models.RepairStatus]bool{
		models.RepairStatusScheduled:  true,
		models.RepairStatusInProgress: true,
		models.RepairStatusCompleted:  true,
		models.RepairStatusCancelled:  true,
	}

	if !validStatuses[status] {
		return nil, fmt.Errorf("statut invalide")
	}

	// Get existing repair
	existingRepair, err := s.repairRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if existingRepair.Status == status {
		return existingRepair, nil
	}

	// Update status
	if err := s.repairRepo.UpdateStatus(ctx, id, status); err != nil {
		return nil, fmt.Errorf("échec de la mise à jour du statut: %w", err)
	}

	// Log action
	changes := map[string]interface{}{
		"status": map[string]string{
			"old": string(existingRepair.Status),
			"new": string(status),
		},
	}
	changesJSON, _ := json.Marshal(changes)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "repair",
		EntityID:    id,
		ActionType:  models.ActionTypeUpdate,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	// Return updated repair
	return s.repairRepo.FindByID(ctx, id)
}

// DeleteRepair deletes a repair and logs the action
func (s *RepairService) DeleteRepair(ctx context.Context, id string, userID string) error {
	if !utils.ValidateRequired(id) {
		return fmt.Errorf("l'ID de la réparation est requis")
	}

	// Get repair to log deletion
	repair, err := s.repairRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	// Delete repair
	if err := s.repairRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("échec de la suppression de la réparation: %w", err)
	}

	// Log action
	changesJSON, _ := json.Marshal(repair)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "repair",
		EntityID:    id,
		ActionType:  models.ActionTypeDelete,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	return nil
}
