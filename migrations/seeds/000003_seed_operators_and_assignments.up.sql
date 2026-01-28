-- Insert test operators
INSERT INTO car_operators (id, employee_number, first_name, last_name, email, phone, department, is_active, created_by)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'EMP001', 'Jean', 'Dupont', 'jean.dupont@company.com', '+33612345678', 'Ventes', true, (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ('22222222-2222-2222-2222-222222222222', 'EMP002', 'Marie', 'Martin', 'marie.martin@company.com', '+33623456789', 'Marketing', true, (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ('33333333-3333-3333-3333-333333333333', 'EMP003', 'Pierre', 'Dubois', 'pierre.dubois@company.com', '+33634567890', 'IT', true, (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ('44444444-4444-4444-4444-444444444444', 'EMP004', 'Sophie', 'Leroy', 'sophie.leroy@company.com', '+33645678901', 'RH', true, (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ('55555555-5555-5555-5555-555555555555', 'EMP005', 'Luc', 'Bernard', 'luc.bernard@company.com', '+33656789012', 'Finance', false, (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com'));

-- Insert test assignments (some active, some historical)
INSERT INTO car_operator_assignments (car_id, operator_id, start_date, end_date, notes, created_by)
VALUES
    -- Active assignments
    ((SELECT id FROM cars LIMIT 1 OFFSET 0), '11111111-1111-1111-1111-111111111111', '2025-01-01', NULL, 'Attribution initiale', (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ((SELECT id FROM cars LIMIT 1 OFFSET 1), '22222222-2222-2222-2222-222222222222', '2025-06-15', NULL, 'Nouveau véhicule pour Marketing', (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    
    -- Historical assignments
    ((SELECT id FROM cars LIMIT 1 OFFSET 0), '33333333-3333-3333-3333-333333333333', '2024-01-01', '2024-12-31', 'Ancienne attribution', (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ((SELECT id FROM cars LIMIT 1 OFFSET 2), '44444444-4444-4444-4444-444444444444', '2024-06-01', '2025-05-31', 'Attribution temporaire', (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com'));
