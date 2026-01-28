import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { useOperators, useOperator, useCreateOperator } from './useOperators'
import * as operatorService from '@/services/operatorService'

vi.mock('@/services/operatorService')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useOperators hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useOperators', () => {
    it('should fetch operators successfully', async () => {
      const mockData = {
        data: [
          {
            id: '1',
            employee_number: 'EMP001',
            first_name: 'Jean',
            last_name: 'Dupont',
            is_active: true,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
        total_pages: 1,
      }

      vi.mocked(operatorService.getOperators).mockResolvedValue(mockData)

      const { result } = renderHook(() => useOperators(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockData)
      expect(operatorService.getOperators).toHaveBeenCalledWith({})
    })

    it('should pass filters to getOperators', async () => {
      const mockData = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      }

      vi.mocked(operatorService.getOperators).mockResolvedValue(mockData)

      const filters = {
        page: 2,
        search: 'Jean',
        is_active: true,
      }

      renderHook(() => useOperators(filters), {
        wrapper: createWrapper(),
      })

      await waitFor(() =>
        expect(operatorService.getOperators).toHaveBeenCalledWith(filters)
      )
    })
  })

  describe('useOperator', () => {
    it('should fetch single operator successfully', async () => {
      const mockOperator = {
        id: '1',
        employee_number: 'EMP001',
        first_name: 'Jean',
        last_name: 'Dupont',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        assignment_history: [],
      }

      vi.mocked(operatorService.getOperator).mockResolvedValue(mockOperator)

      const { result } = renderHook(() => useOperator('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockOperator)
      expect(operatorService.getOperator).toHaveBeenCalledWith('1')
    })

    it('should not fetch when id is undefined', () => {
      renderHook(() => useOperator(undefined), {
        wrapper: createWrapper(),
      })

      expect(operatorService.getOperator).not.toHaveBeenCalled()
    })
  })

  describe('useCreateOperator', () => {
    it('should create operator successfully', async () => {
      const mockOperator = {
        id: '1',
        employee_number: 'EMP001',
        first_name: 'Jean',
        last_name: 'Dupont',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      vi.mocked(operatorService.createOperator).mockResolvedValue(mockOperator)

      const { result } = renderHook(() => useCreateOperator(), {
        wrapper: createWrapper(),
      })

      const createData = {
        employee_number: 'EMP001',
        first_name: 'Jean',
        last_name: 'Dupont',
      }

      result.current.mutate(createData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const calls = vi.mocked(operatorService.createOperator).mock.calls
      expect(calls.length).toBeGreaterThan(0)
      expect(calls[0][0]).toEqual(createData)
      expect(result.current.data).toEqual(mockOperator)
    })
  })
})
