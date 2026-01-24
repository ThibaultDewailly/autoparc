/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCars, useCar, useCreateCar, useUpdateCar, useDeleteCar } from './useCars'
import * as carService from '@/services/carService'

vi.mock('@/services/carService')

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

describe('useCars', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch cars', async () => {
    const mockData = {
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0,
    }
    
    vi.mocked(carService.getCars).mockResolvedValue(mockData)

    const { result } = renderHook(() => useCars(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockData)
  })

  it('should fetch cars with params', async () => {
    const mockData = {
      data: [],
      page: 2,
      limit: 10,
      total: 50,
      total_pages: 5,
    }
    
    vi.mocked(carService.getCars).mockResolvedValue(mockData)

    const { result } = renderHook(() => useCars({ page: 2, limit: 10 }), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(carService.getCars).toHaveBeenCalledWith({ page: 2, limit: 10 })
  })
})

describe('useCar', () => {
  it('should fetch single car', async () => {
    const mockCar = {
      id: '123',
      licensePlate: 'AB-123-CD',
      brand: 'Toyota',
      model: 'Corolla',
      status: 'active' as const,
    }
    
    vi.mocked(carService.getCar).mockResolvedValue(mockCar as any)

    const { result } = renderHook(() => useCar('123'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCar)
  })

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useCar(undefined), { wrapper: createWrapper() })

    expect(result.current.isFetching).toBe(false)
  })
})

describe('useCreateCar', () => {
  it('should create car', async () => {
    const newCar = {
      licensePlate: 'AB-123-CD',
      brand: 'Toyota',
      model: 'Corolla',
      greyCardNumber: 'GC123',
      insuranceCompanyId: 'ins-1',
      rentalStartDate: '2024-01-01',
      status: 'active' as const,
    }
    
    vi.mocked(carService.createCar).mockResolvedValue({ id: '123', ...newCar } as any)

    const { result } = renderHook(() => useCreateCar(), { wrapper: createWrapper() })

    result.current.mutate(newCar)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(carService.createCar).toHaveBeenCalled()
    expect(vi.mocked(carService.createCar).mock.calls[0][0]).toEqual(newCar)
  })
})

describe('useUpdateCar', () => {
  it('should update car', async () => {
    const updateData = {
      brand: 'Honda',
      status: 'maintenance' as const,
    }
    
    vi.mocked(carService.updateCar).mockResolvedValue({ id: '123', ...updateData } as any)

    const { result } = renderHook(() => useUpdateCar(), { wrapper: createWrapper() })

    result.current.mutate({ id: '123', data: updateData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(carService.updateCar).toHaveBeenCalled()
    const call = vi.mocked(carService.updateCar).mock.calls[0]
    expect(call[0]).toBe('123')
    expect(call[1]).toEqual(updateData)
  })
})

describe('useDeleteCar', () => {
  it('should delete car', async () => {
    vi.mocked(carService.deleteCar).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteCar(), { wrapper: createWrapper() })

    result.current.mutate('123')

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(carService.deleteCar).toHaveBeenCalled()
    expect(vi.mocked(carService.deleteCar).mock.calls[0][0]).toBe('123')
  })
})
