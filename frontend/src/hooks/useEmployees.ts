import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as employeeService from '@/services/employeeService'
import type { UpdateEmployeeRequest, ChangePasswordRequest } from '@/types'

interface UseEmployeesParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  role?: string
  sortBy?: string
  order?: string
}

export function useEmployees(params: UseEmployeesParams = {}) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeService.getEmployees(params),
  })
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getEmployee(id!),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: employeeService.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordRequest }) =>
      employeeService.changePassword(id, data),
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: employeeService.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}
