import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useGarages,
  useGarage,
  useSearchGarages,
  useCreateGarage,
  useUpdateGarage,
  useDeleteGarage,
} from './useGarages'
import * as garageService from '@/services/garageService'

vi.mock('@/services/garageService')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: any }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useGarages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch garages', async () => {
    const mockData = { garages: [], totalPages: 0, page: 1, limit: 10 }
    vi.mocked(garageService.getGarages).mockResolvedValue(mockData)

    const { result } = renderHook(() => useGarages(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockData)
  })

  it('should fetch garages with filters', async () => {
    const mockData = { garages: [], totalPages: 0, page: 1, limit: 10 }
    vi.mocked(garageService.getGarages).mockResolvedValue(mockData)

    const { result } = renderHook(() => useGarages({ search: 'test' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(garageService.getGarages).toHaveBeenCalledWith({ search: 'test' })
  })
})

describe('useGarage', () => {
  it('should fetch single garage', async () => {
    const mockGarage = {
      id: '1',
      name: 'Test Garage',
      phone: '0123456789',
      address: '123 Test St',
      isActive: true,
    }
    vi.mocked(garageService.getGarage).mockResolvedValue(mockGarage as any)

    const { result } = renderHook(() => useGarage('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockGarage)
  })

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useGarage(undefined), { wrapper: createWrapper() })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useSearchGarages', () => {
  it('should search garages', async () => {
    const mockGarages = [{ id: '1', name: 'Test Garage' }]
    vi.mocked(garageService.searchGarages).mockResolvedValue(mockGarages as any)

    const { result } = renderHook(() => useSearchGarages('test'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockGarages)
  })

  it('should not search when query is empty', () => {
    const { result } = renderHook(() => useSearchGarages(''), { wrapper: createWrapper() })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateGarage', () => {
  it('should create garage', async () => {
    const mockGarage = { id: '1', name: 'New Garage' }
    vi.mocked(garageService.createGarage).mockResolvedValue(mockGarage as any)

    const { result } = renderHook(() => useCreateGarage(), { wrapper: createWrapper() })

    const garageData = {
      name: 'New Garage',
      phone: '0123456789',
      address: '123 Test St',
    }

    await result.current.mutateAsync(garageData)

    expect(garageService.createGarage).toHaveBeenCalledWith(garageData)
  })
})

describe('useUpdateGarage', () => {
  it('should update garage', async () => {
    vi.mocked(garageService.updateGarage).mockResolvedValue({} as any)

    const { result } = renderHook(() => useUpdateGarage(), { wrapper: createWrapper() })

    const updateData = { name: 'Updated Name' }

    await result.current.mutateAsync({ id: '1', data: updateData })

    expect(garageService.updateGarage).toHaveBeenCalledWith('1', updateData)
  })
})

describe('useDeleteGarage', () => {
  it('should delete garage', async () => {
    vi.mocked(garageService.deleteGarage).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteGarage(), { wrapper: createWrapper() })

    await result.current.mutateAsync('1')

    expect(garageService.deleteGarage).toHaveBeenCalledWith('1')
  })
})
