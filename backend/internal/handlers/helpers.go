package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
)

// respondJSON sends a JSON response with the specified status code
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// parseIntQuery parses an integer from a query parameter with a default value
func parseIntQuery(value string, defaultValue int) int {
	if value == "" {
		return defaultValue
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return defaultValue
	}
	return parsed
}
