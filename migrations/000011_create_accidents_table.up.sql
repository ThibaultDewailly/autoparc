-- Create accidents table
CREATE TABLE accidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    accident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    damages_description TEXT,
    responsible_party VARCHAR(200),
    police_report_number VARCHAR(100),
    insurance_claim_number VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'declared',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES administrative_employees(id),
    CONSTRAINT check_accident_status CHECK (status IN ('declared', 'under_review', 'approved', 'closed'))
);

-- Create indexes for performance
CREATE INDEX idx_accidents_car_id ON accidents(car_id);
CREATE INDEX idx_accidents_accident_date ON accidents(accident_date DESC);
CREATE INDEX idx_accidents_status ON accidents(status);
CREATE INDEX idx_accidents_created_by ON accidents(created_by);
CREATE INDEX idx_accidents_created_at ON accidents(created_at DESC);

-- Add comment to table
COMMENT ON TABLE accidents IS 'Stores vehicle accident records with details and status tracking';
