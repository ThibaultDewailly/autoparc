-- Seed data for accidents table
-- Note: Using hardcoded UUIDs for consistency in test/dev environments
-- Referencing existing cars from previous seed data

INSERT INTO accidents (id, car_id, accident_date, location, description, damages_description, responsible_party, police_report_number, insurance_claim_number, status, created_by)
VALUES
    -- Accident 1: Minor collision - declared
    (
        'b0000001-0000-0000-0000-000000000001',
        (SELECT id FROM cars WHERE license_plate = 'AA-123-BB' LIMIT 1),
        '2025-11-15 14:30:00+01',
        'Intersection Boulevard Voltaire et Rue de la Roquette, Paris 11ème',
        'Collision arrière lors d''un arrêt au feu rouge. Le véhicule suivant n''a pas pu freiner à temps.',
        'Pare-chocs arrière enfoncé, feu arrière droit cassé, léger enfoncement du coffre',
        'Autre conducteur',
        'PV-2025-111501',
        'CLAIM-2025-AA123-001',
        'declared',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Accident 2: Parking damage - under review
    (
        'b0000001-0000-0000-0000-000000000002',
        (SELECT id FROM cars WHERE license_plate = 'BB-456-CC' LIMIT 1),
        '2025-12-03 09:15:00+01',
        'Parking souterrain, 25 Rue de Bercy, Paris 12ème',
        'Rayure profonde sur le côté passager. Dégâts constatés au retour sur le véhicule stationné. Responsable non identifié.',
        'Rayure profonde de 80cm sur portière avant droite et portière arrière droite, jusqu''à la tôle',
        'Inconnu',
        NULL,
        'CLAIM-2025-BB456-001',
        'under_review',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Accident 3: Side collision - approved
    (
        'b0000001-0000-0000-0000-000000000003',
        (SELECT id FROM cars WHERE license_plate = 'CC-789-DD' LIMIT 1),
        '2025-10-22 17:45:00+02',
        'Rond-point Place de la Nation, Paris 12ème',
        'Collision latérale avec un véhicule qui n''a pas respecté la priorité en entrant sur le rond-point.',
        'Portière avant gauche enfoncée, rétroviseur gauche arraché, aile avant gauche endommagée',
        'Autre conducteur',
        'PV-2025-102201',
        'CLAIM-2025-CC789-001',
        'approved',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Accident 4: Vandalism - closed
    (
        'b0000001-0000-0000-0000-000000000004',
        (SELECT id FROM cars WHERE license_plate = 'DD-321-EE' LIMIT 1),
        '2025-09-08 23:00:00+02',
        'Rue du Faubourg Saint-Antoine, Paris 11ème (stationnement nocturne)',
        'Acte de vandalisme: pare-brise brisé, probablement avec un objet contondant. Découvert le matin.',
        'Pare-brise complètement fissuré (impact côté conducteur), aucun vol constaté à l''intérieur',
        'Inconnu',
        'PV-2025-090801',
        'CLAIM-2025-DD321-001',
        'closed',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    ),
    -- Accident 5: Multiple vehicle collision - under review
    (
        'b0000001-0000-0000-0000-000000000005',
        (SELECT id FROM cars WHERE license_plate = 'EE-654-FF' LIMIT 1),
        '2026-01-10 08:20:00+01',
        'Périphérique extérieur, Porte de Bercy, Paris',
        'Collision en chaîne suite à un freinage brusque. Trois véhicules impliqués. Notre véhicule au milieu.',
        'Pare-chocs avant et arrière endommagés, capot légèrement enfoncé, radiateur potentiellement touché',
        'Responsabilité partagée',
        'PV-2026-011001',
        'CLAIM-2026-EE654-001',
        'under_review',
        (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.fr' LIMIT 1)
    );

-- Add comment
COMMENT ON TABLE accidents IS 'Seeded with 5 sample accidents covering various scenarios and statuses';
