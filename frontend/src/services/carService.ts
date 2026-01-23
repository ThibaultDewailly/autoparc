import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Car, PaginatedResponse, CarStatus } from '@/types'

interface GetCarsParams {
  page?: number
  limit?: number
  status?: CarStatus
  search?: string
}

export async function getCars(params: GetCarsParams = {}): Promise<PaginatedResponse<Car>> {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.status) searchParams.set('status', params.status)
  if (params.search) searchParams.set('search', params.search)
  
  const queryString = searchParams.toString()
  const endpoint = queryString ? `/cars?${queryString}` : '/cars'
  
  return apiGet<PaginatedResponse<Car>>(endpoint)
}

export async function getCar(id: string): Promise<Car> {
  return apiGet<Car>(`/cars/${id}`)
}

export interface CreateCarData {
  license_plate: string
  brand: string
  model: string
  grey_card_number: string
  insurance_company_id: string
  rental_start_date: string
  status: CarStatus
}

export async function createCar(data: CreateCarData): Promise<Car> {
  return apiPost<Car, CreateCarData>('/cars', data)
}

export interface UpdateCarData {
  brand?: string
  model?: string
  grey_card_number?: string
  insurance_company_id?: string
  rental_start_date?: string
  status?: CarStatus
}

export async function updateCar(id: string, data: UpdateCarData): Promise<Car> {
  return apiPut<Car, UpdateCarData>(`/cars/${id}`, data)
}

export async function deleteCar(id: string): Promise<void> {
  return apiDelete<void>(`/cars/${id}`)
}
