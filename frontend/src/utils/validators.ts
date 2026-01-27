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
  licensePlate?: string
  brand?: string
  model?: string
  greyCardNumber?: string
  insuranceCompanyId?: string
  rentalStartDate?: string
  status?: string
}, isUpdate: boolean = false): ValidationErrors {
  const errors: ValidationErrors = {}
  
  const licensePlate = data.licensePlate
  const greyCardNumber = data.greyCardNumber
  const insuranceCompanyId = data.insuranceCompanyId
  const rentalStartDate = data.rentalStartDate
  
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

export function validatePassword(password: string): boolean {
  if (!password || password.length < 8) return false
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  return hasUpperCase && hasLowerCase && hasNumber
}

export function validateEmployeeForm(data: {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  role?: string
  isActive?: boolean
}, isUpdate: boolean = false): ValidationErrors {
  const errors: ValidationErrors = {}
  
  if (!validateRequired(data.email)) {
    errors.email = 'L\'email est requis'
  } else if (!validateEmail(data.email!)) {
    errors.email = 'Format d\'email invalide'
  }
  
  if (!isUpdate) {
    if (!validateRequired(data.password)) {
      errors.password = 'Le mot de passe est requis'
    } else if (!validatePassword(data.password!)) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre'
    }
  }
  
  if (!validateRequired(data.firstName)) {
    errors.firstName = 'Le prénom est requis'
  }
  
  if (!validateRequired(data.lastName)) {
    errors.lastName = 'Le nom est requis'
  }
  
  if (!validateRequired(data.role)) {
    errors.role = 'Le rôle est requis'
  }
  
  return errors
}

export function validatePasswordChange(data: {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}): ValidationErrors {
  const errors: ValidationErrors = {}
  
  if (!validateRequired(data.currentPassword)) {
    errors.currentPassword = 'Le mot de passe actuel est requis'
  }
  
  if (!validateRequired(data.newPassword)) {
    errors.newPassword = 'Le nouveau mot de passe est requis'
  } else if (!validatePassword(data.newPassword!)) {
    errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre'
  }
  
  if (!validateRequired(data.confirmPassword)) {
    errors.confirmPassword = 'La confirmation est requise'
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'
  }
  
  return errors
}
