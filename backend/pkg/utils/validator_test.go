package utils

import (
	"testing"
)

func TestValidateLicensePlate(t *testing.T) {
	tests := []struct {
		name  string
		plate string
		want  bool
	}{
		{
			name:  "valid plate",
			plate: "AA-123-BB",
			want:  true,
		},
		{
			name:  "valid plate different letters",
			plate: "XY-999-ZZ",
			want:  true,
		},
		{
			name:  "lowercase should pass (normalized to uppercase)",
			plate: "aa-123-bb",
			want:  true,
		},
		{
			name:  "mixed case should pass",
			plate: "Aa-123-Bb",
			want:  true,
		},
		{
			name:  "invalid format - no dashes",
			plate: "AA123BB",
			want:  false,
		},
		{
			name:  "invalid format - wrong position of dashes",
			plate: "AA-12-3BB",
			want:  false,
		},
		{
			name:  "invalid format - too many letters",
			plate: "AAA-123-BB",
			want:  false,
		},
		{
			name:  "invalid format - too few letters",
			plate: "A-123-BB",
			want:  false,
		},
		{
			name:  "invalid format - too many digits",
			plate: "AA-1234-BB",
			want:  false,
		},
		{
			name:  "invalid format - too few digits",
			plate: "AA-12-BB",
			want:  false,
		},
		{
			name:  "invalid format - letters instead of numbers",
			plate: "AA-ABC-BB",
			want:  false,
		},
		{
			name:  "invalid format - numbers instead of letters",
			plate: "12-123-34",
			want:  false,
		},
		{
			name:  "empty plate",
			plate: "",
			want:  false,
		},
		{
			name:  "plate with spaces",
			plate: "AA -123- BB",
			want:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ValidateLicensePlate(tt.plate)
			if got != tt.want {
				t.Errorf("ValidateLicensePlate(%q) = %v, want %v", tt.plate, got, tt.want)
			}
		})
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name  string
		email string
		want  bool
	}{
		{
			name:  "valid email",
			email: "user@example.com",
			want:  true,
		},
		{
			name:  "valid email with subdomain",
			email: "user@mail.example.com",
			want:  true,
		},
		{
			name:  "valid email with plus",
			email: "user+tag@example.com",
			want:  true,
		},
		{
			name:  "valid email with dots",
			email: "first.last@example.com",
			want:  true,
		},
		{
			name:  "valid email with dash",
			email: "user-name@example.com",
			want:  true,
		},
		{
			name:  "invalid email - no @",
			email: "userexample.com",
			want:  false,
		},
		{
			name:  "invalid email - no domain",
			email: "user@",
			want:  false,
		},
		{
			name:  "invalid email - no local part",
			email: "@example.com",
			want:  false,
		},
		{
			name:  "invalid email - no TLD",
			email: "user@example",
			want:  false,
		},
		{
			name:  "invalid email - spaces",
			email: "user @example.com",
			want:  false,
		},
		{
			name:  "empty email",
			email: "",
			want:  false,
		},
		{
			name:  "invalid email - multiple @",
			email: "user@@example.com",
			want:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ValidateEmail(tt.email)
			if got != tt.want {
				t.Errorf("ValidateEmail(%q) = %v, want %v", tt.email, got, tt.want)
			}
		})
	}
}

func TestValidateRequired(t *testing.T) {
	tests := []struct {
		name  string
		value string
		want  bool
	}{
		{
			name:  "non-empty string",
			value: "test",
			want:  true,
		},
		{
			name:  "empty string",
			value: "",
			want:  false,
		},
		{
			name:  "only spaces",
			value: "   ",
			want:  false,
		},
		{
			name:  "string with spaces but content",
			value: "  test  ",
			want:  true,
		},
		{
			name:  "single character",
			value: "a",
			want:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ValidateRequired(tt.value)
			if got != tt.want {
				t.Errorf("ValidateRequired(%q) = %v, want %v", tt.value, got, tt.want)
			}
		})
	}
}

func TestNormalizeLicensePlate(t *testing.T) {
	tests := []struct {
		name  string
		plate string
		want  string
	}{
		{
			name:  "lowercase to uppercase",
			plate: "aa-123-bb",
			want:  "AA-123-BB",
		},
		{
			name:  "mixed case to uppercase",
			plate: "Aa-123-Bb",
			want:  "AA-123-BB",
		},
		{
			name:  "already uppercase",
			plate: "AA-123-BB",
			want:  "AA-123-BB",
		},
		{
			name:  "with leading/trailing spaces",
			plate: "  aa-123-bb  ",
			want:  "AA-123-BB",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NormalizeLicensePlate(tt.plate)
			if got != tt.want {
				t.Errorf("NormalizeLicensePlate(%q) = %q, want %q", tt.plate, got, tt.want)
			}
		})
	}
}
