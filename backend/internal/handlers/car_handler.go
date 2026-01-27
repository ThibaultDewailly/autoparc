package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/goldenkiwi/autoparc/internal/middleware"
	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/service"
)

// CarHandler handles car-related HTTP requests
type CarHandler struct {
	carService *service.CarService
}

// NewCarHandler creates a new car handler
func NewCarHandler(carService *service.CarService) *CarHandler {
	return &CarHandler{
		carService: carService,
	}
}

// GetCars handles GET /api/v1/cars
func (h *CarHandler) GetCars(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	query := r.URL.Query()

	filters := &models.CarFilters{
		Search:    query.Get("search"),
		Page:      parseIntQuery(query.Get("page"), 1),
		Limit:     parseIntQuery(query.Get("limit"), 20),
		SortBy:    query.Get("sortBy"),
		SortOrder: query.Get("sortOrder"),
	}

	// Parse status filter
	if statusStr := query.Get("status"); statusStr != "" {
		status := models.CarStatus(statusStr)
		filters.Status = &status
	}

	response, err := h.carService.GetCars(r.Context(), filters)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve cars"})
		return
	}

	respondJSON(w, http.StatusOK, response)
}

// GetCar handles GET /api/v1/cars/{id}
func (h *CarHandler) GetCar(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/cars/")

	car, err := h.carService.GetCar(r.Context(), id)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Car not found"})
		return
	}

	respondJSON(w, http.StatusOK, car)
}

// CreateCar handles POST /api/v1/cars
func (h *CarHandler) CreateCar(w http.ResponseWriter, r *http.Request) {
	var req models.CreateCarRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	car, err := h.carService.CreateCar(r.Context(), &req, user.ID)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusCreated, car)
}

// UpdateCar handles PUT /api/v1/cars/{id}
func (h *CarHandler) UpdateCar(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/cars/")

	var req models.UpdateCarRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	car, err := h.carService.UpdateCar(r.Context(), id, &req, user.ID)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, car)
}

// DeleteCar handles DELETE /api/v1/cars/{id}
func (h *CarHandler) DeleteCar(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/cars/")

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	if err := h.carService.DeleteCar(r.Context(), id, user.ID); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Car deleted successfully"})
}
