import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as repairService from '@/services/repairService'
import type { RepairFilters, CreateRepairRequest, UpdateRepairRequest, RepairStatus } from '@/types'

export function useRepairs(params: RepairFilters = {}) {
  return useQuery({
    queryKey: ['repairs', params],
    queryFn: () => repairService.getRepairs(params),
  })
}

export function useRepair(id: string | undefined) {
  return useQuery({
    queryKey: ['repair', id],
    queryFn: () => repairService.getRepair(id!),
    enabled: !!id,
  })
}

export function useRepairsByCar(carId: string | undefined) {
  return useQuery({
    queryKey: ['repairs', 'car', carId],
    queryFn: () => repairService.getRepairsByCar(carId!),
    enabled: !!carId,
  })
}

export function useRepairsByAccident(accidentId: string | undefined) {
  return useQuery({
    queryKey: ['repairs', 'accident', accidentId],
    queryFn: () => repairService.getRepairsByAccident(accidentId!),
    enabled: !!accidentId,
  })
}

export function useRepairsByGarage(garageId: string | undefined) {
  return useQuery({
    queryKey: ['repairs', 'garage', garageId],
    queryFn: () => repairService.getRepairsByGarage(garageId!),
    enabled: !!garageId,
  })
}

export function useCreateRepair() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateRepairRequest) => repairService.createRepair(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] })
    },
  })
}

export function useUpdateRepair() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRepairRequest }) =>
      repairService.updateRepair(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] })
      queryClient.invalidateQueries({ queryKey: ['repair', variables.id] })
    },
  })
}

export function useDeleteRepair() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => repairService.deleteRepair(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] })
    },
  })
}

export function useUpdateRepairStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RepairStatus }) =>
      repairService.updateRepairStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] })
      queryClient.invalidateQueries({ queryKey: ['repair', variables.id] })
    },
  })
}
