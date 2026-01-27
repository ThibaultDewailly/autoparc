package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/goldenkiwi/autoparc/internal/middleware"
	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/goldenkiwi/autoparc/internal/service"
)

// EmployeeHandler handles employee-related HTTP requests
type EmployeeHandler struct {
	employeeService *service.EmployeeService
}

// NewEmployeeHandler creates a new employee handler
func NewEmployeeHandler(employeeService *service.EmployeeService) *EmployeeHandler {
	return &EmployeeHandler{
		employeeService: employeeService,
	}
}

// CreateEmployee handles POST /api/v1/employees
func (h *EmployeeHandler) CreateEmployee(w http.ResponseWriter, r *http.Request) {
	var req service.CreateEmployeeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Corps de requête invalide"})
		return
	}

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	employee, err := h.employeeService.CreateEmployee(r.Context(), req, user.ID)
	if err != nil {
		if strings.Contains(err.Error(), "email already exists") {
			respondJSON(w, http.StatusConflict, map[string]string{"error": "Cet email existe déjà"})
			return
		}
		if strings.Contains(err.Error(), "password") || strings.Contains(err.Error(), "email") || strings.Contains(err.Error(), "required") {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Échec de la création de l'employé"})
		return
	}

	respondJSON(w, http.StatusCreated, employee)
}

// GetEmployee handles GET /api/v1/employees/{id}
func (h *EmployeeHandler) GetEmployee(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/employees/")

	employee, err := h.employeeService.GetEmployee(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "invalid employee ID format") {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Format d'ID invalide"})
			return
		}
		if strings.Contains(err.Error(), "not found") {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": "Employé non trouvé"})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Échec de la récupération de l'employé"})
		return
	}

	respondJSON(w, http.StatusOK, employee)
}

// GetEmployees handles GET /api/v1/employees
func (h *EmployeeHandler) GetEmployees(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	filters := repository.EmployeeFilters{
		Search:   query.Get("search"),
		Role:     query.Get("role"),
		Page:     parseIntQuery(query.Get("page"), 1),
		Limit:    parseIntQuery(query.Get("limit"), 20),
		SortBy:   query.Get("sortBy"),
		SortDesc: query.Get("order") == "desc",
	}

	// Parse is_active filter
	if isActiveStr := query.Get("isActive"); isActiveStr != "" {
		isActive := isActiveStr == "true"
		filters.IsActive = &isActive
	}

	response, err := h.employeeService.GetEmployees(r.Context(), filters)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Échec de la récupération des employés"})
		return
	}

	respondJSON(w, http.StatusOK, response)
}

// UpdateEmployee handles PUT /api/v1/employees/{id}
func (h *EmployeeHandler) UpdateEmployee(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/employees/")

	var req service.UpdateEmployeeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Corps de requête invalide"})
		return
	}

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	employee, err := h.employeeService.UpdateEmployee(r.Context(), id, req, user.ID)
	if err != nil {
		if strings.Contains(err.Error(), "invalid employee ID format") {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Format d'ID invalide"})
			return
		}
		if strings.Contains(err.Error(), "email already exists") {
			respondJSON(w, http.StatusConflict, map[string]string{"error": "Cet email existe déjà"})
			return
		}
		if strings.Contains(err.Error(), "not found") {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": "Employé non trouvé"})
			return
		}
		if strings.Contains(err.Error(), "cannot be empty") || strings.Contains(err.Error(), "invalid") {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Échec de la mise à jour de l'employé"})
		return
	}

	respondJSON(w, http.StatusOK, employee)
}

// ChangePassword handles POST /api/v1/employees/{id}/change-password
func (h *EmployeeHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 5 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Format d'URL invalide"})
		return
	}
	id := pathParts[4]

	var req service.ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Corps de requête invalide"})
		return
	}

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	err := h.employeeService.ChangePassword(r.Context(), id, req, user.ID)
	if err != nil {
		if strings.Contains(err.Error(), "invalid employee ID format") {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Format d'ID invalide"})
			return
		}
		if strings.Contains(err.Error(), "current password is incorrect") {
			respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Mot de passe actuel incorrect"})
			return
		}
		if strings.Contains(err.Error(), "password must") {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "not found") {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": "Employé non trouvé"})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Échec du changement de mot de passe"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Mot de passe changé avec succès"})
}

// DeleteEmployee handles DELETE /api/v1/employees/{id}
func (h *EmployeeHandler) DeleteEmployee(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/employees/")

	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)

	err := h.employeeService.DeleteEmployee(r.Context(), id, user.ID)
	if err != nil {
		if strings.Contains(err.Error(), "invalid employee ID format") {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Format d'ID invalide"})
			return
		}
		if strings.Contains(err.Error(), "not found") {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": "Employé non trouvé"})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Échec de la suppression de l'employé"})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Employé supprimé avec succès"})
}
