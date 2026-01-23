package utils

import (
	"regexp"
	"strings"
)

var (
	// licensePlateRegex matches French license plate format: AA-123-BB
	licensePlateRegex = regexp.MustCompile(`^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$`)
	
	// emailRegex is a simple email validation regex
	emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
)

// ValidateLicensePlate validates French license plate format (AA-123-BB)
func ValidateLicensePlate(plate string) bool {
	// Convert to uppercase for validation
	plate = strings.ToUpper(strings.TrimSpace(plate))
	return licensePlateRegex.MatchString(plate)
}

// ValidateEmail validates email format
func ValidateEmail(email string) bool {
	email = strings.TrimSpace(email)
	return emailRegex.MatchString(email)
}

// ValidateRequired checks if a string value is not empty
func ValidateRequired(value string) bool {
	return strings.TrimSpace(value) != ""
}

// NormalizeLicensePlate normalizes license plate to uppercase format
func NormalizeLicensePlate(plate string) string {
	return strings.ToUpper(strings.TrimSpace(plate))
}
