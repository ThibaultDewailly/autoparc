import { describe, it, expect } from 'vitest'
import {
  validateLicensePlate,
  validateEmail,
  validateRequired,
  validateCarForm,
  validateLoginForm,
} from './validators'

describe('validateLicensePlate', () => {
  it('should return true for valid license plates', () => {
    expect(validateLicensePlate('AA-123-BB')).toBe(true)
    expect(validateLicensePlate('ZZ-999-YY')).toBe(true)
    expect(validateLicensePlate('AB-456-CD')).toBe(true)
  })

  it('should return false for invalid license plates', () => {
    expect(validateLicensePlate('AA-12-BB')).toBe(false)
    expect(validateLicensePlate('A-123-BB')).toBe(false)
    expect(validateLicensePlate('AA-1234-BB')).toBe(false)
    expect(validateLicensePlate('AA123BB')).toBe(false)
    expect(validateLicensePlate('')).toBe(false)
  })

  it('should handle uppercase conversion', () => {
    // The function converts to uppercase internally
    expect(validateLicensePlate('aa-123-bb')).toBe(true)
  })
})

describe('validateEmail', () => {
  it('should return true for valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    expect(validateEmail('admin@autoparc.fr')).toBe(true)
  })

  it('should return false for invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('invalid@')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
  })
})

describe('validateRequired', () => {
  it('should return true for valid values', () => {
    expect(validateRequired('test')).toBe(true)
    expect(validateRequired('  value  ')).toBe(true)
    expect(validateRequired(123)).toBe(true)
    expect(validateRequired(true)).toBe(true)
  })

  it('should return false for invalid values', () => {
    expect(validateRequired('')).toBe(false)
    expect(validateRequired('   ')).toBe(false)
    expect(validateRequired(null)).toBe(false)
    expect(validateRequired(undefined)).toBe(false)
  })
})

describe('validateCarForm', () => {
  const validData = {
    license_plate: 'AA-123-BB',
    brand: 'Renault',
    model: 'Clio',
    grey_card_number: 'GC123456',
    insurance_company_id: 'ins-123',
    rental_start_date: '2024-01-01',
    status: 'active' as const,
  }

  it('should return no errors for valid data', () => {
    const errors = validateCarForm(validData)
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('should return error for missing license plate', () => {
    const errors = validateCarForm({ ...validData, license_plate: '' })
    expect(errors.license_plate).toBeDefined()
  })

  it('should return error for invalid license plate format', () => {
    const errors = validateCarForm({ ...validData, license_plate: 'INVALID' })
    expect(errors.license_plate).toContain('Format invalide')
  })

  it('should return error for missing brand', () => {
    const errors = validateCarForm({ ...validData, brand: '' })
    expect(errors.brand).toBeDefined()
  })

  it('should return error for missing model', () => {
    const errors = validateCarForm({ ...validData, model: '' })
    expect(errors.model).toBeDefined()
  })

  it('should return error for missing grey card number', () => {
    const errors = validateCarForm({ ...validData, grey_card_number: '' })
    expect(errors.grey_card_number).toBeDefined()
  })

  it('should return error for missing insurance company', () => {
    const errors = validateCarForm({ ...validData, insurance_company_id: '' })
    expect(errors.insurance_company_id).toBeDefined()
  })

  it('should return error for missing rental start date', () => {
    const errors = validateCarForm({ ...validData, rental_start_date: '' })
    expect(errors.rental_start_date).toBeDefined()
  })

  it('should return error for missing status', () => {
    const errors = validateCarForm({ ...validData, status: '' })
    expect(errors.status).toBeDefined()
  })

  it('should return multiple errors for multiple issues', () => {
    const errors = validateCarForm({
      license_plate: '',
      brand: '',
    })
    expect(Object.keys(errors).length).toBeGreaterThan(1)
  })

  it('should skip license plate validation when isUpdate is true', () => {
    const dataWithoutLicensePlate = {
      brand: 'Renault',
      model: 'Clio',
      grey_card_number: 'GC123456',
      insurance_company_id: 'ins-123',
      rental_start_date: '2024-01-01',
      status: 'active' as const,
    }
    const errors = validateCarForm(dataWithoutLicensePlate, true)
    expect(errors.license_plate).toBeUndefined()
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('should validate license plate when isUpdate is false', () => {
    const dataWithoutLicensePlate = {
      brand: 'Renault',
      model: 'Clio',
      grey_card_number: 'GC123456',
      insurance_company_id: 'ins-123',
      rental_start_date: '2024-01-01',
      status: 'active' as const,
    }
    const errors = validateCarForm(dataWithoutLicensePlate, false)
    expect(errors.license_plate).toBeDefined()
  })

  it('should validate all fields except license plate during update', () => {
    const invalidUpdateData = {
      license_plate: '', // Should be ignored
      brand: '',
      model: '',
      grey_card_number: '',
      insurance_company_id: '',
      rental_start_date: '',
      status: '',
    }
    const errors = validateCarForm(invalidUpdateData, true)
    expect(errors.license_plate).toBeUndefined()
    expect(errors.brand).toBeDefined()
    expect(errors.model).toBeDefined()
    expect(errors.grey_card_number).toBeDefined()
    expect(errors.insurance_company_id).toBeDefined()
    expect(errors.rental_start_date).toBeDefined()
    expect(errors.status).toBeDefined()
  })
})

describe('validateLoginForm', () => {
  it('should return no errors for valid data', () => {
    const errors = validateLoginForm({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('should return error for missing email', () => {
    const errors = validateLoginForm({ password: 'password123' })
    expect(errors.email).toBeDefined()
  })

  it('should return error for invalid email format', () => {
    const errors = validateLoginForm({
      email: 'invalid-email',
      password: 'password123',
    })
    expect(errors.email).toContain('invalide')
  })

  it('should return error for missing password', () => {
    const errors = validateLoginForm({ email: 'test@example.com' })
    expect(errors.password).toBeDefined()
  })

  it('should return multiple errors for multiple issues', () => {
    const errors = validateLoginForm({})
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(2)
  })
})
