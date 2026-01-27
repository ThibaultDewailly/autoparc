-- Add index on is_active for faster filtering of active/inactive employees
CREATE INDEX IF NOT EXISTS idx_administrative_employees_is_active ON administrative_employees(is_active);
