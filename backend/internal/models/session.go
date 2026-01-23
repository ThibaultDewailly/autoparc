package models

import (
	"time"
)

// Session represents a user session
type Session struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	SessionToken string    `json:"-"` // Never expose token in JSON
	ExpiresAt    time.Time `json:"expiresAt"`
	IPAddress    string    `json:"ipAddress"`
	UserAgent    string    `json:"userAgent"`
	CreatedAt    time.Time `json:"createdAt"`
}
