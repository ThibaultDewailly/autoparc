import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useOperators,
  useOperator,
  useCreateOperator,
  useUpdateOperator,
  useDeleteOperator,
  useCarAssignmentHistory,
  useOperatorAssignmentHistory,
  useAssignOperatorToCar,
  useUnassignOperatorFromCar,
} from './useOperators'
import * as operatorService from '@/services/operatorService'

vi.mock('@/services/operatorService')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: any }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useOperators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useOperators', () => {
    it('fetches operators successfully', async () => {
      const mockData = {
        data: [{ id: '1', first_name: 'John', last_name: 'Doe' }],
        total_pages: 1,
      }
      vi.mocked(operatorService.getOperators).mockResolvedValue(mockData)

      const { result } = renderHook(() => useOperators({}), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockData)
      expect(operatorService.getOperators).toHaveBeenCalledWith({})
    })
  })

  describe('useOperator', () => {
    it('fetches operator by id successfully', async () => {
      const mockOperator = { id: '1', first_name: 'John', last_name: 'Doe' }
      vi.mocked(operatorService.getOperator).mockResolvedValue(mockOperator)

      const { result } = renderHook(() => useOperator('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockOperator)
      expect(operatorService.getOperator).toHaveBeenCalledWith('1')
    })

    it('does not fetch when id is empty', () => {
      const { result } = renderHook(() => useOperator(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.data).toBeUndefined()
      expect(operatorService.getOperator).not.toHaveBeenCalled()
    })
  })

  describe('useCreateOperator', () => {
    it('creates operator successfully', async () => {
      const mockOperator = { id: '1', first_name: 'John', last_name: 'Doe' }
      vi.mocked(operatorService.createOperator).mockResolvedValue(mockOperator)

      const { result } = renderHook(() => useCreateOperator(), {
        wrapper: createWrapper(),
      })

      const createData = { first_name: 'John', last_name: 'Doe' } as any

      result.current.mutate(createData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockOperator)
      expect(operatorService.createOperator).toHaveBeenCalled()
    })
  })

  describe('useUpdateOperator', () => {
    it('updates operator successfully', async () => {
      const mockOperator = { id: '1', first_name: 'John', last_name: 'Doe' }
      vi.mocked(operatorService.updateOperator).mockResolvedValue(mockOperator)

      const { result } = renderHook(() => useUpdateOperator(), {
        wrapper: createWrapper(),
      })

      const updatePayload = {
        id: '1',
        data: { first_name: 'John', last_name: 'Doe' } as any,
      }

      result.current.mutate(updatePayload)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockOperator)
      expect(operatorService.updateOperator).toHaveBeenCalledWith('1', updatePayload.data)
    })
  })

  describe('useDeleteOperator', () => {
    it('deletes operator successfully', async () => {
      vi.mocked(operatorService.deleteOperator).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteOperator(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('1')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(operatorService.deleteOperator).toHaveBeenCalled()
    })
  })

  describe('useCarAssignmentHistory', () => {
    it('fetches car assignment history successfully', async () => {
      const mockHistory = [{ id: '1', car_id: 'car1', operator_id: 'op1' }]
      vi.mocked(operatorService.getCarAssignmentHistory).mockResolvedValue(mockHistory)

      const { result } = renderHook(() => useCarAssignmentHistory('car1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockHistory)
      expect(operatorService.getCarAssignmentHistory).toHaveBeenCalledWith('car1')
    })

    it('does not fetch when carId is empty', () => {
      const { result } = renderHook(() => useCarAssignmentHistory(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.data).toBeUndefined()
      expect(operatorService.getCarAssignmentHistory).not.toHaveBeenCalled()
    })
  })

  describe('useOperatorAssignmentHistory', () => {
    it('fetches operator assignment history successfully', async () => {
      const mockHistory = [{ id: '1', car_id: 'car1', operator_id: 'op1' }]
      vi.mocked(operatorService.getOperatorAssignmentHistory).mockResolvedValue(mockHistory)

      const { result } = renderHook(() => useOperatorAssignmentHistory('op1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockHistory)
      expect(operatorService.getOperatorAssignmentHistory).toHaveBeenCalledWith('op1')
    })

    it('does not fetch when operatorId is empty', () => {
      const { result } = renderHook(() => useOperatorAssignmentHistory(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.data).toBeUndefined()
      expect(operatorService.getOperatorAssignmentHistory).not.toHaveBeenCalled()
    })
  })

  describe('useAssignOperatorToCar', () => {
    it('assigns operator to car successfully', async () => {
      const mockAssignment = { id: '1', car_id: 'car1', operator_id: 'op1' }
      vi.mocked(operatorService.assignOperatorToCar).mockResolvedValue(mockAssignment)

      const { result } = renderHook(() => useAssignOperatorToCar(), {
        wrapper: createWrapper(),
      })

      const assignData = { carId: 'car1', data: { operator_id: 'op1', assigned_date: '2024-01-01' } } as any

      result.current.mutate(assignData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockAssignment)
      expect(operatorService.assignOperatorToCar).toHaveBeenCalledWith('car1', assignData.data)
    })
  })

  describe('useUnassignOperatorFromCar', () => {
    it('unassigns operator from car successfully', async () => {
      vi.mocked(operatorService.unassignOperatorFromCar).mockResolvedValue(undefined)

      const { result } = renderHook(() => useUnassignOperatorFromCar(), {
        wrapper: createWrapper(),
      })

      const unassignData = { carId: 'car1', data: { unassigned_date: '2024-01-01' } } as any

      result.current.mutate(unassignData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(operatorService.unassignOperatorFromCar).toHaveBeenCalledWith('car1', unassignData.data)
    })
  })
})
