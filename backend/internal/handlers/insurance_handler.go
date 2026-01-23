package handlers

import (
	"net/http"

	"github.com/goldenkiwi/autoparc/internal/service"
)

// InsuranceHandler handles insurance company-related HTTP requests
type InsuranceHandler struct {
	insuranceService *service.InsuranceService
}

// NewInsuranceHandler creates a new insurance handler
func NewInsuranceHandler(insuranceService *service.InsuranceService) *InsuranceHandler {
	return &InsuranceHandler{
		insuranceService: insuranceService,
	}
}

// GetInsuranceCompanies handles GET /api/v1/insurance-companies
func (h *InsuranceHandler) GetInsuranceCompanies(w http.ResponseWriter, r *http.Request) {
	companies, err := h.insuranceService.GetInsuranceCompanies(r.Context())
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve insurance companies"})
		return
	}

	respondJSON(w, http.StatusOK, companies)
}
