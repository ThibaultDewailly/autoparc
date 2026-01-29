-- Create accident_photos table
CREATE TABLE accident_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accident_id UUID NOT NULL REFERENCES accidents(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_data BYTEA NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    compression_type VARCHAR(50) DEFAULT 'gzip',
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES administrative_employees(id),
    CONSTRAINT check_file_size CHECK (file_size > 0),
    CONSTRAINT check_mime_type CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'))
);

-- Create indexes for performance
CREATE INDEX idx_accident_photos_accident_id ON accident_photos(accident_id);
CREATE INDEX idx_accident_photos_uploaded_by ON accident_photos(uploaded_by);
CREATE INDEX idx_accident_photos_uploaded_at ON accident_photos(uploaded_at DESC);

-- Add comment to table
COMMENT ON TABLE accident_photos IS 'Stores photos of accidents with gzip compression in BYTEA format';
