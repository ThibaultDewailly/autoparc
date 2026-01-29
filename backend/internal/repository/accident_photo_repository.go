package repository

import (
	"bytes"
	"compress/gzip"
	"context"
	"database/sql"
	"fmt"
	"io"

	"github.com/goldenkiwi/autoparc/internal/models"
)

// AccidentPhotoRepository handles database operations for accident photos
type AccidentPhotoRepository struct {
	db *sql.DB
}

// NewAccidentPhotoRepository creates a new accident photo repository
func NewAccidentPhotoRepository(db *sql.DB) *AccidentPhotoRepository {
	return &AccidentPhotoRepository{db: db}
}

// Create creates a new accident photo with gzip compression
func (r *AccidentPhotoRepository) Create(ctx context.Context, photo *models.AccidentPhoto) error {
	// Compress the file data with gzip
	var compressed bytes.Buffer
	gzipWriter := gzip.NewWriter(&compressed)
	_, err := gzipWriter.Write(photo.FileData)
	if err != nil {
		return fmt.Errorf("échec de la compression de la photo: %w", err)
	}
	if err := gzipWriter.Close(); err != nil {
		return fmt.Errorf("échec de la fermeture du compresseur: %w", err)
	}

	query := `
		INSERT INTO accident_photos (id, accident_id, filename, file_data, file_size, 
		                             mime_type, compression_type, description, uploaded_at, uploaded_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err = r.db.ExecContext(
		ctx,
		query,
		photo.ID,
		photo.AccidentID,
		photo.Filename,
		compressed.Bytes(),
		photo.FileSize,
		photo.MimeType,
		models.CompressionTypeGzip,
		photo.Description,
		photo.UploadedAt,
		photo.UploadedBy,
	)

	if err != nil {
		return fmt.Errorf("échec de la création de la photo: %w", err)
	}

	return nil
}

// FindByID retrieves a photo by ID with decompression
func (r *AccidentPhotoRepository) FindByID(ctx context.Context, id string) (*models.AccidentPhoto, error) {
	query := `
		SELECT id, accident_id, filename, file_data, file_size, mime_type, 
		       compression_type, description, uploaded_at, uploaded_by
		FROM accident_photos
		WHERE id = $1
	`

	var photo models.AccidentPhoto
	var compressedData []byte
	
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&photo.ID,
		&photo.AccidentID,
		&photo.Filename,
		&compressedData,
		&photo.FileSize,
		&photo.MimeType,
		&photo.CompressionType,
		&photo.Description,
		&photo.UploadedAt,
		&photo.UploadedBy,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("photo non trouvée")
	}
	if err != nil {
		return nil, fmt.Errorf("échec de la recherche de la photo: %w", err)
	}

	// Decompress the data
	if photo.CompressionType == models.CompressionTypeGzip {
		reader, err := gzip.NewReader(bytes.NewReader(compressedData))
		if err != nil {
			return nil, fmt.Errorf("échec de la décompression de la photo: %w", err)
		}
		defer reader.Close()

		decompressed, err := io.ReadAll(reader)
		if err != nil {
			return nil, fmt.Errorf("échec de la lecture de la photo décompressée: %w", err)
		}
		photo.FileData = decompressed
	} else {
		photo.FileData = compressedData
	}

	return &photo, nil
}

// FindByAccidentID retrieves all photos for an accident (metadata only)
func (r *AccidentPhotoRepository) FindByAccidentID(ctx context.Context, accidentID string) ([]*models.AccidentPhotoMetadata, error) {
	query := `
		SELECT id, accident_id, filename, file_size, mime_type, 
		       compression_type, description, uploaded_at, uploaded_by
		FROM accident_photos
		WHERE accident_id = $1
		ORDER BY uploaded_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, accidentID)
	if err != nil {
		return nil, fmt.Errorf("échec de la recherche des photos: %w", err)
	}
	defer rows.Close()

	var photos []*models.AccidentPhotoMetadata
	for rows.Next() {
		var photo models.AccidentPhotoMetadata
		err := rows.Scan(
			&photo.ID,
			&photo.AccidentID,
			&photo.Filename,
			&photo.FileSize,
			&photo.MimeType,
			&photo.CompressionType,
			&photo.Description,
			&photo.UploadedAt,
			&photo.UploadedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("échec du scan de la photo: %w", err)
		}
		photos = append(photos, &photo)
	}

	return photos, nil
}

// Delete deletes a photo
func (r *AccidentPhotoRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM accident_photos WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("échec de la suppression de la photo: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("échec de la vérification des lignes affectées: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("photo non trouvée")
	}

	return nil
}
