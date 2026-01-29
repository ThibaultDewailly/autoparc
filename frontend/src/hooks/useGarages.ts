import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as garageService from '@/services/garageService'
import type { GarageFilters, CreateGarageRequest, UpdateGarageRequest } from '@/types'

export function useGarages(params: GarageFilters = {}) {
  return useQuery({
    queryKey: ['garages', params],
    queryFn: () => garageService.getGarages(params),
  })
}

export function useGarage(id: string | undefined) {
  return useQuery({
    queryKey: ['garage', id],
    queryFn: () => garageService.getGarage(id!),
    enabled: !!id,
  })
}

export function useSearchGarages(query: string) {
  return useQuery({
    queryKey: ['garages', 'search', query],
    queryFn: () => garageService.searchGarages(query),
    enabled: query.length > 0,
  })
}

export function useCreateGarage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateGarageRequest) => garageService.createGarage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garages'] })
    },
  })
}

export function useUpdateGarage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGarageRequest }) =>
      garageService.updateGarage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['garages'] })
      queryClient.invalidateQueries({ queryKey: ['garage', variables.id] })
    },
  })
}

export function useDeleteGarage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => garageService.deleteGarage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garages'] })
    },
  })
}
