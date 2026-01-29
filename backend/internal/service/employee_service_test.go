package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name    string
		email   string
		wantErr bool
	}{
		{"valid email", "test@example.com", false},
		{"valid email with subdomain", "user@mail.example.com", false},
		{"valid email with plus", "user+tag@example.com", false},
		{"empty email", "", true},
		{"invalid format - no @", "testexample.com", true},
		{"invalid format - no domain", "test@", true},
		{"invalid format - no TLD", "test@example", true},
		{"invalid format - spaces", "test @example.com", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateEmail(tt.email)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestValidatePasswordStrength(t *testing.T) {
	tests := []struct {
		name     string
		password string
		wantErr  bool
	}{
		{"valid strong password", "SecurePass123", false},
		{"valid with special chars", "Secure@Pass123!", false},
		{"too short", "Pass1", true},
		{"no uppercase", "password123", true},
		{"no lowercase", "PASSWORD123", true},
		{"no numbers", "PasswordSecure", true},
		{"empty password", "", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidatePasswordStrength(tt.password)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// Service tests require integration tests with database
// Skipping for now as services expect concrete repository types, not interfaces
