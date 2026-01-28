CREATE TABLE car_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    department VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES administrative_employees(id)
);

-- Create indexes for search and performance
CREATE INDEX idx_operators_employee_number ON car_operators(employee_number);
CREATE INDEX idx_operators_name ON car_operators(last_name, first_name);
CREATE INDEX idx_operators_email ON car_operators(email);
CREATE INDEX idx_operators_is_active ON car_operators(is_active);
CREATE INDEX idx_operators_department ON car_operators(department);

-- Create trigger for updated_at
CREATE TRIGGER update_car_operators_updated_at
    BEFORE UPDATE ON car_operators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
