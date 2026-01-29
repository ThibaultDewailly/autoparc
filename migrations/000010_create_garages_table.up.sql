-- Create garages table
CREATE TABLE garages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    specialization VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES administrative_employees(id)
);

-- Create indexes for performance
CREATE INDEX idx_garages_is_active ON garages(is_active);
CREATE INDEX idx_garages_name ON garages(name);
CREATE INDEX idx_garages_created_by ON garages(created_by);

-- Add comment to table
COMMENT ON TABLE garages IS 'Stores information about repair garages and service providers';
