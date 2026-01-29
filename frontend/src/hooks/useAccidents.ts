import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as accidentService from '@/services/accidentService'
import type { AccidentFilters, CreateAccidentRequest, UpdateAccidentRequest, AccidentStatus } from '@/types'

export function useAccidents(params: AccidentFilters = {}) {
  return useQuery({
    queryKey: ['accidents', params],
    queryFn: () => accidentService.getAccidents(params),
  })
}

export function useAccident(id: string | undefined) {
  return useQuery({
    queryKey: ['accident', id],
    queryFn: () => accidentService.getAccident(id!),
    enabled: !!id,
  })
}

export function useAccidentsByCar(carId: string | undefined) {
  return useQuery({
    queryKey: ['accidents', 'car', carId],
    queryFn: () => accidentService.getAccidentsByCar(carId!),
    enabled: !!carId,
  })
}

export function useCreateAccident() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateAccidentRequest) => accidentService.createAccident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accidents'] })
    },
  })
}

export function useUpdateAccident() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccidentRequest }) =>
      accidentService.updateAccident(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accidents'] })
      queryClient.invalidateQueries({ queryKey: ['accident', variables.id] })
    },
  })
}

export function useDeleteAccident() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => accidentService.deleteAccident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accidents'] })
    },
  })
}

export function useUpdateAccidentStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AccidentStatus }) =>
      accidentService.updateAccidentStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accidents'] })
      queryClient.invalidateQueries({ queryKey: ['accident', variables.id] })
    },
  })
}

// Photo hooks
export function useAccidentPhotos(accidentId: string | undefined) {
  return useQuery({
    queryKey: ['accident', accidentId, 'photos'],
    queryFn: () => accidentService.getPhotos(accidentId!),
    enabled: !!accidentId,
  })
}

export function useUploadPhoto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ accidentId, file, description }: { accidentId: string; file: File; description?: string }) =>
      accidentService.uploadPhoto(accidentId, file, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accident', variables.accidentId, 'photos'] })
      queryClient.invalidateQueries({ queryKey: ['accident', variables.accidentId] })
    },
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ accidentId, photoId }: { accidentId: string; photoId: string }) =>
      accidentService.deletePhoto(accidentId, photoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accident', variables.accidentId, 'photos'] })
      queryClient.invalidateQueries({ queryKey: ['accident', variables.accidentId] })
    },
  })
}
