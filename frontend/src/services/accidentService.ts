import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Accident, AccidentPhoto, PaginatedResponse, CreateAccidentRequest, UpdateAccidentRequest, AccidentFilters, AccidentStatus } from '@/types'

const API_BASE_URL = '/api/v1'

export async function getAccidents(params: AccidentFilters = {}): Promise<PaginatedResponse<Accident>> {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.carId) searchParams.set('car_id', params.carId)
  if (params.status) searchParams.set('status', params.status)
  if (params.startDate) searchParams.set('start_date', params.startDate)
  if (params.endDate) searchParams.set('end_date', params.endDate)
  
  const queryString = searchParams.toString()
  const endpoint = queryString ? `/accidents?${queryString}` : '/accidents'
  
  return apiGet<PaginatedResponse<Accident>>(endpoint)
}

export async function getAccident(id: string): Promise<Accident> {
  return apiGet<Accident>(`/accidents/${id}`)
}

export async function getAccidentsByCar(carId: string): Promise<Accident[]> {
  const response = await apiGet<PaginatedResponse<Accident>>(`/accidents?car_id=${carId}`)
  return response.data || []
}

export async function createAccident(data: CreateAccidentRequest): Promise<Accident> {
  return apiPost<Accident, CreateAccidentRequest>('/accidents', data)
}

export async function updateAccident(id: string, data: UpdateAccidentRequest): Promise<Accident> {
  return apiPut<Accident, UpdateAccidentRequest>(`/accidents/${id}`, data)
}

export async function deleteAccident(id: string): Promise<void> {
  return apiDelete<void>(`/accidents/${id}`)
}

export async function updateAccidentStatus(id: string, status: AccidentStatus): Promise<Accident> {
  return apiPut<Accident, { status: AccidentStatus }>(`/accidents/${id}/status`, { status })
}

// Photo management
export async function uploadPhoto(accidentId: string, file: File, description?: string): Promise<AccidentPhoto> {
  const formData = new FormData()
  formData.append('file', file)
  if (description) {
    formData.append('description', description)
  }

  const response = await fetch(`${API_BASE_URL}/accidents/${accidentId}/photos`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur lors de l\'upload' }))
    throw new Error(error.message || 'Erreur lors de l\'upload')
  }

  return response.json()
}

export async function getPhotos(accidentId: string): Promise<AccidentPhoto[]> {
  return apiGet<AccidentPhoto[]>(`/accidents/${accidentId}/photos`)
}

export async function getPhoto(accidentId: string, photoId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/accidents/${accidentId}/photos/${photoId}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Erreur lors du téléchargement de la photo')
  }

  return response.blob()
}

export async function deletePhoto(accidentId: string, photoId: string): Promise<void> {
  return apiDelete<void>(`/accidents/${accidentId}/photos/${photoId}`)
}
