-- Seed data for initial setup

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
);

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
);
