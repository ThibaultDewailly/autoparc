package service

import (
	"testing"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/stretchr/testify/assert"
)

// Service tests for validation logic that doesn't require database

func TestCreateGarageRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		req     *models.CreateGarageRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid request",
			req: &models.CreateGarageRequest{
				Name:    "Test Garage",
				Phone:   "0123456789",
				Address: "123 Test St",
			},
			wantErr: false,
		},
		{
			name: "missing name",
			req: &models.CreateGarageRequest{
				Phone:   "0123456789",
				Address: "123 Test St",
			},
			wantErr: true,
			errMsg:  "le nom est requis",
		},
		{
			name: "missing phone",
			req: &models.CreateGarageRequest{
				Name:    "Test Garage",
				Address: "123 Test St",
			},
			wantErr: true,
			errMsg:  "le téléphone est requis",
		},
		{
			name: "missing address",
			req: &models.CreateGarageRequest{
				Name:  "Test Garage",
				Phone: "0123456789",
			},
			wantErr: true,
			errMsg:  "l'adresse est requise",
		},
		{
			name: "invalid email format",
			req: &models.CreateGarageRequest{
				Name:    "Test Garage",
				Phone:   "0123456789",
				Address: "123 Test St",
				Email:   stringPtr("invalid-email"),
			},
			wantErr: true,
			errMsg:  "format d'email invalide",
		},
		{
			name: "valid email format",
			req: &models.CreateGarageRequest{
				Name:    "Test Garage",
				Phone:   "0123456789",
				Address: "123 Test St",
				Email:   stringPtr("valid@garage.com"),
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.req.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestUpdateGarageRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		req     *models.UpdateGarageRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid update with name",
			req: &models.UpdateGarageRequest{
				Name: stringPtr("Updated Garage"),
			},
			wantErr: false,
		},
		{
			name: "valid update with email",
			req: &models.UpdateGarageRequest{
				Email: stringPtr("new@garage.com"),
			},
			wantErr: false,
		},
		{
			name: "invalid email format",
			req: &models.UpdateGarageRequest{
				Email: stringPtr("invalid-email"),
			},
			wantErr: true,
			errMsg:  "format d'email invalide",
		},
		{
			name:    "empty update",
			req:     &models.UpdateGarageRequest{},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.req.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// Helper function
func stringPtr(s string) *string {
	return &s
}
