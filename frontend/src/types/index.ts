export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
}

export interface Session {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  created_at: string
}

export interface InsuranceCompany {
  id: string
  name: string
  contact_person: string
  phone: string
  email: string
  address: string
  policy_number: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Car {
  id: string
  license_plate: string
  brand: string
  model: string
  grey_card_number: string
  insurance_company_id: string
  insurance_company?: InsuranceCompany
  rental_start_date: string
  status: CarStatus
  created_at: string
  updated_at: string
  created_by: string
}

export type CarStatus = 'active' | 'maintenance' | 'retired'

export interface CarFilters {
  status?: CarStatus
  search?: string
}

export interface PaginatedResponse<T> {
  cars?: T[]
  data?: T[]
  totalCount?: number
  total?: number
  page: number
  limit: number
  totalPages?: number
  total_pages?: number
}

export interface ApiError {
  error: string
  message: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  session: Session
}
