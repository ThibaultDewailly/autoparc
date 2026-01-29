-- Drop indexes
DROP INDEX IF EXISTS idx_accidents_created_at;
DROP INDEX IF EXISTS idx_accidents_created_by;
DROP INDEX IF EXISTS idx_accidents_status;
DROP INDEX IF EXISTS idx_accidents_accident_date;
DROP INDEX IF EXISTS idx_accidents_car_id;

-- Drop table
DROP TABLE IF EXISTS accidents;
