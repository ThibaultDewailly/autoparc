import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as carService from '@/services/carService'
import type { CarStatus } from '@/types'

interface UseCarsParams {
  page?: number
  limit?: number
  status?: CarStatus
  search?: string
}

export function useCars(params: UseCarsParams = {}) {
  return useQuery({
    queryKey: ['cars', params],
    queryFn: () => carService.getCars(params),
  })
}

export function useCar(id: string | undefined) {
  return useQuery({
    queryKey: ['car', id],
    queryFn: () => carService.getCar(id!),
    enabled: !!id,
  })
}

export function useCreateCar() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: carService.createCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
    },
  })
}

export function useUpdateCar() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: carService.UpdateCarData }) =>
      carService.updateCar(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      queryClient.invalidateQueries({ queryKey: ['car', variables.id] })
    },
  })
}

export function useDeleteCar() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: carService.deleteCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
    },
  })
}
