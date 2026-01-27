import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Employee, PaginatedEmployeesResponse, CreateEmployeeRequest, UpdateEmployeeRequest, ChangePasswordRequest } from '@/types'

interface GetEmployeesParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  role?: string
  sortBy?: string
  order?: string
}

export async function getEmployees(params: GetEmployeesParams = {}): Promise<PaginatedEmployeesResponse> {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.search) searchParams.set('search', params.search)
  if (params.isActive !== undefined) searchParams.set('is_active', params.isActive.toString())
  if (params.role) searchParams.set('role', params.role)
  if (params.sortBy) searchParams.set('sort_by', params.sortBy)
  if (params.order) searchParams.set('order', params.order)
  
  const queryString = searchParams.toString()
  const endpoint = queryString ? `/employees?${queryString}` : '/employees'
  
  return apiGet<PaginatedEmployeesResponse>(endpoint)
}

export async function getEmployee(id: string): Promise<Employee> {
  return apiGet<Employee>(`/employees/${id}`)
}

export async function createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
  return apiPost<Employee, CreateEmployeeRequest>('/employees', data)
}

export async function updateEmployee(id: string, data: UpdateEmployeeRequest): Promise<Employee> {
  return apiPut<Employee, UpdateEmployeeRequest>(`/employees/${id}`, data)
}

export async function changePassword(id: string, data: ChangePasswordRequest): Promise<void> {
  return apiPost<void, ChangePasswordRequest>(`/employees/${id}/change-password`, data)
}

export async function deleteEmployee(id: string): Promise<void> {
  return apiDelete<void>(`/employees/${id}`)
}
