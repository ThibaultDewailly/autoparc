import { describe, it, expect } from 'vitest'
import { formatDate, formatDateForInput, formatDateTime } from './formatters'

describe('formatDate', () => {
  it('should format date to DD/MM/YYYY', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).toMatch(/1[45]\/01\/2024/)
    expect(formatDate('2024-12-25T00:00:00Z')).toMatch(/2[45]\/12\/2024/)
    expect(formatDate('2024-06-05T23:59:59Z')).toMatch(/0[56]\/06\/2024/)
  })

  it('should handle single digit days and months', () => {
    expect(formatDate('2024-01-01T00:00:00Z')).toBe('01/01/2024')
    expect(formatDate('2024-09-09T00:00:00Z')).toBe('09/09/2024')
  })

  it('should return empty string for invalid date', () => {
    expect(formatDate('invalid-date')).toBe('')
    expect(formatDate('')).toBe('')
  })

  it('should handle different date formats', () => {
    expect(formatDate('2024-01-15')).toMatch(/15\/01\/2024/)
  })
})

describe('formatDateForInput', () => {
  it('should format date to YYYY-MM-DD', () => {
    expect(formatDateForInput('2024-01-15T10:30:00Z')).toBe('2024-01-15')
    expect(formatDateForInput('2024-12-25T00:00:00Z')).toBe('2024-12-25')
  })

  it('should handle single digit days and months', () => {
    expect(formatDateForInput('2024-01-01T00:00:00Z')).toBe('2024-01-01')
    expect(formatDateForInput('2024-09-09T00:00:00Z')).toBe('2024-09-09')
  })

  it('should return empty string for invalid date', () => {
    expect(formatDateForInput('invalid-date')).toBe('')
    expect(formatDateForInput('')).toBe('')
  })
})

describe('formatDateTime', () => {
  it('should format date and time to DD/MM/YYYY HH:MM', () => {
    const result = formatDateTime('2024-01-15T10:30:00Z')
    expect(result).toMatch(/15\/01\/2024 \d{2}:\d{2}/)
  })

  it('should handle different times', () => {
    const result = formatDateTime('2024-12-25T23:45:00Z')
    expect(result).toMatch(/2[456]\/12\/2024 \d{2}:\d{2}/)
  })

  it('should pad hours and minutes with zeros', () => {
    const result = formatDateTime('2024-01-01T01:05:00Z')
    expect(result).toMatch(/01\/01\/2024 \d{2}:\d{2}/)
  })

  it('should return empty string for invalid date', () => {
    expect(formatDateTime('invalid-date')).toBe('')
    expect(formatDateTime('')).toBe('')
  })
})
