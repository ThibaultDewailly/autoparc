package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/goldenkiwi/autoparc/internal/middleware"
	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
)

type RepairHandler struct {
	repairRepo *repository.RepairRepository
}

func NewRepairHandler(repairRepo *repository.RepairRepository) *RepairHandler {
	return &RepairHandler{
		repairRepo: repairRepo,
	}
}

// ListRepairs handles GET /api/v1/repairs
func (h *RepairHandler) ListRepairs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Parse query parameters
	query := r.URL.Query()
	filters := make(map[string]interface{})

	if search := query.Get("search"); search != "" {
		filters["search"] = search
	}

	if carID := query.Get("car_id"); carID != "" {
		filters["car_id"] = carID
	}

	if accidentID := query.Get("accident_id"); accidentID != "" {
		filters["accident_id"] = accidentID
	}

	if garageID := query.Get("garage_id"); garageID != "" {
		filters["garage_id"] = garageID
	}

	if repairType := query.Get("repair_type"); repairType != "" {
		filters["repair_type"] = repairType
	}

	if status := query.Get("status"); status != "" {
		filters["status"] = status
	}

	if page := query.Get("page"); page != "" {
		filters["page"] = page
	}

	if limit := query.Get("limit"); limit != "" {
		filters["limit"] = limit
	}

	// Get repairs from repository
	repairs, err := h.repairRepo.FindAll(ctx, filters)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve repairs",
		})
		return
	}

	respondJSON(w, http.StatusOK, repairs)
}

// GetRepair handles GET /api/v1/repairs/{id}
func (h *RepairHandler) GetRepair(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/repairs/")
	id = strings.Split(id, "/")[0]

	repair, err := h.repairRepo.FindByID(ctx, id)
	if err != nil {
		if err.Error() == "repair not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Repair not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve repair",
		})
		return
	}

	respondJSON(w, http.StatusOK, repair)
}

// CreateRepair handles POST /api/v1/repairs
func (h *RepairHandler) CreateRepair(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req models.CreateRepairRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
		return
	}

	// Get user from context
	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)
	userID := user.ID

	// Create repair
	repair := &models.Repair{
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
		CreatedBy:     &userID,
	}

	if err := h.repairRepo.Create(ctx, repair); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to create repair",
		})
		return
	}

	respondJSON(w, http.StatusCreated, repair)
}

// UpdateRepair handles PUT /api/v1/repairs/{id}
func (h *RepairHandler) UpdateRepair(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/repairs/")
	id = strings.Split(id, "/")[0]

	var req models.UpdateRepairRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
		return
	}

	// Check if repair exists
	_, err := h.repairRepo.FindByID(ctx, id)
	if err != nil {
		if err.Error() == "repair not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Repair not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve repair",
		})
		return
	}

	// Build updates map
	updates := make(map[string]interface{})

	if req.GarageID != nil {
		updates["garage_id"] = *req.GarageID
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.StartDate != nil {
		updates["start_date"] = *req.StartDate
	}
	if req.EndDate != nil {
		updates["end_date"] = *req.EndDate
	}
	if req.Cost != nil {
		updates["cost"] = *req.Cost
	}
	if req.InvoiceNumber != nil {
		updates["invoice_number"] = *req.InvoiceNumber
	}
	if req.Notes != nil {
		updates["notes"] = *req.Notes
	}

	// Update repair
	if err := h.repairRepo.Update(ctx, id, updates); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to update repair",
		})
		return
	}

	// Retrieve updated repair
	repair, err := h.repairRepo.FindByID(ctx, id)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve updated repair",
		})
		return
	}

	respondJSON(w, http.StatusOK, repair)
}

// DeleteRepair handles DELETE /api/v1/repairs/{id}
func (h *RepairHandler) DeleteRepair(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/repairs/")
	id = strings.Split(id, "/")[0]

	// Check if repair exists
	_, err := h.repairRepo.FindByID(ctx, id)
	if err != nil {
		if err.Error() == "repair not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Repair not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve repair",
		})
		return
	}

	// Delete repair
	if err := h.repairRepo.Delete(ctx, id); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to delete repair",
		})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Repair deleted successfully",
	})
}

// UpdateRepairStatus handles PATCH /api/v1/repairs/{id}/status
func (h *RepairHandler) UpdateRepairStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/repairs/")
	id = strings.Split(id, "/")[0]

	var req models.UpdateRepairStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
		return
	}

	// Check if repair exists
	_, err := h.repairRepo.FindByID(ctx, id)
	if err != nil {
		if err.Error() == "repair not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Repair not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve repair",
		})
		return
	}

	// Update status
	updates := map[string]interface{}{
		"status": string(req.Status),
	}

	if err := h.repairRepo.Update(ctx, id, updates); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to update repair status",
		})
		return
	}

	// Retrieve updated repair
	repair, err := h.repairRepo.FindByID(ctx, id)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve updated repair",
		})
		return
	}

	respondJSON(w, http.StatusOK, repair)
}
