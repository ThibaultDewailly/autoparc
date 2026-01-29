package handlers

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/goldenkiwi/autoparc/internal/middleware"
	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/google/uuid"
)

type AccidentHandler struct {
	accidentRepo      *repository.AccidentRepository
	accidentPhotoRepo *repository.AccidentPhotoRepository
}

func NewAccidentHandler(accidentRepo *repository.AccidentRepository, accidentPhotoRepo *repository.AccidentPhotoRepository) *AccidentHandler {
	return &AccidentHandler{
		accidentRepo:      accidentRepo,
		accidentPhotoRepo: accidentPhotoRepo,
	}
}

// ListAccidents handles GET /api/v1/accidents
func (h *AccidentHandler) ListAccidents(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Parse query parameters
	query := r.URL.Query()
	filters := make(map[string]interface{})

	if search := query.Get("search"); search != "" {
		filters["search"] = search
	}

	if carID := query.Get("car_id"); carID != "" {
		filters["car_id"] = carID
	}

	if status := query.Get("status"); status != "" {
		filters["status"] = status
	}

	if page := query.Get("page"); page != "" {
		filters["page"] = page
	}

	if limit := query.Get("limit"); limit != "" {
		filters["limit"] = limit
	}

	// Get accidents from repository
	accidents, err := h.accidentRepo.FindAll(ctx, filters)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve accidents",
		})
		return
	}

	respondJSON(w, http.StatusOK, accidents)
}

// GetAccident handles GET /api/v1/accidents/{id}
func (h *AccidentHandler) GetAccident(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := extractIDFromPath(r.URL.Path, "/api/v1/accidents/")

	accident, err := h.accidentRepo.FindByID(ctx, id)
	if err != nil {
		if err.Error() == "accident not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Accident not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve accident",
		})
		return
	}

	respondJSON(w, http.StatusOK, accident)
}

// CreateAccident handles POST /api/v1/accidents
func (h *AccidentHandler) CreateAccident(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req models.CreateAccidentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
		return
	}

	// Get user from context
	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)
	userID := user.ID

	// Create accident
	accident := &models.Accident{
		CarID:                req.CarID,
		AccidentDate:         req.AccidentDate,
		Location:             req.Location,
		Description:          req.Description,
		DamagesDescription:   req.DamagesDescription,
		ResponsibleParty:     req.ResponsibleParty,
		PoliceReportNumber:   req.PoliceReportNumber,
		InsuranceClaimNumber: req.InsuranceClaimNumber,
		Status:               models.AccidentStatusDeclared,
		CreatedBy:            &userID,
	}

	if err := h.accidentRepo.Create(ctx, accident); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to create accident",
		})
		return
	}

	respondJSON(w, http.StatusCreated, accident)
}

// UpdateAccident handles PUT /api/v1/accidents/{id}
func (h *AccidentHandler) UpdateAccident(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := extractIDFromPath(r.URL.Path, "/api/v1/accidents/")

	var req models.UpdateAccidentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
		return
	}

	// Check if accident exists
	_, err := h.accidentRepo.FindByID(ctx, id)
	if err != nil {
		if err.Error() == "accident not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Accident not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve accident",
		})
		return
	}

	// Build updates map
	updates := make(map[string]interface{})

	if req.Location != nil {
		updates["location"] = *req.Location
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.DamagesDescription != nil {
		updates["damages_description"] = *req.DamagesDescription
	}
	if req.ResponsibleParty != nil {
		updates["responsible_party"] = *req.ResponsibleParty
	}
	if req.PoliceReportNumber != nil {
		updates["police_report_number"] = *req.PoliceReportNumber
	}
	if req.InsuranceClaimNumber != nil {
		updates["insurance_claim_number"] = *req.InsuranceClaimNumber
	}

	// Update accident
	if err := h.accidentRepo.Update(ctx, id, updates); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to update accident",
		})
		return
	}

	// Retrieve updated accident
	accident, err := h.accidentRepo.FindByID(ctx, id)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve updated accident",
		})
		return
	}

	respondJSON(w, http.StatusOK, accident)
}

// DeleteAccident handles DELETE /api/v1/accidents/{id}
func (h *AccidentHandler) DeleteAccident(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := extractIDFromPath(r.URL.Path, "/api/v1/accidents/")

	// Check if accident exists
	_, err := h.accidentRepo.FindByID(ctx, id)
	if err != nil {
		if err.Error() == "accident not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Accident not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve accident",
		})
		return
	}

	// Delete accident
	if err := h.accidentRepo.Delete(ctx, id); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to delete accident",
		})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Accident deleted successfully",
	})
}

// UpdateAccidentStatus handles PATCH /api/v1/accidents/{id}/status
func (h *AccidentHandler) UpdateAccidentStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := extractIDFromPath(r.URL.Path, "/api/v1/accidents/")

	var req models.UpdateAccidentStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
		return
	}

	// Check if accident exists
	_, err := h.accidentRepo.FindByID(ctx, id)
	if err != nil {
		if err.Error() == "accident not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Accident not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve accident",
		})
		return
	}

	// Update status
	if err := h.accidentRepo.UpdateStatus(ctx, id, req.Status); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to update accident status",
		})
		return
	}

	// Retrieve updated accident
	accident, err := h.accidentRepo.FindByID(ctx, id)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve updated accident",
		})
		return
	}

	respondJSON(w, http.StatusOK, accident)
}

// UploadPhoto handles POST /api/v1/accidents/{id}/photos
func (h *AccidentHandler) UploadPhoto(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	accidentID := extractIDFromPath(r.URL.Path, "/api/v1/accidents/")

	// Check if accident exists
	_, err := h.accidentRepo.FindByID(ctx, accidentID)
	if err != nil {
		if err.Error() == "accident not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Accident not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve accident",
		})
		return
	}

	// Parse multipart form (max 10MB)
	err = r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Failed to parse multipart form",
		})
		return
	}

	// Get file from request
	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "No file provided",
		})
		return
	}
	defer file.Close()

	// Validate file size (max 10MB)
	if fileHeader.Size > 10*1024*1024 {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "File size exceeds maximum allowed (10MB)",
		})
		return
	}

	// Validate MIME type
	validMimeTypes := []string{"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"}
	mimeType := fileHeader.Header.Get("Content-Type")
	isValid := false
	for _, validType := range validMimeTypes {
		if strings.EqualFold(mimeType, validType) {
			isValid = true
			break
		}
	}
	if !isValid {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Invalid file type. Only images are allowed",
		})
		return
	}

	// Read file data
	fileData, err := io.ReadAll(file)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to read file",
		})
		return
	}

	// Compress data with gzip
	var buf bytes.Buffer
	gzipWriter := gzip.NewWriter(&buf)
	_, err = gzipWriter.Write(fileData)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to compress file",
		})
		return
	}
	gzipWriter.Close()

	// Get user from context
	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)
	userID := user.ID

	// Get description from form
	description := r.FormValue("description")

	// Create photo record
	photo := &models.AccidentPhoto{
		ID:              uuid.New().String(),
		AccidentID:      accidentID,
		Filename:        fileHeader.Filename,
		FileData:        buf.Bytes(),
		FileSize:        int(fileHeader.Size),
		MimeType:        mimeType,
		CompressionType: "gzip",
		Description:     stringPtr(description),
		UploadedBy:      &userID,
	}

	if err := h.accidentPhotoRepo.Create(ctx, photo); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to save photo",
		})
		return
	}

	// Return photo metadata (without file data)
	response := map[string]interface{}{
		"id":          photo.ID,
		"accident_id": photo.AccidentID,
		"filename":    photo.Filename,
		"file_size":   photo.FileSize,
		"mime_type":   photo.MimeType,
		"description": photo.Description,
		"uploaded_at": photo.UploadedAt,
	}

	respondJSON(w, http.StatusCreated, response)
}

// GetPhotos handles GET /api/v1/accidents/{id}/photos
func (h *AccidentHandler) GetPhotos(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	accidentID := extractIDFromPath(r.URL.Path, "/api/v1/accidents/")

	// Check if accident exists
	_, err := h.accidentRepo.FindByID(ctx, accidentID)
	if err != nil {
		if err.Error() == "accident not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Accident not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve accident",
		})
		return
	}

	// Get photos metadata (without file data)
	photos, err := h.accidentPhotoRepo.FindByAccidentID(ctx, accidentID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve photos",
		})
		return
	}

	respondJSON(w, http.StatusOK, photos)
}

// GetPhoto handles GET /api/v1/accidents/{id}/photos/{photo_id}
func (h *AccidentHandler) GetPhoto(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Extract photo ID from path like /api/v1/accidents/{id}/photos/{photo_id}
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/accidents/"), "/")
	if len(parts) < 3 {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Invalid URL",
		})
		return
	}
	photoID := parts[2]

	// Get photo with data
	photo, err := h.accidentPhotoRepo.FindByID(ctx, photoID)
	if err != nil {
		if err.Error() == "photo not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Photo not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve photo",
		})
		return
	}

	// Decompress data if compressed
	var fileData []byte
	if photo.CompressionType == "gzip" {
		reader, err := gzip.NewReader(bytes.NewReader(photo.FileData))
		if err != nil {
			respondJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Failed to decompress photo",
			})
			return
		}
		defer reader.Close()

		fileData, err = io.ReadAll(reader)
		if err != nil {
			respondJSON(w, http.StatusInternalServerError, map[string]string{
				"error": "Failed to read decompressed photo",
			})
			return
		}
	} else {
		fileData = photo.FileData
	}

	// Set appropriate headers
	w.Header().Set("Content-Type", photo.MimeType)
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=\"%s\"", photo.Filename))
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(fileData)))
	w.WriteHeader(http.StatusOK)
	w.Write(fileData)
}

// DeletePhoto handles DELETE /api/v1/accidents/{id}/photos/{photo_id}
func (h *AccidentHandler) DeletePhoto(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Extract photo ID from path
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/accidents/"), "/")
	if len(parts) < 3 {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "Invalid URL",
		})
		return
	}
	photoID := parts[2]

	// Check if photo exists
	_, err := h.accidentPhotoRepo.FindByID(ctx, photoID)
	if err != nil {
		if err.Error() == "photo not found" {
			respondJSON(w, http.StatusNotFound, map[string]string{
				"error": "Photo not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve photo",
		})
		return
	}

	// Delete photo
	if err := h.accidentPhotoRepo.Delete(ctx, photoID); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Failed to delete photo",
		})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "Photo deleted successfully",
	})
}

// Helper functions
func extractIDFromPath(path, prefix string) string {
	id := strings.TrimPrefix(path, prefix)
	parts := strings.Split(id, "/")
	return parts[0]
}

func stringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
