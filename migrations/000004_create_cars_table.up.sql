-- Create cars table
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_plate VARCHAR(11) UNIQUE NOT NULL CHECK (license_plate ~ '^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$'),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    grey_card_number VARCHAR(100),
    insurance_company_id UUID REFERENCES insurance_companies(id),
    rental_start_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES administrative_employees(id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_cars_license_plate ON cars(license_plate);
CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_model ON cars(model);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_insurance_company_id ON cars(insurance_company_id);

-- Apply updated_at trigger to cars table
CREATE TRIGGER update_cars_updated_at
    BEFORE UPDATE ON cars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
