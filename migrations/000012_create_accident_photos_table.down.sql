-- Drop indexes
DROP INDEX IF EXISTS idx_accident_photos_uploaded_at;
DROP INDEX IF EXISTS idx_accident_photos_uploaded_by;
DROP INDEX IF EXISTS idx_accident_photos_accident_id;

-- Drop table
DROP TABLE IF EXISTS accident_photos;
