package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/goldenkiwi/autoparc/internal/middleware"
	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/service"
)

// OperatorHandler handles operator-related HTTP requests
type OperatorHandler struct {
	operatorService *service.OperatorService
}

// NewOperatorHandler creates a new operator handler
func NewOperatorHandler(operatorService *service.OperatorService) *OperatorHandler {
	return &OperatorHandler{
		operatorService: operatorService,
	}
}

// GetOperators handles GET /api/v1/operators
func (h *OperatorHandler) GetOperators(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	query := r.URL.Query()

	filters := &models.OperatorFilters{
		Search:     query.Get("search"),
		Department: query.Get("department"),
		Page:       parseIntQuery(query.Get("page"), 1),
		Limit:      parseIntQuery(query.Get("limit"), 20),
		SortBy:     query.Get("sortBy"),
		SortOrder:  query.Get("sortOrder"),
	}

	// Parse isActive filter
	if isActiveStr := query.Get("isActive"); isActiveStr != "" {
		isActive := isActiveStr == "true"
		filters.IsActive = &isActive
	}

	response, err := h.operatorService.GetOperators(r.Context(), filters)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve operators"})
		return
	}

	respondJSON(w, http.StatusOK, response)
}

// GetOperator handles GET /api/v1/operators/{id}
func (h *OperatorHandler) GetOperator(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/operators/")

	// Handle assignment-history sub-route
	if strings.Contains(id, "/assignment-history") {
		h.GetOperatorAssignmentHistory(w, r)
		return
	}

	operator, err := h.operatorService.GetOperator(r.Context(), id)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Operator not found"})
		return
	}

	respondJSON(w, http.StatusOK, operator)
}

// CreateOperator handles POST /api/v1/operators
func (h *OperatorHandler) CreateOperator(w http.ResponseWriter, r *http.Request) {
	var req models.CreateOperatorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	operator, err := h.operatorService.CreateOperator(r.Context(), &req, user.ID)
	if err != nil {
		if strings.Contains(err.Error(), "already exists") {
			respondJSON(w, http.StatusConflict, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusCreated, operator)
}

// UpdateOperator handles PUT /api/v1/operators/{id}
func (h *OperatorHandler) UpdateOperator(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/operators/")

	var req models.UpdateOperatorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	operator, err := h.operatorService.UpdateOperator(r.Context(), id, &req, user.ID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, operator)
}

// DeleteOperator handles DELETE /api/v1/operators/{id}
func (h *OperatorHandler) DeleteOperator(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/operators/")

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	if err := h.operatorService.DeleteOperator(r.Context(), id, user.ID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "active car assignment") {
			respondJSON(w, http.StatusConflict, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Operator deleted successfully"})
}

// AssignOperator handles POST /api/v1/cars/{id}/assign
func (h *OperatorHandler) AssignOperator(w http.ResponseWriter, r *http.Request) {
	// Extract car ID from path
	path := strings.TrimPrefix(r.URL.Path, "/api/v1/cars/")
	carID := strings.TrimSuffix(path, "/assign")

	var req models.AssignOperatorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	assignment, err := h.operatorService.AssignOperatorToCar(r.Context(), carID, &req, user.ID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "already has") || strings.Contains(err.Error(), "must be active") {
			respondJSON(w, http.StatusConflict, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusCreated, assignment)
}

// UnassignOperator handles POST /api/v1/cars/{id}/unassign
func (h *OperatorHandler) UnassignOperator(w http.ResponseWriter, r *http.Request) {
	// Extract car ID from path
	path := strings.TrimPrefix(r.URL.Path, "/api/v1/cars/")
	carID := strings.TrimSuffix(path, "/unassign")

	var req models.UnassignOperatorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	if err := h.operatorService.UnassignOperatorFromCar(r.Context(), carID, &req, user.ID); err != nil {
		if strings.Contains(err.Error(), "not found") || strings.Contains(err.Error(), "no active assignment") {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Operator unassigned successfully"})
}

// GetCarAssignmentHistory handles GET /api/v1/cars/{id}/assignment-history
func (h *OperatorHandler) GetCarAssignmentHistory(w http.ResponseWriter, r *http.Request) {
	// Extract car ID from path
	path := strings.TrimPrefix(r.URL.Path, "/api/v1/cars/")
	carID := strings.TrimSuffix(path, "/assignment-history")

	history, err := h.operatorService.GetCarAssignmentHistory(r.Context(), carID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve assignment history"})
		return
	}

	respondJSON(w, http.StatusOK, history)
}

// GetOperatorAssignmentHistory handles GET /api/v1/operators/{id}/assignment-history
func (h *OperatorHandler) GetOperatorAssignmentHistory(w http.ResponseWriter, r *http.Request) {
	// Extract operator ID from path
	path := strings.TrimPrefix(r.URL.Path, "/api/v1/operators/")
	operatorID := strings.TrimSuffix(path, "/assignment-history")

	history, err := h.operatorService.GetOperatorAssignmentHistory(r.Context(), operatorID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve assignment history"})
		return
	}

	respondJSON(w, http.StatusOK, history)
}
