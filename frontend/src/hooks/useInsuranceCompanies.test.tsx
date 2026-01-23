/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useInsuranceCompanies } from './useInsuranceCompanies'
import * as insuranceService from '@/services/insuranceService'

vi.mock('@/services/insuranceService')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  
  return function Wrapper({ children }: { children: any }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useInsuranceCompanies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch insurance companies', async () => {
    const mockCompanies = [
      {
        id: '1',
        name: 'AXA',
        contact_person: 'John Doe',
        phone: '0123456789',
        email: 'contact@axa.fr',
        policy_number: 'POL123',
        address: '123 Rue Test',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Allianz',
        contact_person: 'Jane Smith',
        phone: '0987654321',
        email: 'contact@allianz.fr',
        policy_number: 'POL456',
        address: '456 Rue Test',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]
    
    vi.mocked(insuranceService.getInsuranceCompanies).mockResolvedValue(mockCompanies)

    const { result } = renderHook(() => useInsuranceCompanies(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCompanies)
    expect(insuranceService.getInsuranceCompanies).toHaveBeenCalled()
  })

  it('should handle error when fetching insurance companies', async () => {
    vi.mocked(insuranceService.getInsuranceCompanies).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useInsuranceCompanies(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
  })
})
