-- Seed data for repairs table
-- Note: Using hardcoded UUIDs for consistency in test/dev environments
-- Includes both accident-related repairs and standalone maintenance

INSERT INTO repairs (id, car_id, accident_id, garage_id, repair_type, description, start_date, end_date, cost, status, invoice_number, notes, created_by)
VALUES
    -- Repair 1: Completed accident repair (Accident 1)
    (
        'c0000001-0000-0000-0000-000000000001',
        (SELECT car_id FROM accidents WHERE id = 'b0000001-0000-0000-0000-000000000001'),
        'b0000001-0000-0000-0000-000000000001',
        'a0000001-0000-0000-0000-000000000002', -- Carrosserie Moderne
        'accident',
        'Réparation suite collision arrière: remplacement pare-chocs, feu arrière, débosselage coffre, peinture',
        '2025-11-20',
        '2025-11-27',
        2850.00,
        'completed',
        'INV-2025-1127-CM-001',
        'Réparation prise en charge par assurance. Pièces d''origine.',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Repair 2: In progress accident repair (Accident 3)
    (
        'c0000001-0000-0000-0000-000000000002',
        (SELECT car_id FROM accidents WHERE id = 'b0000001-0000-0000-0000-000000000003'),
        'b0000001-0000-0000-0000-000000000003',
        'a0000001-0000-0000-0000-000000000001', -- Garage Central Auto
        'accident',
        'Réparation collision latérale: remplacement portière avant gauche, rétroviseur, aile, peinture',
        '2026-01-15',
        NULL,
        3400.00,
        'in_progress',
        NULL,
        'Attente livraison portière. Délai prévu 2 semaines.',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Repair 3: Completed accident repair (Accident 4 - windshield)
    (
        'c0000001-0000-0000-0000-000000000003',
        (SELECT car_id FROM accidents WHERE id = 'b0000001-0000-0000-0000-000000000004'),
        'b0000001-0000-0000-0000-000000000004',
        'a0000001-0000-0000-0000-000000000010', -- Vitrage Auto Plus
        'accident',
        'Remplacement pare-brise suite vandalisme',
        '2025-09-10',
        '2025-09-10',
        450.00,
        'completed',
        'INV-2025-0910-VAP-001',
        'Intervention rapide le jour même. Pare-brise d''origine constructeur.',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Repair 4: Scheduled maintenance
    (
        'c0000001-0000-0000-0000-000000000004',
        (SELECT id FROM cars WHERE license_plate = 'AA-123-BB' LIMIT 1),
        NULL,
        'a0000001-0000-0000-0000-000000000004', -- Rapide Auto Service
        'maintenance',
        'Révision périodique 30 000 km: vidange, filtres, contrôle freins, pneumatiques',
        '2026-02-05',
        NULL,
        NULL,
        'scheduled',
        NULL,
        'Rendez-vous programmé à 9h00',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Repair 5: Completed maintenance
    (
        'c0000001-0000-0000-0000-000000000005',
        (SELECT id FROM cars WHERE license_plate = 'BB-456-CC' LIMIT 1),
        NULL,
        'a0000001-0000-0000-0000-000000000003', -- Mécanique Pro Services
        'maintenance',
        'Remplacement plaquettes et disques de frein avant',
        '2025-12-10',
        '2025-12-10',
        380.00,
        'completed',
        'INV-2025-1210-MPS-001',
        'Usure importante détectée lors du contrôle. Remplacement préventif.',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Repair 6: In progress maintenance
    (
        'c0000001-0000-0000-0000-000000000006',
        (SELECT id FROM cars WHERE license_plate = 'CC-789-DD' LIMIT 1),
        NULL,
        'a0000001-0000-0000-0000-000000000008', -- Diesel Expert
        'maintenance',
        'Nettoyage vanne EGR et remplacement filtre à particules',
        '2026-01-27',
        NULL,
        650.00,
        'in_progress',
        NULL,
        'Véhicule en atelier. Fin prévue demain.',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Repair 7: Completed inspection
    (
        'c0000001-0000-0000-0000-000000000007',
        (SELECT id FROM cars WHERE license_plate = 'DD-321-EE' LIMIT 1),
        NULL,
        'a0000001-0000-0000-0000-000000000001', -- Garage Central Auto
        'inspection',
        'Contrôle technique périodique obligatoire',
        '2025-11-05',
        '2025-11-05',
        78.00,
        'completed',
        'INV-2025-1105-GCA-CT',
        'Contrôle technique passé sans contre-visite.',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Repair 8: Scheduled inspection
    (
        'c0000001-0000-0000-0000-000000000008',
        (SELECT id FROM cars WHERE license_plate = 'EE-654-FF' LIMIT 1),
        NULL,
        'a0000001-0000-0000-0000-000000000001', -- Garage Central Auto
        'inspection',
        'Contrôle technique périodique obligatoire',
        '2026-02-12',
        NULL,
        78.00,
        'scheduled',
        NULL,
        'Rendez-vous confirmé à 14h30',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Repair 9: Completed electric vehicle maintenance (using first car)
    (
        'c0000001-0000-0000-0000-000000000009',
        (SELECT id FROM cars WHERE license_plate = 'AA-123-BB' LIMIT 1),
        NULL,
        'a0000001-0000-0000-0000-000000000006', -- Électro-Garage
        'maintenance',
        'Mise à jour logiciel système de gestion batterie, contrôle connecteurs haute tension',
        '2025-12-18',
        '2025-12-18',
        150.00,
        'completed',
        'INV-2025-1218-EG-001',
        'Maintenance spécifique véhicule électrique.',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Repair 10: Cancelled maintenance
    (
        'c0000001-0000-0000-0000-000000000010',
        (SELECT id FROM cars WHERE license_plate = 'BB-456-CC' LIMIT 1),
        NULL,
        'a0000001-0000-0000-0000-000000000004', -- Rapide Auto Service
        'maintenance',
        'Remplacement pneumatiques',
        '2026-01-20',
        NULL,
        NULL,
        'cancelled',
        NULL,
        'Annulé: pneumatiques encore en bon état après vérification',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Repair 11: Scheduled accident repair (Accident 5 - not yet started)
    (
        'c0000001-0000-0000-0000-000000000011',
        (SELECT car_id FROM accidents WHERE id = 'b0000001-0000-0000-0000-000000000005'),
        'b0000001-0000-0000-0000-000000000005',
        'a0000001-0000-0000-0000-000000000002', -- Carrosserie Moderne
        'accident',
        'Réparation collision en chaîne: pare-chocs avant et arrière, capot, radiateur, peinture',
        '2026-02-01',
        NULL,
        4200.00,
        'scheduled',
        NULL,
        'Attente expertise assurance et détermination responsabilités',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Repair 12: Completed transmission repair
    (
        'c0000001-0000-0000-0000-000000000012',
        (SELECT id FROM cars WHERE license_plate = 'CC-789-DD' LIMIT 1),
        NULL,
        'a0000001-0000-0000-0000-000000000009', -- Boîte Vitesse Pro
        'maintenance',
        'Remplacement embrayage et volant moteur',
        '2025-11-28',
        '2025-12-01',
        1850.00,
        'completed',
        'INV-2025-1201-BVP-001',
        'Embrayage usé à 85%. Remplacement préventif recommandé.',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    );

-- Add comment
COMMENT ON TABLE repairs IS 'Seeded with 12 sample repairs covering accidents, maintenance, and inspections with various statuses';
