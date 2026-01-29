package models

import (
	"errors"
	"strings"
	"time"
)

// AccidentPhoto represents a photo of an accident
type AccidentPhoto struct {
	ID              string    `json:"id"`
	AccidentID      string    `json:"accidentId"`
	Filename        string    `json:"filename"`
	FileData        []byte    `json:"-"` // Not included in JSON
	FileSize        int       `json:"fileSize"`
	MimeType        string    `json:"mimeType"`
	CompressionType string    `json:"compressionType"`
	Description     *string   `json:"description,omitempty"`
	UploadedAt      time.Time `json:"uploadedAt"`
	UploadedBy      *string   `json:"uploadedBy,omitempty"`
}

// AccidentPhotoMetadata represents photo metadata without binary data
type AccidentPhotoMetadata struct {
	ID              string    `json:"id"`
	AccidentID      string    `json:"accidentId"`
	Filename        string    `json:"filename"`
	FileSize        int       `json:"fileSize"`
	MimeType        string    `json:"mimeType"`
	CompressionType string    `json:"compressionType"`
	Description     *string   `json:"description,omitempty"`
	UploadedAt      time.Time `json:"uploadedAt"`
	UploadedBy      *string   `json:"uploadedBy,omitempty"`
}

// UploadPhotoRequest represents the request to upload a photo
type UploadPhotoRequest struct {
	AccidentID  string
	FileName    string
	FileSize    int
	MimeType    string
	FileData    []byte
	Description *string
}

const (
	MaxPhotoSize        = 5 * 1024 * 1024 // 5MB
	CompressionTypeGzip = "gzip"
)

var allowedMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/jpg":  true,
	"image/png":  true,
	"image/webp": true,
	"image/gif":  true,
}

// Validate validates the UploadPhotoRequest
func (r *UploadPhotoRequest) Validate() error {
	if r.AccidentID == "" {
		return errors.New("l'identifiant de l'accident est requis")
	}

	if r.FileData == nil || len(r.FileData) == 0 {
		return errors.New("le fichier est requis")
	}
	
	if r.FileSize > MaxPhotoSize {
		return errors.New("la taille du fichier ne peut pas dépasser 5MB")
	}
	
	if r.FileSize <= 0 {
		return errors.New("le fichier est vide")
	}
	
	// Validate MIME type
	if !allowedMimeTypes[r.MimeType] {
		return errors.New("type de fichier non supporté. Types acceptés: JPEG, PNG, WebP, GIF")
	}
	
	// Validate filename
	if r.FileName == "" {
		return errors.New("le nom du fichier est requis")
	}
	
	// Additional security check for file extension
	ext := strings.ToLower(r.FileName[strings.LastIndex(r.FileName, ".")+1:])
	if ext != "jpg" && ext != "jpeg" && ext != "png" && ext != "webp" && ext != "gif" {
		return errors.New("extension de fichier non supportée")
	}
	
	return nil
}

// IsValidMimeType checks if the MIME type is allowed
func IsValidMimeType(mimeType string) bool {
	return allowedMimeTypes[mimeType]
}
