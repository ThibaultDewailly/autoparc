-- Create insurance_companies table
CREATE TABLE insurance_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    policy_number VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES administrative_employees(id)
);

-- Create index on name for faster lookups
CREATE INDEX idx_insurance_companies_name ON insurance_companies(name);

-- Apply updated_at trigger to insurance_companies table
CREATE TRIGGER update_insurance_companies_updated_at
    BEFORE UPDATE ON insurance_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
