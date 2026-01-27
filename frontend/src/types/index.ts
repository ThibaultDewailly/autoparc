export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
}

export interface Employee {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface CreateEmployeeRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
}

export interface UpdateEmployeeRequest {
  email?: string
  firstName?: string
  lastName?: string
  role?: string
  isActive?: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface EmployeeFilters {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  role?: string
  sortBy?: string
  order?: string
}

export interface PaginatedEmployeesResponse {
  employees: Employee[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
}

export interface Session {
  id: string
  userId: string
  sessionToken: string
  expiresAt: string
  createdAt: string
}

export interface InsuranceCompany {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  policyNumber: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Car {
  id: string
  licensePlate: string
  brand: string
  model: string
  greyCardNumber: string
  insuranceCompanyId: string
  insuranceCompany?: InsuranceCompany
  rentalStartDate: string
  status: CarStatus
  createdAt: string
  updatedAt: string
  createdBy: string
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
  // Session is stored in httpOnly cookie, not returned in response
}

// Backend API response types (snake_case)
export interface BackendUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
}

export interface BackendSession {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  created_at: string
}

export interface BackendLoginResponse {
  user: BackendUser
  session: BackendSession
}
