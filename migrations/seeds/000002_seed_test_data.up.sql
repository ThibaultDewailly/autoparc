-- Seed data for initial setup and testing

-- Insert default admin user
-- Email: admin@autoparc.fr
-- Password: Admin123!
INSERT INTO administrative_employees (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@autoparc.fr',
    '$2a$10$gWHp5Rv9kycbLXnBDVV4ke1hb6LckeiXSqPzhY5LxXicsafvUwklK',
    'Admin',
    'System',
    'admin',
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample insurance companies
INSERT INTO insurance_companies (
    id,
    name,
    contact_person,
    phone,
    email,
    address,
    policy_number,
    is_active,
    created_by
) VALUES 
(
    '00000000-0000-0000-0000-000000000101',
    'Assurance Générale de France',
    'Jean Dupont',
    '01 23 45 67 89',
    'contact@agf.fr',
    '123 Avenue des Champs-Élysées, 75008 Paris',
    'AGF-2024-001',
    true,
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000102',
    'Allianz France',
    'Marie Martin',
    '01 98 76 54 32',
    'service.client@allianz.fr',
    '87 Rue de Richelieu, 75002 Paris',
    'ALZ-2024-002',
    true,
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000103',
    'AXA Assurances',
    'Pierre Dubois',
    '01 45 67 89 01',
    'auto@axa.fr',
    '313 Terrasses de l''Arche, 92000 Nanterre',
    'AXA-2024-003',
    true,
    '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample cars for testing
INSERT INTO cars (
    id,
    license_plate,
    brand,
    model,
    grey_card_number,
    insurance_company_id,
    rental_start_date,
    status,
    created_at,
    updated_at,
    created_by
) VALUES 
(
    '00000000-0000-0000-0000-000000000201',
    'AA-123-BB',
    'Renault',
    'Clio',
    'GC123456789',
    '00000000-0000-0000-0000-000000000101',
    '2024-01-15T00:00:00Z',
    'active',
    NOW(),
    NOW(),
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000202',
    'BB-456-CC',
    'Peugeot',
    '308',
    'GC987654321',
    '00000000-0000-0000-0000-000000000102',
    '2024-02-20T00:00:00Z',
    'active',
    NOW(),
    NOW(),
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000203',
    'CC-789-DD',
    'Citroën',
    'C3',
    'GC456789123',
    '00000000-0000-0000-0000-000000000103',
    '2024-03-10T00:00:00Z',
    'maintenance',
    NOW(),
    NOW(),
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000204',
    'DD-321-EE',
    'Renault',
    'Megane',
    'GC789456123',
    '00000000-0000-0000-0000-000000000101',
    '2023-12-01T00:00:00Z',
    'active',
    NOW(),
    NOW(),
    '00000000-0000-0000-0000-000000000001'
),
(
    '00000000-0000-0000-0000-000000000205',
    'EE-654-FF',
    'Peugeot',
    '2008',
    'GC321654987',
    '00000000-0000-0000-0000-000000000102',
    '2024-01-05T00:00:00Z',
    'retired',
    NOW(),
    NOW(),
    '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;
