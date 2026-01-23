package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/goldenkiwi/autoparc/internal/models"
)

// InsuranceRepository handles database operations for insurance companies
type InsuranceRepository struct {
	db *sql.DB
}

// NewInsuranceRepository creates a new insurance repository
func NewInsuranceRepository(db *sql.DB) *InsuranceRepository {
	return &InsuranceRepository{db: db}
}

// FindAll retrieves all active insurance companies
func (r *InsuranceRepository) FindAll(ctx context.Context) ([]*models.InsuranceCompany, error) {
	query := `
		SELECT id, name, contact_person, phone, email, address, policy_number, 
		       is_active, created_at, updated_at, created_by
		FROM insurance_companies
		WHERE is_active = true
		ORDER BY name ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query insurance companies: %w", err)
	}
	defer rows.Close()

	var companies []*models.InsuranceCompany
	for rows.Next() {
		var company models.InsuranceCompany
		err := rows.Scan(
			&company.ID,
			&company.Name,
			&company.ContactPerson,
			&company.Phone,
			&company.Email,
			&company.Address,
			&company.PolicyNumber,
			&company.IsActive,
			&company.CreatedAt,
			&company.UpdatedAt,
			&company.CreatedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan insurance company: %w", err)
		}
		companies = append(companies, &company)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating insurance companies: %w", err)
	}

	return companies, nil
}

// FindByID retrieves an insurance company by ID
func (r *InsuranceRepository) FindByID(ctx context.Context, id string) (*models.InsuranceCompany, error) {
	query := `
		SELECT id, name, contact_person, phone, email, address, policy_number, 
		       is_active, created_at, updated_at, created_by
		FROM insurance_companies
		WHERE id = $1 AND is_active = true
	`

	var company models.InsuranceCompany
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&company.ID,
		&company.Name,
		&company.ContactPerson,
		&company.Phone,
		&company.Email,
		&company.Address,
		&company.PolicyNumber,
		&company.IsActive,
		&company.CreatedAt,
		&company.UpdatedAt,
		&company.CreatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("insurance company not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find insurance company: %w", err)
	}

	return &company, nil
}
