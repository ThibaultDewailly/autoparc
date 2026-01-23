-- Drop administrative_employees table and related objects
DROP TRIGGER IF EXISTS update_administrative_employees_updated_at ON administrative_employees;
DROP TABLE IF EXISTS administrative_employees;
DROP FUNCTION IF EXISTS update_updated_at_column();
