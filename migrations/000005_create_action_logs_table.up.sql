-- Create action_logs table for audit logging
CREATE TABLE action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    performed_by UUID NOT NULL REFERENCES administrative_employees(id),
    changes JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX idx_action_logs_entity ON action_logs(entity_type, entity_id);
CREATE INDEX idx_action_logs_timestamp ON action_logs(timestamp);
CREATE INDEX idx_action_logs_performed_by ON action_logs(performed_by);
