-- Drop indexes
DROP INDEX IF EXISTS idx_repairs_created_at;
DROP INDEX IF EXISTS idx_repairs_created_by;
DROP INDEX IF EXISTS idx_repairs_status;
DROP INDEX IF EXISTS idx_repairs_repair_type;
DROP INDEX IF EXISTS idx_repairs_dates_status;
DROP INDEX IF EXISTS idx_repairs_garage_id;
DROP INDEX IF EXISTS idx_repairs_accident_id;
DROP INDEX IF EXISTS idx_repairs_car_id;

-- Drop table
DROP TABLE IF EXISTS repairs;
