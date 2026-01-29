import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Garage, PaginatedResponse, CreateGarageRequest, UpdateGarageRequest, GarageFilters } from '@/types'

export async function getGarages(params: GarageFilters = {}): Promise<PaginatedResponse<Garage>> {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.search) searchParams.set('search', params.search)
  if (params.isActive !== undefined) searchParams.set('is_active', params.isActive.toString())
  
  const queryString = searchParams.toString()
  const endpoint = queryString ? `/garages?${queryString}` : '/garages'
  
  return apiGet<PaginatedResponse<Garage>>(endpoint)
}

export async function getGarage(id: string): Promise<Garage> {
  return apiGet<Garage>(`/garages/${id}`)
}

export async function createGarage(data: CreateGarageRequest): Promise<Garage> {
  return apiPost<Garage, CreateGarageRequest>('/garages', data)
}

export async function updateGarage(id: string, data: UpdateGarageRequest): Promise<Garage> {
  return apiPut<Garage, UpdateGarageRequest>(`/garages/${id}`, data)
}

export async function deleteGarage(id: string): Promise<void> {
  return apiDelete<void>(`/garages/${id}`)
}

export async function searchGarages(query: string): Promise<PaginatedResponse<Garage>> {
  return getGarages({ search: query, limit: 100 })
}
