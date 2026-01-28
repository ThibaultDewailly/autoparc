import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type {
  CarOperator,
  CarOperatorAssignment,
  OperatorWithCurrentCar,
  OperatorDetail,
  CreateOperatorRequest,
  UpdateOperatorRequest,
  AssignOperatorRequest,
  UnassignOperatorRequest,
  OperatorFilters,
} from '@/types/operator'
import type { PaginatedResponse } from '@/types'

export async function getOperators(
  filters: OperatorFilters = {}
): Promise<PaginatedResponse<OperatorWithCurrentCar>> {
  const searchParams = new URLSearchParams()

  if (filters.page) searchParams.set('page', filters.page.toString())
  if (filters.limit) searchParams.set('limit', filters.limit.toString())
  if (filters.search) searchParams.set('search', filters.search)
  if (filters.department) searchParams.set('department', filters.department)
  if (filters.is_active !== undefined)
    searchParams.set('is_active', filters.is_active.toString())
  if (filters.sort_by) searchParams.set('sort_by', filters.sort_by)
  if (filters.order) searchParams.set('order', filters.order)

  const queryString = searchParams.toString()
  const endpoint = queryString ? `/operators?${queryString}` : '/operators'

  return apiGet<PaginatedResponse<OperatorWithCurrentCar>>(endpoint)
}

export async function getOperator(id: string): Promise<OperatorDetail> {
  return apiGet<OperatorDetail>(`/operators/${id}`)
}

export async function createOperator(
  data: CreateOperatorRequest
): Promise<CarOperator> {
  return apiPost<CarOperator, CreateOperatorRequest>('/operators', data)
}

export async function updateOperator(
  id: string,
  data: UpdateOperatorRequest
): Promise<CarOperator> {
  return apiPut<CarOperator, UpdateOperatorRequest>(`/operators/${id}`, data)
}

export async function deleteOperator(id: string): Promise<void> {
  return apiDelete<void>(`/operators/${id}`)
}

export async function assignOperatorToCar(
  carId: string,
  data: AssignOperatorRequest
): Promise<CarOperatorAssignment> {
  return apiPost<CarOperatorAssignment, AssignOperatorRequest>(
    `/cars/${carId}/assign`,
    data
  )
}

export async function unassignOperatorFromCar(
  carId: string,
  data: UnassignOperatorRequest
): Promise<void> {
  return apiPost<void, UnassignOperatorRequest>(`/cars/${carId}/unassign`, data)
}

export async function getCarAssignmentHistory(
  carId: string
): Promise<CarOperatorAssignment[]> {
  return apiGet<CarOperatorAssignment[]>(`/cars/${carId}/assignment-history`)
}

export async function getOperatorAssignmentHistory(
  operatorId: string
): Promise<CarOperatorAssignment[]> {
  return apiGet<CarOperatorAssignment[]>(
    `/operators/${operatorId}/assignment-history`
  )
}
