import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Repair, PaginatedResponse, CreateRepairRequest, UpdateRepairRequest, RepairFilters, RepairStatus } from '@/types'

export async function getRepairs(params: RepairFilters = {}): Promise<PaginatedResponse<Repair>> {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.carId) searchParams.set('car_id', params.carId)
  if (params.accidentId) searchParams.set('accident_id', params.accidentId)
  if (params.garageId) searchParams.set('garage_id', params.garageId)
  if (params.repairType) searchParams.set('repair_type', params.repairType)
  if (params.status) searchParams.set('status', params.status)
  if (params.startDate) searchParams.set('start_date', params.startDate)
  if (params.endDate) searchParams.set('end_date', params.endDate)
  
  const queryString = searchParams.toString()
  const endpoint = queryString ? `/repairs?${queryString}` : '/repairs'
  
  return apiGet<PaginatedResponse<Repair>>(endpoint)
}

export async function getRepair(id: string): Promise<Repair> {
  return apiGet<Repair>(`/repairs/${id}`)
}

export async function getRepairsByCar(carId: string): Promise<Repair[]> {
  const response = await apiGet<PaginatedResponse<Repair>>(`/repairs?car_id=${carId}`)
  return response.data || []
}

export async function getRepairsByAccident(accidentId: string): Promise<Repair[]> {
  const response = await apiGet<PaginatedResponse<Repair>>(`/repairs?accident_id=${accidentId}`)
  return response.data || []
}

export async function getRepairsByGarage(garageId: string): Promise<Repair[]> {
  const response = await apiGet<PaginatedResponse<Repair>>(`/repairs?garage_id=${garageId}`)
  return response.data || []
}

export async function createRepair(data: CreateRepairRequest): Promise<Repair> {
  return apiPost<Repair, CreateRepairRequest>('/repairs', data)
}

export async function updateRepair(id: string, data: UpdateRepairRequest): Promise<Repair> {
  return apiPut<Repair, UpdateRepairRequest>(`/repairs/${id}`, data)
}

export async function deleteRepair(id: string): Promise<void> {
  return apiDelete<void>(`/repairs/${id}`)
}

export async function updateRepairStatus(id: string, status: RepairStatus): Promise<Repair> {
  return apiPut<Repair, { status: RepairStatus }>(`/repairs/${id}/status`, { status })
}
