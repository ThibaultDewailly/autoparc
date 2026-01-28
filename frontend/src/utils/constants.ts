export const FRENCH_LABELS = {
  // Auth
  email: 'Email',
  password: 'Mot de passe',
  login: 'Se connecter',
  logout: 'Déconnexion',
  welcome: 'Bienvenue',
  
  // Navigation
  dashboard: 'Tableau de bord',
  cars: 'Véhicules',
  carManagement: 'Gestion des Véhicules',
  employees: 'Employés',
  employeeManagement: 'Gestion des Employés',
  operators: 'Opérateurs',
  operatorManagement: 'Gestion des Opérateurs',
  
  // Car fields
  licensePlate: 'Plaque d\'immatriculation',
  brand: 'Marque',
  model: 'Modèle',
  greyCardNumber: 'Numéro de carte grise',
  insuranceCompany: 'Compagnie d\'assurance',
  rentalStartDate: 'Date de début de location',
  status: 'Statut',
  createdAt: 'Créé le',
  updatedAt: 'Modifié le',
  
  // Actions
  add: 'Ajouter',
  edit: 'Modifier',
  delete: 'Supprimer',
  save: 'Enregistrer',
  cancel: 'Annuler',
  confirm: 'Confirmer',
  back: 'Retour',
  search: 'Rechercher',
  filter: 'Filtrer',
  view: 'Voir',
  details: 'Détails',
  
  // Car operations
  addCar: 'Ajouter un véhicule',
  editCar: 'Modifier le véhicule',
  deleteCar: 'Supprimer le véhicule',
  carDetails: 'Détails du véhicule',
  newCar: 'Nouveau véhicule',
  
  // Employee fields
  firstName: 'Prénom',
  lastName: 'Nom',
  role: 'Rôle',
  isActive: 'Actif',
  inactive: 'Inactif',
  lastLogin: 'Dernière connexion',
  currentPassword: 'Mot de passe actuel',
  newPassword: 'Nouveau mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
  
  // Employee operations
  addEmployee: 'Ajouter un employé',
  editEmployee: 'Modifier l\'employé',
  deleteEmployee: 'Supprimer l\'employé',
  employeeDetails: 'Détails de l\'employé',
  newEmployee: 'Nouvel employé',
  changePassword: 'Changer le mot de passe',
  
  // Operator fields
  employeeNumber: 'Numéro d\'employé',
  phone: 'Téléphone',
  department: 'Département',
  currentCar: 'Véhicule actuel',
  currentOperator: 'Opérateur actuel',
  since: 'Depuis',
  
  // Operator operations
  addOperator: 'Ajouter un opérateur',
  editOperator: 'Modifier l\'opérateur',
  deleteOperator: 'Supprimer l\'opérateur',
  operatorDetails: 'Détails de l\'opérateur',
  newOperator: 'Nouvel opérateur',
  assignCar: 'Attribuer un véhicule',
  unassignCar: 'Désattribuer',
  assignOperator: 'Attribuer un opérateur',
  unassignOperator: 'Désattribuer l\'opérateur',
  assignmentHistory: 'Historique d\'attributions',
  currentAssignment: 'Attribution actuelle',
  noAssignment: 'Aucune attribution',
  startDate: 'Date de début',
  endDate: 'Date de fin',
  notes: 'Notes',
  vehicle: 'Véhicule',
  operator: 'Opérateur',
  
  // Status values
  active: 'Actif',
  maintenance: 'En maintenance',
  retired: 'Retiré',
  
  // Pagination
  previous: 'Précédent',
  next: 'Suivant',
  page: 'Page',
  of: 'sur',
  
  // Messages
  loading: 'Chargement...',
  noData: 'Aucune donnée',
  noCarsFound: 'Aucun véhicule trouvé',
  noEmployeesFound: 'Aucun employé trouvé',
  noOperatorsFound: 'Aucun opérateur trouvé',
  error: 'Erreur',
  success: 'Succès',
  confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce véhicule ?',
  confirmDeleteEmployee: 'Êtes-vous sûr de vouloir supprimer cet employé ?',
  confirmDeleteOperator: 'Êtes-vous sûr de vouloir désactiver cet opérateur ?',
  confirmUnassign: 'Êtes-vous sûr de vouloir désattribuer cet opérateur ?',
  carCreated: 'Véhicule créé avec succès',
  carUpdated: 'Véhicule mis à jour avec succès',
  carDeleted: 'Véhicule supprimé avec succès',
  employeeCreated: 'Employé créé avec succès',
  employeeUpdated: 'Employé mis à jour avec succès',
  employeeDeleted: 'Employé supprimé avec succès',
  operatorCreated: 'Opérateur créé avec succès',
  operatorUpdated: 'Opérateur mis à jour avec succès',
  operatorDeleted: 'Opérateur désactivé avec succès',
  assignmentCreated: 'Attribution créée avec succès',
  assignmentEnded: 'Désattribution effectuée avec succès',
  operatorAlreadyAssigned: 'L\'opérateur a déjà un véhicule attribué',
  carAlreadyAssigned: 'Le véhicule a déjà un opérateur attribué',
  passwordChanged: 'Mot de passe changé avec succès',
  
  // Stats
  totalCars: 'Total de véhicules',
  activeCars: 'Véhicules actifs',
  maintenanceCars: 'Véhicules en maintenance',
  
  // Placeholders
  searchPlaceholder: 'Rechercher par plaque, marque ou modèle...',
  selectInsurance: 'Sélectionner une compagnie',
  selectStatus: 'Sélectionner un statut',
  allStatuses: 'Tous les statuts',
}

export const CAR_STATUSES: Array<{ value: CarStatus; label: string }> = [
  { value: 'active', label: FRENCH_LABELS.active },
  { value: 'maintenance', label: FRENCH_LABELS.maintenance },
  { value: 'retired', label: FRENCH_LABELS.retired },
]

export type CarStatus = 'active' | 'maintenance' | 'retired'

export const API_BASE_URL = '/api/v1'

export const ROUTES = {
  login: '/login',
  dashboard: '/',
  cars: '/cars',
  carNew: '/cars/new',
  carDetail: (id: string) => `/cars/${id}`,
  carEdit: (id: string) => `/cars/${id}/edit`,
  employees: '/employees',
  employeeNew: '/employees/new',
  employeeDetail: (id: string) => `/employees/${id}`,
  employeeEdit: (id: string) => `/employees/${id}/edit`,
  employeeChangePassword: (id: string) => `/employees/${id}/change-password`,
  operators: '/operators',
  operatorNew: '/operators/new',
  operatorDetail: (id: string) => `/operators/${id}`,
  operatorEdit: (id: string) => `/operators/${id}/edit`,
}

export const DEFAULT_PAGE_SIZE = 20
