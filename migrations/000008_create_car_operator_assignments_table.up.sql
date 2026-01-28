CREATE TABLE car_operator_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES car_operators(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES administrative_employees(id),
    
    -- Business rule: end_date must be >= start_date
    CONSTRAINT no_overlap_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Create indexes for relationship queries
CREATE INDEX idx_assignments_car ON car_operator_assignments(car_id, end_date);
CREATE INDEX idx_assignments_operator ON car_operator_assignments(operator_id, end_date);
CREATE INDEX idx_assignments_start_date ON car_operator_assignments(start_date);
CREATE INDEX idx_assignments_active ON car_operator_assignments(end_date) WHERE end_date IS NULL;

-- Business rule: one operator can have max 1 active assignment (end_date IS NULL)
-- Using partial unique index instead of EXCLUDE constraint for better compatibility
CREATE UNIQUE INDEX idx_unique_active_operator ON car_operator_assignments(operator_id) WHERE end_date IS NULL;

-- Business rule: one car can have max 1 active assignment (end_date IS NULL)
-- Using partial unique index instead of EXCLUDE constraint for better compatibility
CREATE UNIQUE INDEX idx_unique_active_car ON car_operator_assignments(car_id) WHERE end_date IS NULL;
