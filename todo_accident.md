# TODO - Accidents & Repairs Feature (Iteration 3)

## Vue d'ensemble
Implémentation complète du système de gestion des accidents et réparations, incluant:
- Déclaration d'accidents avec photos
- Liaison réparations-accidents
- Réparations autonomes (maintenance)
- Gestion des garages
- Historique accidents/réparations par véhicule

---

## PARTIE 1: DATABASE ✅ TERMINÉ

### 1.1 Migrations - Garages ✅
- [x] Créer migration `000010_create_garages_table.up.sql`
  - [x] Table `garages` avec colonnes:
    - `id` UUID PRIMARY KEY
    - `name` VARCHAR(200) NOT NULL
    - `contact_person` VARCHAR(200)
    - `phone` VARCHAR(50) NOT NULL
    - `email` VARCHAR(255)
    - `address` TEXT NOT NULL
    - `specialization` VARCHAR(200)
    - `is_active` BOOLEAN NOT NULL DEFAULT true
    - `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
    - `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()
    - `created_by` UUID REFERENCES administrative_employees(id)
  - [x] Index sur `is_active`
  - [x] Index sur `name` pour recherche
- [x] Créer migration `000010_create_garages_table.down.sql`

### 1.2 Migrations - Accidents ✅
- [x] Créer migration `000011_create_accidents_table.up.sql`
  - [x] Table `accidents` avec colonnes:
    - `id` UUID PRIMARY KEY
    - `car_id` UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE
    - `accident_date` TIMESTAMP NOT NULL
    - `location` TEXT NOT NULL
    - `description` TEXT NOT NULL
    - `damages_description` TEXT
    - `responsible_party` VARCHAR(200)
    - `police_report_number` VARCHAR(100)
    - `insurance_claim_number` VARCHAR(100)
    - `status` VARCHAR(50) NOT NULL DEFAULT 'declared'
    - CHECK (status IN ('declared', 'under_review', 'approved', 'closed'))
    - `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
    - `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()
    - `created_by` UUID REFERENCES administrative_employees(id)
  - [x] Index sur `car_id`
  - [x] Index sur `accident_date`
  - [x] Index sur `status`
- [x] Créer migration `000011_create_accidents_table.down.sql`

### 1.3 Migrations - Photos d'Accidents ✅
- [x] Créer migration `000012_create_accident_photos_table.up.sql`
  - [x] Table `accident_photos` avec colonnes:
    - `id` UUID PRIMARY KEY
    - `accident_id` UUID NOT NULL REFERENCES accidents(id) ON DELETE CASCADE
    - `filename` VARCHAR(255) NOT NULL
    - `file_data` BYTEA NOT NULL
    - `file_size` INTEGER NOT NULL
    - `mime_type` VARCHAR(100) NOT NULL
    - `compression_type` VARCHAR(50) DEFAULT 'gzip'
    - `description` TEXT
    - `uploaded_at` TIMESTAMP NOT NULL DEFAULT NOW()
    - `uploaded_by` UUID REFERENCES administrative_employees(id)
  - [x] Index sur `accident_id`
- [x] Créer migration `000012_create_accident_photos_table.down.sql`

### 1.4 Migrations - Réparations ✅
- [x] Créer migration `000013_create_repairs_table.up.sql`
  - [x] Table `repairs` avec colonnes:
    - `id` UUID PRIMARY KEY
    - `car_id` UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE
    - `accident_id` UUID REFERENCES accidents(id) ON DELETE SET NULL
    - `garage_id` UUID NOT NULL REFERENCES garages(id)
    - `repair_type` VARCHAR(50) NOT NULL
    - CHECK (repair_type IN ('accident', 'maintenance', 'inspection'))
    - `description` TEXT NOT NULL
    - `start_date` DATE NOT NULL
    - `end_date` DATE
    - `cost` DECIMAL(10,2)
    - `status` VARCHAR(50) NOT NULL DEFAULT 'scheduled'
    - CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
    - `invoice_number` VARCHAR(100)
    - `notes` TEXT
    - `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
    - `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()
    - `created_by` UUID REFERENCES administrative_employees(id)
  - [x] Index sur `car_id`
  - [x] Index sur `accident_id`
  - [x] Index sur `garage_id`
  - [x] Index sur `start_date, end_date, status`
  - [x] Index sur `repair_type`
- [x] Créer migration `000013_create_repairs_table.down.sql`

### 1.5 Mise à jour Action Logs ✅
- [x] Créer migration `000014_update_action_logs_for_accidents_repairs.up.sql`
  - [x] Ajouter 'accident', 'repair', 'garage' à enum entity_type
  - [x] Mettre à jour CHECK constraint
- [x] Créer migration `000014_update_action_logs_for_accidents_repairs.down.sql`

### 1.6 Données de Test (Seeds) ✅
- [x] Créer `migrations/seeds/000004_seed_garages.sql` avec 10 garages exemples
- [x] Créer `migrations/seeds/000005_seed_accidents.sql` avec 5 accidents exemples
- [x] Créer `migrations/seeds/000006_seed_repairs.sql` avec 12 réparations exemples

---

## PARTIE 2: BACKEND 🔄 EN COURS

### 2.1 Models ✅ TERMINÉ
- [x] Créer `internal/models/garage.go`
  - [x] Struct `Garage` avec tous les champs
  - [x] Struct `CreateGarageRequest`
  - [x] Struct `UpdateGarageRequest`
  - [x] Méthode `Validate()` pour validation
  - [x] Tags JSON et validation
- [x] Créer `internal/models/accident.go`
  - [x] Struct `Accident` avec tous les champs
  - [x] Struct `CreateAccidentRequest`
  - [x] Struct `UpdateAccidentRequest`
  - [x] Méthode `Validate()`
  - [x] Enum pour `status` (declared, under_review, approved, closed)
- [x] Créer `internal/models/accident_photo.go`
  - [x] Struct `AccidentPhoto` avec tous les champs
  - [x] Struct `UploadPhotoRequest`
  - [x] Méthode de validation (taille, type MIME)
- [x] Créer `internal/models/repair.go`
  - [x] Struct `Repair` avec tous les champs
  - [x] Struct `CreateRepairRequest`
  - [x] Struct `UpdateRepairRequest`
  - [x] Méthode `Validate()`
  - [x] Enum pour `repair_type` (accident, maintenance, inspection)
  - [x] Enum pour `status` (scheduled, in_progress, completed, cancelled)

### 2.2 Repository - Garages ✅ TERMINÉ
- [x] Créer `internal/repository/garage_repository.go`
  - [x] Interface `GarageRepository`
  - [x] Méthode `GetAll(ctx, filters)` avec pagination
  - [x] Méthode `GetByID(ctx, id)`
  - [x] Méthode `Create(ctx, garage)`
  - [x] Méthode `Update(ctx, id, garage)`
  - [x] Méthode `Delete(ctx, id)` (soft delete: is_active=false)
  - [x] Méthode `Search(ctx, query)` par nom, spécialisation
- [ ] Créer tests `internal/repository/garage_repository_test.go`
  - [ ] Tests CRUD complets avec mock DB
  - [ ] Tests pagination et filtres
  - [ ] Tests recherche

### 2.3 Repository - Accidents ✅ TERMINÉ
- [x] Créer `internal/repository/accident_repository.go`
  - [x] Interface `AccidentRepository`
  - [x] Méthode `GetAll(ctx, filters)` avec pagination
  - [x] Méthode `GetByID(ctx, id)` avec photos
  - [x] Méthode `GetByCarID(ctx, carID)` - historique par véhicule
  - [x] Méthode `Create(ctx, accident)`
  - [x] Méthode `Update(ctx, id, accident)`
  - [x] Méthode `Delete(ctx, id)`
  - [x] Méthode `UpdateStatus(ctx, id, status)`
- [x] Créer tests `internal/repository/accident_repository_test.go`

### 2.4 Repository - Photos d'Accidents ✅ TERMINÉ
- [x] Créer `internal/repository/accident_photo_repository.go`
  - [x] Interface `AccidentPhotoRepository`
  - [x] Méthode `GetByAccidentID(ctx, accidentID)` - toutes les photos
  - [x] Méthode `GetByID(ctx, id)` - une photo avec données
  - [x] Méthode `Create(ctx, photo)` avec compression gzip
  - [x] Méthode `Delete(ctx, id)`
  - [x] Méthode `GetPhotoMetadata(ctx, accidentID)` - sans données binaires
- [ ] Créer tests `internal/repository/accident_photo_repository_test.go`

### 2.5 Repository - Réparations ✅ TERMINÉ
- [x] Créer `internal/repository/repair_repository.go`
  - [x] Interface `RepairRepository`
  - [x] Méthode `GetAll(ctx, filters)` avec pagination
  - [x] Méthode `GetByID(ctx, id)`
  - [x] Méthode `GetByCarID(ctx, carID)` - historique par véhicule
  - [x] Méthode `GetByAccidentID(ctx, accidentID)` - réparations liées
  - [x] Méthode `GetByGarageID(ctx, garageID)`
  - [x] Méthode `Create(ctx, repair)`
  - [x] Méthode `Update(ctx, id, repair)`
  - [x] Méthode `Delete(ctx, id)`
  - [x] Méthode `UpdateStatus(ctx, id, status)`
- [x] Créer tests `internal/repository/repair_repository_test.go`

### 2.6 Service - Garages ✅ TERMINÉ
- [x] Créer `internal/service/garage_service.go`
  - [x] Interface `GarageService`
  - [x] Méthode `ListGarages(ctx, filters)` avec business logic
  - [x] Méthode `GetGarage(ctx, id)`
  - [x] Méthode `CreateGarage(ctx, req, userID)` avec validation
  - [x] Méthode `UpdateGarage(ctx, id, req, userID)`
  - [x] Méthode `DeleteGarage(ctx, id, userID)` avec vérifications
  - [x] Validation: téléphone requis, email format
  - [x] Vérifier si garage utilisé par réparations avant suppression
- [x] Créer tests `internal/service/garage_service_test.go`
  - [x] Tests avec mocks repository
  - [x] Tests validation métier

### 2.7 Service - Accidents ✅ TERMINÉ
- [x] Créer `internal/service/accident_service.go`
  - [x] Interface `AccidentService`
  - [x] Méthode `ListAccidents(ctx, filters)`
  - [x] Méthode `GetAccident(ctx, id)` avec photos et réparations
  - [x] Méthode `GetAccidentsByCar(ctx, carID)`
  - [x] Méthode `CreateAccident(ctx, req, userID)` avec validation
  - [x] Méthode `UpdateAccident(ctx, id, req, userID)`
  - [x] Méthode `DeleteAccident(ctx, id, userID)`
  - [x] Méthode `UpdateAccidentStatus(ctx, id, status, userID)`
  - [x] Méthode `UploadPhoto(ctx, accidentID, file, userID)` avec compression
  - [x] Méthode `GetPhotos(ctx, accidentID)`
  - [x] Méthode `GetPhoto(ctx, photoID)` avec décompression
  - [x] Méthode `DeletePhoto(ctx, photoID, userID)`
  - [x] Validation: date accident <= aujourd'hui, car_id valide
  - [x] Compression image avec gzip avant stockage
- [x] Créer tests `internal/service/accident_service_test.go`

### 2.8 Service - Réparations ✅ TERMINÉ
- [x] Créer `internal/service/repair_service.go`
  - [x] Interface `RepairService`
  - [x] Méthode `ListRepairs(ctx, filters)`
  - [x] Méthode `GetRepair(ctx, id)`
  - [x] Méthode `GetRepairsByCar(ctx, carID)`
  - [x] Méthode `GetRepairsByAccident(ctx, accidentID)`
  - [x] Méthode `CreateRepair(ctx, req, userID)` avec validation
  - [x] Méthode `UpdateRepair(ctx, id, req, userID)`
  - [x] Méthode `DeleteRepair(ctx, id, userID)`
  - [x] Méthode `UpdateRepairStatus(ctx, id, status, userID)`
  - [x] Validation: start_date <= end_date si end_date fourni
  - [x] Validation: car_id, garage_id valides
  - [x] Si repair_type='accident', accident_id requis
  - [x] Calcul durée réparation automatique
- [x] Créer tests `internal/service/repair_service_test.go`

### 2.9 Handlers - Garages
- [ ] Créer `internal/handlers/garage_handler.go`
  - [ ] `ListGarages(c)` - GET /api/v1/garages
  - [ ] `GetGarage(c)` - GET /api/v1/garages/:id
  - [ ] `CreateGarage(c)` - POST /api/v1/garages
  - [ ] `UpdateGarage(c)` - PUT /api/v1/garages/:id
  - [ ] `DeleteGarage(c)` - DELETE /api/v1/garages/:id
  - [ ] Gestion erreurs HTTP appropriées
  - [ ] Logging des actions
- [ ] Créer tests `internal/handlers/garage_handler_test.go`

### 2.10 Handlers - Accidents
- [ ] Créer `internal/handlers/accident_handler.go`
  - [ ] `ListAccidents(c)` - GET /api/v1/accidents
  - [ ] `GetAccident(c)` - GET /api/v1/accidents/:id
  - [ ] `CreateAccident(c)` - POST /api/v1/accidents
  - [ ] `UpdateAccident(c)` - PUT /api/v1/accidents/:id
  - [ ] `DeleteAccident(c)` - DELETE /api/v1/accidents/:id
  - [ ] `UpdateAccidentStatus(c)` - PATCH /api/v1/accidents/:id/status
  - [ ] `UploadPhoto(c)` - POST /api/v1/accidents/:id/photos (multipart)
  - [ ] `GetPhotos(c)` - GET /api/v1/accidents/:id/photos
  - [ ] `GetPhoto(c)` - GET /api/v1/accidents/:id/photos/:photo_id
  - [ ] `DeletePhoto(c)` - DELETE /api/v1/accidents/:id/photos/:photo_id
  - [ ] Headers appropriés pour photos (Content-Type, Content-Disposition)
- [ ] Créer tests `internal/handlers/accident_handler_test.go`

### 2.11 Handlers - Réparations
- [ ] Créer `internal/handlers/repair_handler.go`
  - [ ] `ListRepairs(c)` - GET /api/v1/repairs
  - [ ] `GetRepair(c)` - GET /api/v1/repairs/:id
  - [ ] `CreateRepair(c)` - POST /api/v1/repairs
  - [ ] `UpdateRepair(c)` - PUT /api/v1/repairs/:id
  - [ ] `DeleteRepair(c)` - DELETE /api/v1/repairs/:id
  - [ ] `UpdateRepairStatus(c)` - PATCH /api/v1/repairs/:id/status
- [ ] Créer tests `internal/handlers/repair_handler_test.go`

### 2.12 Routes
- [ ] Mettre à jour `cmd/api/routes.go`
  - [ ] Groupe `/api/v1/garages` avec middleware auth
  - [ ] Groupe `/api/v1/accidents` avec middleware auth
  - [ ] Groupe `/api/v1/repairs` avec middleware auth
  - [ ] Routes photos avec Content-Type approprié

### 2.13 Mise à jour Car Handler
- [ ] Modifier `internal/handlers/car_handler.go`
  - [ ] Ajouter accidents dans `GetCar` response (historique)
  - [ ] Ajouter repairs dans `GetCar` response (historique)
  - [ ] Grouper par type: accident repairs vs maintenance repairs

### 2.14 Action Logs
- [ ] Mettre à jour `internal/service/action_log_service.go`
  - [ ] Support pour entity_type 'garage'
  - [ ] Support pour entity_type 'accident'
  - [ ] Support pour entity_type 'repair'
  - [ ] Actions: create, update, delete, status_change, photo_upload

### 2.15 Tests d'Intégration Backend
- [ ] Créer `tests/integration/garage_test.go`
  - [ ] Test CRUD complet avec DB réelle
  - [ ] Test recherche et filtres
- [ ] Créer `tests/integration/accident_test.go`
  - [ ] Test création accident + upload photos
  - [ ] Test workflow complet: declared → under_review → approved
  - [ ] Test récupération avec décompression photos
- [ ] Créer `tests/integration/repair_test.go`
  - [ ] Test création réparation liée à accident
  - [ ] Test création réparation autonome (maintenance)
  - [ ] Test changement statut: scheduled → in_progress → completed

---

## PARTIE 3: FRONTEND

### 3.1 API Services
- [ ] Créer `src/services/garageService.js`
  - [ ] `getGarages(filters)` avec pagination
  - [ ] `getGarage(id)`
  - [ ] `createGarage(data)`
  - [ ] `updateGarage(id, data)`
  - [ ] `deleteGarage(id)`
  - [ ] `searchGarages(query)`
- [ ] Créer `src/services/accidentService.js`
  - [ ] `getAccidents(filters)` avec pagination
  - [ ] `getAccident(id)`
  - [ ] `getAccidentsByCar(carId)`
  - [ ] `createAccident(data)`
  - [ ] `updateAccident(id, data)`
  - [ ] `deleteAccident(id)`
  - [ ] `updateAccidentStatus(id, status)`
  - [ ] `uploadPhoto(accidentId, file, description)`
  - [ ] `getPhotos(accidentId)`
  - [ ] `getPhoto(photoId)` - retourne blob
  - [ ] `deletePhoto(accidentId, photoId)`
- [ ] Créer `src/services/repairService.js`
  - [ ] `getRepairs(filters)` avec pagination
  - [ ] `getRepair(id)`
  - [ ] `getRepairsByCar(carId)`
  - [ ] `getRepairsByAccident(accidentId)`
  - [ ] `createRepair(data)`
  - [ ] `updateRepair(id, data)`
  - [ ] `deleteRepair(id)`
  - [ ] `updateRepairStatus(id, status)`

### 3.2 Custom Hooks
- [ ] Créer `src/hooks/useGarages.js`
  - [ ] Hook pour liste garages avec cache
  - [ ] Hook pour garage individuel
  - [ ] Gestion loading, error states
- [ ] Créer `src/hooks/useAccidents.js`
  - [ ] Hook pour liste accidents
  - [ ] Hook pour accident individuel avec photos
  - [ ] Hook pour accidents par véhicule
- [ ] Créer `src/hooks/useRepairs.js`
  - [ ] Hook pour liste réparations
  - [ ] Hook pour réparation individuelle
  - [ ] Hook pour réparations par véhicule

### 3.3 Components - Garages
- [ ] Créer `src/components/garages/GarageList.jsx`
  - [ ] Liste paginée des garages
  - [ ] Filtres: actif/inactif, recherche par nom
  - [ ] Bouton "Ajouter un garage"
  - [ ] Actions: Modifier, Supprimer
- [ ] Créer `src/components/garages/GarageCard.jsx`
  - [ ] Affichage compact: nom, téléphone, spécialisation
  - [ ] Badge statut (actif/inactif)
  - [ ] Actions rapides
- [ ] Créer `src/components/garages/GarageForm.jsx`
  - [ ] Formulaire création/édition
  - [ ] Champs: nom*, téléphone*, email, adresse*, spécialisation
  - [ ] Validation côté client
  - [ ] Messages d'erreur en français
- [ ] Créer `src/components/garages/GarageDetail.jsx`
  - [ ] Informations complètes
  - [ ] Liste des réparations effectuées par ce garage
  - [ ] Statistiques (nombre réparations, coût total)

### 3.4 Components - Accidents
- [ ] Créer `src/components/accidents/AccidentList.jsx`
  - [ ] Liste paginée des accidents
  - [ ] Filtres: statut, véhicule, dates
  - [ ] Tri par date
  - [ ] Bouton "Déclarer un accident"
- [ ] Créer `src/components/accidents/AccidentCard.jsx`
  - [ ] Affichage: véhicule, date, lieu, statut
  - [ ] Badge couleur selon statut
  - [ ] Nombre de photos
  - [ ] Nombre de réparations liées
- [ ] Créer `src/components/accidents/AccidentForm.jsx`
  - [ ] Formulaire déclaration accident
  - [ ] Sélection véhicule (autocomplete)
  - [ ] Date/heure accident*
  - [ ] Lieu*
  - [ ] Description*
  - [ ] Description dégâts
  - [ ] Partie responsable
  - [ ] Numéro rapport police
  - [ ] Numéro déclaration assurance
  - [ ] Upload multiple photos (drag & drop)
  - [ ] Aperçu photos avant envoi
- [ ] Créer `src/components/accidents/AccidentDetail.jsx`
  - [ ] Informations complètes
  - [ ] Timeline: declared → under_review → approved → closed
  - [ ] Bouton changement statut
  - [ ] Galerie photos (lightbox)
  - [ ] Liste réparations associées
  - [ ] Bouton "Créer réparation"
- [ ] Créer `src/components/accidents/AccidentPhotoGallery.jsx`
  - [ ] Grille thumbnails photos
  - [ ] Lightbox pour affichage plein écran
  - [ ] Bouton télécharger photo
  - [ ] Bouton supprimer photo
  - [ ] Upload nouvelles photos
- [ ] Créer `src/components/accidents/AccidentStatusBadge.jsx`
  - [ ] Badge coloré selon statut
  - [ ] Libellés en français

### 3.5 Components - Réparations
- [ ] Créer `src/components/repairs/RepairList.jsx`
  - [ ] Liste paginée des réparations
  - [ ] Filtres: type, statut, garage, véhicule, dates
  - [ ] Tri par date début/fin
  - [ ] Bouton "Créer réparation"
  - [ ] Groupement: en cours / programmées / terminées
- [ ] Créer `src/components/repairs/RepairCard.jsx`
  - [ ] Affichage: véhicule, type, dates, garage, statut
  - [ ] Badge type (accident/maintenance/inspection)
  - [ ] Badge statut avec couleur
  - [ ] Coût si renseigné
  - [ ] Lien vers accident si applicable
- [ ] Créer `src/components/repairs/RepairForm.jsx`
  - [ ] Formulaire création/édition
  - [ ] Sélection véhicule* (autocomplete)
  - [ ] Sélection type* (accident/maintenance/inspection)
  - [ ] Si type=accident: sélection accident (autocomplete)
  - [ ] Sélection garage* (autocomplete)
  - [ ] Description*
  - [ ] Date début*
  - [ ] Date fin (optionnelle)
  - [ ] Coût (optionnel)
  - [ ] Numéro facture
  - [ ] Notes
  - [ ] Validation: date début <= date fin
- [ ] Créer `src/components/repairs/RepairDetail.jsx`
  - [ ] Informations complètes
  - [ ] Timeline: scheduled → in_progress → completed
  - [ ] Bouton changement statut
  - [ ] Lien vers accident si applicable
  - [ ] Lien vers véhicule
  - [ ] Lien vers garage
  - [ ] Calcul durée réparation
  - [ ] Actions: Modifier, Supprimer
- [ ] Créer `src/components/repairs/RepairStatusBadge.jsx`
  - [ ] Badge coloré selon statut
  - [ ] Libellés en français
- [ ] Créer `src/components/repairs/RepairTypeBadge.jsx`
  - [ ] Badge type (accident/maintenance/inspection)
  - [ ] Icônes appropriées

### 3.6 Components - Car Updates
- [ ] Mettre à jour `src/components/cars/CarDetail.jsx`
  - [ ] Onglet "Accidents" avec liste accidents
  - [ ] Onglet "Réparations" avec liste réparations
  - [ ] Séparation: réparations suite accident / maintenance
  - [ ] Statistiques: nombre accidents, coût total réparations
  - [ ] Bouton "Déclarer accident"
  - [ ] Bouton "Programmer maintenance"

### 3.7 Pages
- [ ] Créer `src/pages/GaragesPage.jsx`
  - [ ] Affichage GarageList
  - [ ] Barre recherche
  - [ ] Filtres
- [ ] Créer `src/pages/GarageDetailPage.jsx`
  - [ ] Route: /garages/:id
  - [ ] Affichage GarageDetail
- [ ] Créer `src/pages/GarageEditPage.jsx`
  - [ ] Routes: /garages/new, /garages/:id/edit
  - [ ] Affichage GarageForm
- [ ] Créer `src/pages/AccidentsPage.jsx`
  - [ ] Affichage AccidentList
  - [ ] Filtres avancés
- [ ] Créer `src/pages/AccidentDetailPage.jsx`
  - [ ] Route: /accidents/:id
  - [ ] Affichage AccidentDetail
  - [ ] Galerie photos
  - [ ] Réparations liées
- [ ] Créer `src/pages/AccidentFormPage.jsx`
  - [ ] Routes: /accidents/new, /accidents/:id/edit
  - [ ] Affichage AccidentForm
- [ ] Créer `src/pages/RepairsPage.jsx`
  - [ ] Affichage RepairList
  - [ ] Filtres avancés
  - [ ] Vue calendrier (optionnel)
- [ ] Créer `src/pages/RepairDetailPage.jsx`
  - [ ] Route: /repairs/:id
  - [ ] Affichage RepairDetail
- [ ] Créer `src/pages/RepairFormPage.jsx`
  - [ ] Routes: /repairs/new, /repairs/:id/edit
  - [ ] Affichage RepairForm
  - [ ] Pré-remplissage si vient de accident/:id

### 3.8 Routing
- [ ] Mettre à jour `src/App.jsx`
  - [ ] Routes garages
  - [ ] Routes accidents
  - [ ] Routes réparations
  - [ ] Protection routes avec AuthGuard

### 3.9 Navigation
- [ ] Mettre à jour `src/components/common/Navbar.jsx`
  - [ ] Menu "Garages"
  - [ ] Menu "Accidents"
  - [ ] Menu "Réparations"

### 3.10 Utilities
- [ ] Créer `src/utils/imageUtils.js`
  - [ ] Fonction resize image avant upload
  - [ ] Fonction validation type fichier
  - [ ] Fonction validation taille fichier
  - [ ] Création thumbnail
- [ ] Créer `src/utils/dateUtils.js`
  - [ ] Format dates en français
  - [ ] Calcul durée entre dates
  - [ ] Validation dates

### 3.11 Constants
- [ ] Mettre à jour `src/utils/constants.js`
  - [ ] ACCIDENT_STATUSES avec libellés français
  - [ ] REPAIR_TYPES avec libellés français
  - [ ] REPAIR_STATUSES avec libellés français
  - [ ] MAX_PHOTO_SIZE (ex: 5MB)
  - [ ] ALLOWED_PHOTO_TYPES (image/jpeg, image/png, image/webp)

### 3.12 Localization
- [ ] Tous les textes UI en français:
  - [ ] Labels formulaires
  - [ ] Messages validation
  - [ ] Messages erreur
  - [ ] Confirmations suppression
  - [ ] Tooltips
  - [ ] Placeholders

### 3.13 Tests Unitaires Frontend
- [ ] Tests `GarageList.test.jsx`
  - [ ] Rendu liste
  - [ ] Filtres fonctionnels
  - [ ] Pagination
- [ ] Tests `AccidentForm.test.jsx`
  - [ ] Validation champs requis
  - [ ] Upload photos
  - [ ] Soumission formulaire
- [ ] Tests `RepairForm.test.jsx`
  - [ ] Validation dates
  - [ ] Sélection type et accident conditionnel
- [ ] Tests services
  - [ ] Mock axios responses
  - [ ] Gestion erreurs

---

## PARTIE 4: END-TO-END TESTS

### 4.1 Tests E2E - Garages
- [ ] Créer `e2e/05-garages.spec.ts`
  - [ ] Test: Affichage liste garages
  - [ ] Test: Recherche garage par nom
  - [ ] Test: Création nouveau garage
    - [ ] Remplir formulaire complet
    - [ ] Validation champs requis
    - [ ] Soumission et redirection
    - [ ] Vérification dans liste
  - [ ] Test: Modification garage existant
  - [ ] Test: Désactivation garage (soft delete)
  - [ ] Test: Tentative suppression garage avec réparations liées (erreur attendue)

### 4.2 Tests E2E - Accidents
- [ ] Créer `e2e/06-accidents.spec.ts`
  - [ ] Test: Affichage liste accidents
  - [ ] Test: Filtrage par statut
  - [ ] Test: Déclaration nouvel accident
    - [ ] Sélection véhicule
    - [ ] Remplir informations accident
    - [ ] Upload 2-3 photos
    - [ ] Soumission
    - [ ] Vérification création
  - [ ] Test: Affichage détail accident avec galerie photos
  - [ ] Test: Téléchargement photo
  - [ ] Test: Changement statut accident (declared → under_review → approved)
  - [ ] Test: Upload photo supplémentaire sur accident existant
  - [ ] Test: Suppression photo
  - [ ] Test: Modification accident
  - [ ] Test: Suppression accident

### 4.3 Tests E2E - Réparations
- [ ] Créer `e2e/07-repairs.spec.ts`
  - [ ] Test: Affichage liste réparations
  - [ ] Test: Filtrage par type et statut
  - [ ] Test: Création réparation suite accident
    - [ ] Partir de détail accident
    - [ ] Clic "Créer réparation"
    - [ ] Formulaire pré-rempli avec accident
    - [ ] Sélection garage
    - [ ] Remplir détails
    - [ ] Soumission
  - [ ] Test: Création réparation maintenance autonome
    - [ ] Sélection véhicule
    - [ ] Type = maintenance
    - [ ] Pas de lien accident
    - [ ] Sélection garage
    - [ ] Remplir détails
    - [ ] Soumission
  - [ ] Test: Changement statut réparation (scheduled → in_progress → completed)
  - [ ] Test: Modification réparation
  - [ ] Test: Suppression réparation
  - [ ] Test: Validation dates (date fin > date début)

### 4.4 Tests E2E - Workflow Complet
- [ ] Créer `e2e/08-accident-repair-workflow.spec.ts`
  - [ ] Test: Workflow complet accident → réparations → clôture
    - [ ] 1. Créer accident avec photos
    - [ ] 2. Changer statut en "under_review"
    - [ ] 3. Créer première réparation carrosserie
    - [ ] 4. Créer deuxième réparation mécanique
    - [ ] 5. Marquer réparations "in_progress"
    - [ ] 6. Marquer réparations "completed"
    - [ ] 7. Changer accident en "approved"
    - [ ] 8. Vérifier historique complet sur page véhicule
    - [ ] 9. Vérifier statistiques (coûts, durées)
  - [ ] Test: Workflow maintenance programmée
    - [ ] 1. Depuis page véhicule, clic "Programmer maintenance"
    - [ ] 2. Créer réparation type maintenance
    - [ ] 3. Suivre évolution statut
    - [ ] 4. Vérifier apparition dans historique véhicule

### 4.5 Tests E2E - Car Detail Updates
- [ ] Créer `e2e/09-car-history.spec.ts`
  - [ ] Test: Affichage onglet accidents sur page véhicule
  - [ ] Test: Affichage onglet réparations sur page véhicule
  - [ ] Test: Statistiques accidents/réparations sur dashboard véhicule
  - [ ] Test: Filtrage réparations par type (accident vs maintenance)
  - [ ] Test: Timeline complète des événements véhicule

### 4.6 Tests E2E - Photos & Upload
- [ ] Créer `e2e/10-photo-upload.spec.ts`
  - [ ] Test: Upload photo JPEG
  - [ ] Test: Upload photo PNG
  - [ ] Test: Upload multiple photos simultanées
  - [ ] Test: Erreur fichier trop volumineux
  - [ ] Test: Erreur type fichier non supporté
  - [ ] Test: Affichage galerie avec lightbox
  - [ ] Test: Navigation galerie (suivant/précédent)
  - [ ] Test: Téléchargement photo en pleine résolution

### 4.7 Tests E2E - Permissions & Validation
- [ ] Créer `e2e/11-accidents-validation.spec.ts`
  - [ ] Test: Champs requis formulaire accident
  - [ ] Test: Validation date accident (pas dans le futur)
  - [ ] Test: Sélection véhicule invalide
  - [ ] Test: Champs requis formulaire réparation
  - [ ] Test: Validation dates réparation (fin >= début)
  - [ ] Test: Tentative accès non authentifié (redirect login)

### 4.8 Test Fixtures
- [ ] Créer `e2e/fixtures/garages.ts`
  - [ ] Données exemples garages
- [ ] Créer `e2e/fixtures/accidents.ts`
  - [ ] Données exemples accidents
- [ ] Créer `e2e/fixtures/repairs.ts`
  - [ ] Données exemples réparations
- [ ] Créer `e2e/fixtures/photos.ts`
  - [ ] Images test (petites tailles)

### 4.9 Configuration E2E
- [ ] Mettre à jour `playwright.config.ts`
  - [ ] Ajouter timeouts appropriés pour uploads
  - [ ] Configuration video/screenshots pour tests photos
  - [ ] Base URL API

### 4.10 CI/CD Integration
- [ ] Mettre à jour `.github/workflows/e2e.yml`
  - [ ] Ajout migrations garages/accidents/réparations
  - [ ] Seeds données test
  - [ ] Exécution nouveaux specs E2E

---

## CRITÈRES DE RÉUSSITE GLOBAUX

### Fonctionnalités
- [ ] ✅ Gestion complète CRUD garages
- [ ] ✅ Déclaration accidents avec photos multiples
- [ ] ✅ Création réparations liées à accidents
- [ ] ✅ Création réparations maintenance autonomes
- [ ] ✅ Workflow changement statut accidents et réparations
- [ ] ✅ Galerie photos avec lightbox
- [ ] ✅ Historique complet accidents/réparations par véhicule
- [ ] ✅ Statistiques coûts et durées

### Qualité
- [ ] ✅ Couverture tests backend >= 80%
- [ ] ✅ Tests unitaires frontend >= 80%
- [ ] ✅ Tous tests E2E passent
- [ ] ✅ Pas de régression fonctionnalités existantes
- [ ] ✅ Validation données côté client et serveur
- [ ] ✅ Gestion erreurs appropriée
- [ ] ✅ Messages erreur en français
- [ ] ✅ Interface responsive

### Performance
- [ ] ✅ Upload photos < 5s pour 3 photos
- [ ] ✅ Compression photos effective (gzip)
- [ ] ✅ Pagination performante pour listes
- [ ] ✅ Chargement images optimisé (lazy loading)

### Documentation
- [ ] ✅ README migrations mis à jour
- [ ] ✅ API endpoints documentés
- [ ] ✅ Commentaires code pour logique complexe

---

## NOTES IMPORTANTES

1. **Photos**: Implémenter compression côté serveur ET resize côté client pour optimiser stockage
2. **Sécurité**: Valider types MIME et tailles fichiers côté serveur
3. **Transactions**: Utiliser transactions DB pour création accident + photos
4. **Cascade**: Attention suppression accident → photos et réparations liées
5. **Action Logs**: Logger toutes les actions sur accidents, réparations, garages
6. **Dates**: Utiliser timezone approprié, affichage format français
7. **Recherche**: Implémenter recherche full-text sur descriptions accidents/réparations (future)
8. **Export**: Prévoir possibilité export rapport accident PDF (future)

---

**Date création**: 29 janvier 2026
**Statut**: En attente de démarrage
**Priorité**: Haute (Iteration 3)
