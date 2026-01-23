package service

import (
	"context"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
)

// InsuranceService handles insurance company business logic
type InsuranceService struct {
	insuranceRepo *repository.InsuranceRepository
}

// NewInsuranceService creates a new insurance service
func NewInsuranceService(insuranceRepo *repository.InsuranceRepository) *InsuranceService {
	return &InsuranceService{
		insuranceRepo: insuranceRepo,
	}
}

// GetInsuranceCompanies retrieves all insurance companies
func (s *InsuranceService) GetInsuranceCompanies(ctx context.Context) ([]*models.InsuranceCompany, error) {
	return s.insuranceRepo.FindAll(ctx)
}
