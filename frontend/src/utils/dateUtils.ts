/**
 * Format a date to French locale string
 */
export function formatDate(date: string | Date, includeTime: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) {
    return 'Date invalide'
  }
  
  if (includeTime) {
    return d.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Format a date to ISO string for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) {
    return ''
  }
  
  return d.toISOString().split('T')[0]
}

/**
 * Format a datetime to ISO string for datetime-local input (YYYY-MM-DDTHH:mm)
 */
export function formatDateTimeForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) {
    return ''
  }
  
  return d.toISOString().slice(0, 16)
}

/**
 * Calculate duration between two dates in days
 */
export function calculateDurationInDays(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0
  }
  
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Format duration in a human-readable way
 */
export function formatDuration(days: number): string {
  if (days === 0) return '0 jour'
  if (days === 1) return '1 jour'
  if (days < 7) return `${days} jours`
  
  const weeks = Math.floor(days / 7)
  const remainingDays = days % 7
  
  if (weeks === 1 && remainingDays === 0) return '1 semaine'
  if (weeks > 1 && remainingDays === 0) return `${weeks} semaines`
  if (weeks === 1) return `1 semaine et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`
  return `${weeks} semaines et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`
}

/**
 * Validate if a date is not in the future
 */
export function isNotInFuture(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  return d <= now
}

/**
 * Validate if start date is before or equal to end date
 */
export function isStartBeforeEnd(startDate: string | Date, endDate: string | Date): boolean {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  return start <= end
}

/**
 * Get relative time string (e.g., "il y a 2 jours")
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  if (isNaN(d.getTime())) {
    return 'Date invalide'
  }
  
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  if (diffSecs < 60) return 'à l\'instant'
  if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`
  if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  if (diffDays < 30) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  if (diffMonths < 12) return `il y a ${diffMonths} mois`
  return `il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`
}

/**
 * Get current date in ISO format for default input values
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get current datetime in ISO format for default datetime-local input values
 */
export function getCurrentDateTime(): string {
  return new Date().toISOString().slice(0, 16)
}
