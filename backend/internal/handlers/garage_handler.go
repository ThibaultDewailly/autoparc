package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/goldenkiwi/autoparc/internal/middleware"
	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
)

type GarageHandler struct {
	garageRepo *repository.GarageRepository
}

func NewGarageHandler(garageRepo *repository.GarageRepository) *GarageHandler {
	return &GarageHandler{
		garageRepo: garageRepo,
	}
}

// ListGarages handles GET /api/v1/garages
func (h *GarageHandler) ListGarages(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Parse query parameters
	query := r.URL.Query()
	filters := make(map[string]interface{})

	if search := query.Get("search"); search != "" {
		filters["search"] = search
	}

	if isActive := query.Get("is_active"); isActive != "" {
		filters["is_active"] = isActive == "true"
	}

	if page := query.Get("page"); page != "" {
		filters["page"] = page
	}

	if limit := query.Get("limit"); limit != "" {
		filters["limit"] = limit
	}

	// Get garages from repository
	garages, err := h.garageRepo.FindAll(ctx, filters)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve garages",
		})
		return
	}

	respondJSON(w, http.StatusOK, garages)
}

// GetGarage handles GET /api/v1/garages/{id}
func (h *GarageHandler) GetGarage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/garages/")
	id = strings.Split(id, "/")[0]

	garage, err := h.garageRepo.FindByID(ctx, id)
	if err != nil {
		if err.Error() == "garage not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Garage not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve garage",
		})
		return
	}

	respondJSON(w, http.StatusOK, garage)
}

// CreateGarage handles POST /api/v1/garages
func (h *GarageHandler) CreateGarage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req models.CreateGarageRequest
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

	// Create garage
	garage := &models.Garage{
		Name:           req.Name,
		ContactPerson:  req.ContactPerson,
		Phone:          req.Phone,
		Email:          req.Email,
		Address:        req.Address,
		Specialization: req.Specialization,
		IsActive:       true,
		CreatedBy:      &userID,
	}

	if err := h.garageRepo.Create(ctx, garage); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to create garage",
		})
		return
	}

	respondJSON(w, http.StatusCreated, garage)
}

// UpdateGarage handles PUT /api/v1/garages/{id}
func (h *GarageHandler) UpdateGarage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/garages/")
	id = strings.Split(id, "/")[0]

	var req models.UpdateGarageRequest
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

	// Check if garage exists
	_, err := h.garageRepo.FindByID(ctx, id)
	if err != nil {
		if err.Error() == "garage not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Garage not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve garage",
		})
		return
	}

	// Build updates map
	updates := make(map[string]interface{})

	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.ContactPerson != nil {
		updates["contact_person"] = *req.ContactPerson
	}
	if req.Phone != nil {
		updates["phone"] = *req.Phone
	}
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.Address != nil {
		updates["address"] = *req.Address
	}
	if req.Specialization != nil {
		updates["specialization"] = *req.Specialization
	}

	// Update garage
	if err := h.garageRepo.Update(ctx, id, updates); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to update garage",
		})
		return
	}

	// Retrieve updated garage
	garage, err := h.garageRepo.FindByID(ctx, id)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve updated garage",
		})
		return
	}

	respondJSON(w, http.StatusOK, garage)
}

// DeleteGarage handles DELETE /api/v1/garages/{id}
func (h *GarageHandler) DeleteGarage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/garages/")
	id = strings.Split(id, "/")[0]

	// Check if garage exists
	_, err := h.garageRepo.FindByID(ctx, id)
	if err != nil {
		if err.Error() == "garage not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Garage not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve garage",
		})
		return
	}

	// Check if garage is used by repairs
	isUsed, err := h.garageRepo.IsUsedByRepairs(ctx, id)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to check garage usage",
		})
		return
	}

	if isUsed {
		respondJSON(w, http.StatusConflict, map[string]string{
			"error": "Cannot delete garage that has associated repairs",
		})
		return
	}

	// Soft delete garage
	if err := h.garageRepo.Delete(ctx, id); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to delete garage",
		})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Garage deleted successfully",
	})
}
