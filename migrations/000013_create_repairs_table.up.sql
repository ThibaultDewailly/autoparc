-- Create repairs table
CREATE TABLE repairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    accident_id UUID REFERENCES accidents(id) ON DELETE SET NULL,
    garage_id UUID NOT NULL REFERENCES garages(id),
    repair_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    cost DECIMAL(10,2),
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    invoice_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES administrative_employees(id),
    CONSTRAINT check_repair_type CHECK (repair_type IN ('accident', 'maintenance', 'inspection')),
    CONSTRAINT check_repair_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT check_repair_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT check_repair_cost CHECK (cost IS NULL OR cost >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_repairs_car_id ON repairs(car_id);
CREATE INDEX idx_repairs_accident_id ON repairs(accident_id);
CREATE INDEX idx_repairs_garage_id ON repairs(garage_id);
CREATE INDEX idx_repairs_dates_status ON repairs(start_date, end_date, status);
CREATE INDEX idx_repairs_repair_type ON repairs(repair_type);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_repairs_created_by ON repairs(created_by);
CREATE INDEX idx_repairs_created_at ON repairs(created_at DESC);

-- Add comment to table
COMMENT ON TABLE repairs IS 'Stores vehicle repairs including accident-related and maintenance repairs';
