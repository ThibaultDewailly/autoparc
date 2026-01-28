DROP TRIGGER IF EXISTS update_car_operators_updated_at ON car_operators;
DROP INDEX IF EXISTS idx_operators_department;
DROP INDEX IF EXISTS idx_operators_is_active;
DROP INDEX IF EXISTS idx_operators_email;
DROP INDEX IF EXISTS idx_operators_name;
DROP INDEX IF EXISTS idx_operators_employee_number;
DROP TABLE IF EXISTS car_operators;
