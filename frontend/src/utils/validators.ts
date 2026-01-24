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
  licensePlate?: string
  brand?: string
  model?: string
  grey_card_number?: string
  greyCardNumber?: string
  insurance_company_id?: string
  insuranceCompanyId?: string
  rental_start_date?: string
  rentalStartDate?: string
  status?: string
}, isUpdate: boolean = false): ValidationErrors {
  const errors: ValidationErrors = {}
  
  // Support both snake_case and camelCase
  const licensePlate = data.license_plate || data.licensePlate
  const greyCardNumber = data.grey_card_number || data.greyCardNumber
  const insuranceCompanyId = data.insurance_company_id || data.insuranceCompanyId
  const rentalStartDate = data.rental_start_date || data.rentalStartDate
  
  if (!isUpdate) {
    if (!validateRequired(licensePlate)) {
      errors.licensePlate = 'La plaque d\'immatriculation est requise'
    } else if (!validateLicensePlate(licensePlate!)) {
      errors.licensePlate = 'Format invalide (ex: AA-123-BB)'
    }
  }
  
  if (!validateRequired(data.brand)) {
    errors.brand = 'La marque est requise'
  }
  
  if (!validateRequired(data.model)) {
    errors.model = 'Le modèle est requis'
  }
  
  if (!validateRequired(greyCardNumber)) {
    errors.greyCardNumber = 'Le numéro de carte grise est requis'
  }
  
  if (!validateRequired(insuranceCompanyId)) {
    errors.insuranceCompanyId = 'La compagnie d\'assurance est requise'
  }
  
  if (!validateRequired(rentalStartDate)) {
    errors.rentalStartDate = 'La date de début est requise'
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
