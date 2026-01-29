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

// AccidentService handles accident business logic
type AccidentService struct {
	accidentRepo      *repository.AccidentRepository
	accidentPhotoRepo *repository.AccidentPhotoRepository
	carRepo           *repository.CarRepository
	actionLogRepo     *repository.ActionLogRepository
}

// NewAccidentService creates a new accident service
func NewAccidentService(
	accidentRepo *repository.AccidentRepository,
	accidentPhotoRepo *repository.AccidentPhotoRepository,
	carRepo *repository.CarRepository,
	actionLogRepo *repository.ActionLogRepository,
) *AccidentService {
	return &AccidentService{
		accidentRepo:      accidentRepo,
		accidentPhotoRepo: accidentPhotoRepo,
		carRepo:           carRepo,
		actionLogRepo:     actionLogRepo,
	}
}

// CreateAccident creates a new accident and logs the action
func (s *AccidentService) CreateAccident(ctx context.Context, req *models.CreateAccidentRequest, userID string) (*models.Accident, error) {
	// Validate request
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// Validate car exists
	if _, err := s.carRepo.FindByID(ctx, req.CarID); err != nil {
		return nil, fmt.Errorf("véhicule non trouvé")
	}

	// Create accident
	createdBy := userID
	accident := &models.Accident{
		ID:                    uuid.New().String(),
		CarID:                 req.CarID,
		AccidentDate:          req.AccidentDate,
		Location:              req.Location,
		Description:           req.Description,
		DamagesDescription:    req.DamagesDescription,
		ResponsibleParty:      req.ResponsibleParty,
		PoliceReportNumber:    req.PoliceReportNumber,
		InsuranceClaimNumber:  req.InsuranceClaimNumber,
		Status:                models.AccidentStatusDeclared,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
		CreatedBy:             &createdBy,
	}

	if err := s.accidentRepo.Create(ctx, accident); err != nil {
		return nil, fmt.Errorf("échec de la création de l'accident: %w", err)
	}

	// Log action
	changes, _ := json.Marshal(accident)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "accident",
		EntityID:    accident.ID,
		ActionType:  models.ActionTypeCreate,
		PerformedBy: userID,
		Changes:     changes,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	return accident, nil
}

// GetAccident retrieves an accident by ID
func (s *AccidentService) GetAccident(ctx context.Context, id string) (*models.Accident, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("l'ID de l'accident est requis")
	}

	accident, err := s.accidentRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return accident, nil
}

// GetAccidents retrieves accidents with pagination and filters
func (s *AccidentService) GetAccidents(ctx context.Context, filters map[string]interface{}) ([]*models.Accident, int, error) {
	// Apply pagination defaults
	if _, ok := filters["limit"]; !ok {
		filters["limit"] = 20
	}
	if _, ok := filters["offset"]; !ok {
		filters["offset"] = 0
	}

	accidents, err := s.accidentRepo.FindAll(ctx, filters)
	if err != nil {
		return nil, 0, err
	}

	count, err := s.accidentRepo.Count(ctx, filters)
	if err != nil {
		return nil, 0, err
	}

	return accidents, count, nil
}

// GetAccidentsByCarID retrieves all accidents for a specific car
func (s *AccidentService) GetAccidentsByCarID(ctx context.Context, carID string) ([]*models.Accident, error) {
	if !utils.ValidateRequired(carID) {
		return nil, fmt.Errorf("l'ID du véhicule est requis")
	}

	return s.accidentRepo.FindByCarID(ctx, carID)
}

// UpdateAccident updates an accident and logs the action
func (s *AccidentService) UpdateAccident(ctx context.Context, id string, req *models.UpdateAccidentRequest, userID string) (*models.Accident, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("l'ID de l'accident est requis")
	}

	// Validate request
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// Get existing accident
	existingAccident, err := s.accidentRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Build updates map
	updates := make(map[string]interface{})
	changes := make(map[string]interface{})

	if req.Location != nil && *req.Location != existingAccident.Location {
		updates["location"] = *req.Location
		changes["location"] = map[string]string{"old": existingAccident.Location, "new": *req.Location}
	}

	if req.Description != nil && *req.Description != existingAccident.Description {
		updates["description"] = *req.Description
		changes["description"] = map[string]string{"old": existingAccident.Description, "new": *req.Description}
	}

	if req.DamagesDescription != nil {
		oldValue := ""
		if existingAccident.DamagesDescription != nil {
			oldValue = *existingAccident.DamagesDescription
		}
		if existingAccident.DamagesDescription == nil || *req.DamagesDescription != *existingAccident.DamagesDescription {
			updates["damages_description"] = *req.DamagesDescription
			changes["damagesDescription"] = map[string]string{"old": oldValue, "new": *req.DamagesDescription}
		}
	}

	if req.ResponsibleParty != nil {
		oldValue := ""
		if existingAccident.ResponsibleParty != nil {
			oldValue = *existingAccident.ResponsibleParty
		}
		if existingAccident.ResponsibleParty == nil || *req.ResponsibleParty != *existingAccident.ResponsibleParty {
			updates["responsible_party"] = *req.ResponsibleParty
			changes["responsibleParty"] = map[string]string{"old": oldValue, "new": *req.ResponsibleParty}
		}
	}

	if req.PoliceReportNumber != nil {
		oldValue := ""
		if existingAccident.PoliceReportNumber != nil {
			oldValue = *existingAccident.PoliceReportNumber
		}
		if existingAccident.PoliceReportNumber == nil || *req.PoliceReportNumber != *existingAccident.PoliceReportNumber {
			updates["police_report_number"] = *req.PoliceReportNumber
			changes["policeReportNumber"] = map[string]string{"old": oldValue, "new": *req.PoliceReportNumber}
		}
	}

	if req.InsuranceClaimNumber != nil {
		oldValue := ""
		if existingAccident.InsuranceClaimNumber != nil {
			oldValue = *existingAccident.InsuranceClaimNumber
		}
		if existingAccident.InsuranceClaimNumber == nil || *req.InsuranceClaimNumber != *existingAccident.InsuranceClaimNumber {
			updates["insurance_claim_number"] = *req.InsuranceClaimNumber
			changes["insuranceClaimNumber"] = map[string]string{"old": oldValue, "new": *req.InsuranceClaimNumber}
		}
	}

	if len(updates) == 0 {
		return existingAccident, nil
	}

	// Update accident
	if err := s.accidentRepo.Update(ctx, id, updates); err != nil {
		return nil, fmt.Errorf("échec de la mise à jour de l'accident: %w", err)
	}

	// Log action
	changesJSON, _ := json.Marshal(changes)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "accident",
		EntityID:    id,
		ActionType:  models.ActionTypeUpdate,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	// Return updated accident
	return s.accidentRepo.FindByID(ctx, id)
}

// UpdateAccidentStatus updates the status of an accident and logs the action
func (s *AccidentService) UpdateAccidentStatus(ctx context.Context, id string, status models.AccidentStatus, userID string) (*models.Accident, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("l'ID de l'accident est requis")
	}

	// Validate status
	validStatuses := map[models.AccidentStatus]bool{
		models.AccidentStatusDeclared:    true,
		models.AccidentStatusUnderReview: true,
		models.AccidentStatusApproved:    true,
		models.AccidentStatusClosed:      true,
	}

	if !validStatuses[status] {
		return nil, fmt.Errorf("statut invalide")
	}

	// Get existing accident
	existingAccident, err := s.accidentRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if existingAccident.Status == status {
		return existingAccident, nil
	}

	// Update status
	if err := s.accidentRepo.UpdateStatus(ctx, id, status); err != nil {
		return nil, fmt.Errorf("échec de la mise à jour du statut: %w", err)
	}

	// Log action
	changes := map[string]interface{}{
		"status": map[string]string{
			"old": string(existingAccident.Status),
			"new": string(status),
		},
	}
	changesJSON, _ := json.Marshal(changes)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "accident",
		EntityID:    id,
		ActionType:  models.ActionTypeUpdate,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	// Return updated accident
	return s.accidentRepo.FindByID(ctx, id)
}

// UploadAccidentPhoto uploads a photo for an accident
func (s *AccidentService) UploadAccidentPhoto(ctx context.Context, req *models.UploadPhotoRequest, userID string) (*models.AccidentPhoto, error) {
	// Validate request
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// Validate accident exists
	if _, err := s.accidentRepo.FindByID(ctx, req.AccidentID); err != nil {
		return nil, fmt.Errorf("accident non trouvé")
	}

	// Create photo
	uploadedBy := userID
	photo := &models.AccidentPhoto{
		ID:              uuid.New().String(),
		AccidentID:      req.AccidentID,
		Filename:        req.FileName,
		FileSize:        req.FileSize,
		MimeType:        req.MimeType,
		FileData:        req.FileData,
		CompressionType: "gzip",
		Description:     req.Description,
		UploadedAt:      time.Now(),
		UploadedBy:      &uploadedBy,
	}

	if err := s.accidentPhotoRepo.Create(ctx, photo); err != nil {
		return nil, fmt.Errorf("échec de l'upload de la photo: %w", err)
	}

	// Log action
	changes := map[string]interface{}{
		"fileName": req.FileName,
		"fileSize": req.FileSize,
		"mimeType": req.MimeType,
	}
	changesJSON, _ := json.Marshal(changes)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "accident",
		EntityID:    req.AccidentID,
		ActionType:  models.ActionTypeUpdate,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	// Return photo without file data
	photoMetadata, err := s.accidentPhotoRepo.FindByID(ctx, photo.ID)
	if err != nil {
		return photo, nil
	}
	photoMetadata.FileData = nil // Don't return file data in response
	return photoMetadata, nil
}

// GetAccidentPhoto retrieves a photo by ID with file data
func (s *AccidentService) GetAccidentPhoto(ctx context.Context, id string) (*models.AccidentPhoto, error) {
	if !utils.ValidateRequired(id) {
		return nil, fmt.Errorf("l'ID de la photo est requis")
	}

	return s.accidentPhotoRepo.FindByID(ctx, id)
}

// GetAccidentPhotos retrieves all photos for an accident (metadata only)
func (s *AccidentService) GetAccidentPhotos(ctx context.Context, accidentID string) ([]*models.AccidentPhotoMetadata, error) {
	if !utils.ValidateRequired(accidentID) {
		return nil, fmt.Errorf("l'ID de l'accident est requis")
	}

	return s.accidentPhotoRepo.FindByAccidentID(ctx, accidentID)
}

// DeleteAccidentPhoto deletes a photo and logs the action
func (s *AccidentService) DeleteAccidentPhoto(ctx context.Context, id string, userID string) error {
	if !utils.ValidateRequired(id) {
		return fmt.Errorf("l'ID de la photo est requis")
	}

	// Get photo to log deletion
	photo, err := s.accidentPhotoRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	// Delete photo
	if err := s.accidentPhotoRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("échec de la suppression de la photo: %w", err)
	}

	// Log action
	changes := map[string]interface{}{
		"photoId":  id,
		"fileName": photo.Filename,
	}
	changesJSON, _ := json.Marshal(changes)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "accident",
		EntityID:    photo.AccidentID,
		ActionType:  models.ActionTypeUpdate,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	return nil
}

// DeleteAccident deletes an accident and logs the action
func (s *AccidentService) DeleteAccident(ctx context.Context, id string, userID string) error {
	if !utils.ValidateRequired(id) {
		return fmt.Errorf("l'ID de l'accident est requis")
	}

	// Get accident to log deletion
	accident, err := s.accidentRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	// Delete accident (photos will be deleted via CASCADE)
	if err := s.accidentRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("échec de la suppression de l'accident: %w", err)
	}

	// Log action
	changesJSON, _ := json.Marshal(accident)
	log := &models.ActionLog{
		ID:          uuid.New().String(),
		EntityType:  "accident",
		EntityID:    id,
		ActionType:  models.ActionTypeDelete,
		PerformedBy: userID,
		Changes:     changesJSON,
		Timestamp:   time.Now(),
	}
	s.actionLogRepo.Create(ctx, log)

	return nil
}
