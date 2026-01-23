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
  error: 'Erreur',
  success: 'Succès',
  confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce véhicule ?',
  carCreated: 'Véhicule créé avec succès',
  carUpdated: 'Véhicule mis à jour avec succès',
  carDeleted: 'Véhicule supprimé avec succès',
  
  // Stats
  totalCars: 'Total de véhicules',
  activeCars: 'Véhicules actifs',
  
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
}

export const DEFAULT_PAGE_SIZE = 20
