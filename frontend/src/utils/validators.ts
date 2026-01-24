const LICENSE_PLATE_REGEX = /^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLicensePlate(plate: string): boolean {
  if (!plate) return false
  return LICENSE_PLATE_REGEX.test(plate.toUpperCase())
}

export function validateEmail(email: string): boolean {
  if (!email) return false
  return EMAIL_REGEX.test(email)
}

export function validateRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

export interface ValidationErrors {
  [key: string]: string
}

export function validateCarForm(data: {
  license_plate?: string
  brand?: string
  model?: string
  grey_card_number?: string
  insurance_company_id?: string
  rental_start_date?: string
  status?: string
}, isUpdate: boolean = false): ValidationErrors {
  const errors: ValidationErrors = {}
  
  if (!isUpdate) {
    if (!validateRequired(data.license_plate)) {
      errors.license_plate = 'La plaque d\'immatriculation est requise'
    } else if (!validateLicensePlate(data.license_plate!)) {
      errors.license_plate = 'Format invalide (ex: AA-123-BB)'
    }
  }
  
  if (!validateRequired(data.brand)) {
    errors.brand = 'La marque est requise'
  }
  
  if (!validateRequired(data.model)) {
    errors.model = 'Le modèle est requis'
  }
  
  if (!validateRequired(data.grey_card_number)) {
    errors.grey_card_number = 'Le numéro de carte grise est requis'
  }
  
  if (!validateRequired(data.insurance_company_id)) {
    errors.insurance_company_id = 'La compagnie d\'assurance est requise'
  }
  
  if (!validateRequired(data.rental_start_date)) {
    errors.rental_start_date = 'La date de début est requise'
  }
  
  if (!validateRequired(data.status)) {
    errors.status = 'Le statut est requis'
  }
  
  return errors
}

export function validateLoginForm(data: {
  email?: string
  password?: string
}): ValidationErrors {
  const errors: ValidationErrors = {}
  
  if (!validateRequired(data.email)) {
    errors.email = 'L\'email est requis'
  } else if (!validateEmail(data.email!)) {
    errors.email = 'Format d\'email invalide'
  }
  
  if (!validateRequired(data.password)) {
    errors.password = 'Le mot de passe est requis'
  }
  
  return errors
}
