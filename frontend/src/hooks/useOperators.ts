import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as operatorService from '@/services/operatorService'
import type { OperatorFilters } from '@/types/operator'

export function useOperators(filters: OperatorFilters = {}) {
  return useQuery({
    queryKey: ['operators', filters],
    queryFn: () => operatorService.getOperators(filters),
  })
}

export function useOperator(id: string | undefined) {
  return useQuery({
    queryKey: ['operator', id],
    queryFn: () => operatorService.getOperator(id!),
    enabled: !!id,
  })
}

export function useCreateOperator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: operatorService.createOperator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
    },
  })
}

export function useUpdateOperator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Parameters<typeof operatorService.updateOperator>[1]
    }) => operatorService.updateOperator(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      queryClient.invalidateQueries({ queryKey: ['operator', variables.id] })
    },
  })
}

export function useDeleteOperator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: operatorService.deleteOperator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
    },
  })
}

export function useAssignOperatorToCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      carId,
      data,
    }: {
      carId: string
      data: Parameters<typeof operatorService.assignOperatorToCar>[1]
    }) => operatorService.assignOperatorToCar(carId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      queryClient.invalidateQueries({ queryKey: ['operator', variables.data.operator_id] })
      queryClient.invalidateQueries({ queryKey: ['car', variables.carId] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      queryClient.invalidateQueries({ queryKey: ['carAssignmentHistory', variables.carId] })
      queryClient.invalidateQueries({ queryKey: ['operatorAssignmentHistory', variables.data.operator_id] })
    },
  })
}

export function useUnassignOperatorFromCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      carId,
      data,
    }: {
      carId: string
      data: Parameters<typeof operatorService.unassignOperatorFromCar>[1]
    }) => operatorService.unassignOperatorFromCar(carId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      queryClient.invalidateQueries({ queryKey: ['car', variables.carId] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      queryClient.invalidateQueries({ queryKey: ['carAssignmentHistory', variables.carId] })
    },
  })
}

export function useCarAssignmentHistory(carId: string | undefined) {
  return useQuery({
    queryKey: ['carAssignmentHistory', carId],
    queryFn: () => operatorService.getCarAssignmentHistory(carId!),
    enabled: !!carId,
  })
}

export function useOperatorAssignmentHistory(operatorId: string | undefined) {
  return useQuery({
    queryKey: ['operatorAssignmentHistory', operatorId],
    queryFn: () => operatorService.getOperatorAssignmentHistory(operatorId!),
    enabled: !!operatorId,
  })
}
