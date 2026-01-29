-- Seed data for garages table
-- Note: Using hardcoded UUIDs for consistency in test/dev environments

INSERT INTO garages (id, name, contact_person, phone, email, address, specialization, is_active, created_by)
VALUES
    -- Garage 1: General repair
    (
        'a0000001-0000-0000-0000-000000000001',
        'Garage Central Auto',
        'Pierre Dubois',
        '+33 1 42 34 56 78',
        'contact@garagecentralauto.fr',
        '15 Avenue de la République, 75011 Paris',
        'Réparation tous types de véhicules, carrosserie',
        true,
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Garage 2: Bodywork specialist
    (
        'a0000001-0000-0000-0000-000000000002',
        'Carrosserie Moderne',
        'Sophie Martin',
        '+33 1 48 76 54 32',
        'info@carrosseriemoderne.fr',
        '28 Rue du Commerce, 75015 Paris',
        'Carrosserie, peinture, débosselage',
        true,
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Garage 3: Mechanical specialist
    (
        'a0000001-0000-0000-0000-000000000003',
        'Mécanique Pro Services',
        'Jean Lefebvre',
        '+33 1 56 89 12 34',
        'contact@mecanique-pro.fr',
        '42 Boulevard Voltaire, 75011 Paris',
        'Mécanique générale, diagnostic électronique',
        true,
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Garage 4: Quick service
    (
        'a0000001-0000-0000-0000-000000000004',
        'Rapide Auto Service',
        'Marie Durand',
        '+33 1 43 21 67 89',
        'service@rapideauto.fr',
        '8 Rue de la Paix, 75002 Paris',
        'Entretien rapide, révision, pneumatiques',
        true,
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Garage 5: Premium service
    (
        'a0000001-0000-0000-0000-000000000005',
        'Prestige Auto Réparation',
        'Laurent Bernard',
        '+33 1 47 83 92 10',
        'contact@prestigeauto.fr',
        '55 Avenue des Champs-Élysées, 75008 Paris',
        'Véhicules haut de gamme, expertise',
        true,
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Garage 6: Specialized electric
    (
        'a0000001-0000-0000-0000-000000000006',
        'Électro-Garage',
        'Christine Petit',
        '+33 1 52 34 78 91',
        'info@electro-garage.fr',
        '18 Rue de Rivoli, 75004 Paris',
        'Véhicules électriques et hybrides',
        true,
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Garage 7: General service (inactive)
    (
        'a0000001-0000-0000-0000-000000000007',
        'Ancien Garage Municipalité',
        'Robert Moreau',
        '+33 1 45 67 89 23',
        'ancien@garage-muni.fr',
        '10 Rue du Faubourg, 75013 Paris',
        'Entretien général',
        false,
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Garage 8: Diesel specialist
    (
        'a0000001-0000-0000-0000-000000000008',
        'Diesel Expert',
        'Thierry Rousseau',
        '+33 1 49 82 34 56',
        'contact@dieselexpert.fr',
        '33 Avenue de Clichy, 75017 Paris',
        'Moteurs diesel, injection, dépollution',
        true,
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Garage 9: Transmission specialist
    (
        'a0000001-0000-0000-0000-000000000009',
        'Boîte Vitesse Pro',
        'Nathalie Simon',
        '+33 1 58 91 23 45',
        'info@boitevitessepro.fr',
        '67 Rue de la Convention, 75015 Paris',
        'Boîtes de vitesses, transmissions',
        true,
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Garage 10: Glass and windshield
    (
        'a0000001-0000-0000-0000-000000000010',
        'Vitrage Auto Plus',
        'Alexandre Roux',
        '+33 1 46 73 82 19',
        'contact@vitrageautoplus.fr',
        '21 Rue de Charenton, 75012 Paris',
        'Pare-brise, vitres, optiques',
        true,
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    );

-- Add comment
COMMENT ON TABLE garages IS 'Seeded with 10 sample garages (9 active, 1 inactive) for testing';
