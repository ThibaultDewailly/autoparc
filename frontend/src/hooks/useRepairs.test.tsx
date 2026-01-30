import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useRepairs,
  useRepair,
  useRepairsByCar,
  useRepairsByAccident,
  useRepairsByGarage,
  useCreateRepair,
  useUpdateRepair,
  useDeleteRepair,
  useUpdateRepairStatus,
} from './useRepairs'
import * as repairService from '@/services/repairService'

vi.mock('@/services/repairService')

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

describe('useRepairs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch repairs', async () => {
    const mockData = { repairs: [], total: 0, page: 1, limit: 10 }
    vi.mocked(repairService.getRepairs).mockResolvedValue(mockData)

    const { result } = renderHook(() => useRepairs(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockData)
  })

  it('should fetch repairs with filters', async () => {
    const mockData = { repairs: [], total: 0, page: 1, limit: 10 }
    vi.mocked(repairService.getRepairs).mockResolvedValue(mockData)

    const { result } = renderHook(() => useRepairs({ status: 'completed' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(repairService.getRepairs).toHaveBeenCalledWith({ status: 'completed' })
  })
})

describe('useRepair', () => {
  it('should fetch single repair', async () => {
    const mockRepair = {
      id: '1',
      carId: '1',
      garageId: '1',
      repairType: 'maintenance' as const,
      description: 'Test repair',
      status: 'scheduled' as const,
    }
    vi.mocked(repairService.getRepair).mockResolvedValue(mockRepair as any)

    const { result } = renderHook(() => useRepair('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockRepair)
  })

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useRepair(undefined), { wrapper: createWrapper() })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useRepairsByCar', () => {
  it('should fetch repairs by car', async () => {
    const mockRepairs = [{ id: '1', carId: '1' }]
    vi.mocked(repairService.getRepairsByCar).mockResolvedValue(mockRepairs as any)

    const { result } = renderHook(() => useRepairsByCar('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockRepairs)
  })

  it('should not fetch when carId is undefined', () => {
    const { result } = renderHook(() => useRepairsByCar(undefined), { wrapper: createWrapper() })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useRepairsByAccident', () => {
  it('should fetch repairs by accident', async () => {
    const mockRepairs = [{ id: '1', accidentId: '1' }]
    vi.mocked(repairService.getRepairsByAccident).mockResolvedValue(mockRepairs as any)

    const { result } = renderHook(() => useRepairsByAccident('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockRepairs)
  })

  it('should not fetch when accidentId is undefined', () => {
    const { result } = renderHook(() => useRepairsByAccident(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useRepairsByGarage', () => {
  it('should fetch repairs by garage', async () => {
    const mockRepairs = [{ id: '1', garageId: '1' }]
    vi.mocked(repairService.getRepairsByGarage).mockResolvedValue(mockRepairs as any)

    const { result } = renderHook(() => useRepairsByGarage('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockRepairs)
  })

  it('should not fetch when garageId is undefined', () => {
    const { result } = renderHook(() => useRepairsByGarage(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateRepair', () => {
  it('should create repair', async () => {
    const mockRepair = { id: '1', carId: '1', garageId: '1' }
    vi.mocked(repairService.createRepair).mockResolvedValue(mockRepair as any)

    const { result } = renderHook(() => useCreateRepair(), { wrapper: createWrapper() })

    const repairData = {
      carId: '1',
      garageId: '1',
      repairType: 'maintenance' as const,
      description: 'Test repair',
      startDate: '2024-01-15',
    }

    await result.current.mutateAsync(repairData)

    expect(repairService.createRepair).toHaveBeenCalledWith(repairData)
  })
})

describe('useUpdateRepair', () => {
  it('should update repair', async () => {
    vi.mocked(repairService.updateRepair).mockResolvedValue({} as any)

    const { result } = renderHook(() => useUpdateRepair(), { wrapper: createWrapper() })

    const updateData = { description: 'Updated description' }

    await result.current.mutateAsync({ id: '1', data: updateData })

    expect(repairService.updateRepair).toHaveBeenCalledWith('1', updateData)
  })
})

describe('useDeleteRepair', () => {
  it('should delete repair', async () => {
    vi.mocked(repairService.deleteRepair).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteRepair(), { wrapper: createWrapper() })

    await result.current.mutateAsync('1')

    expect(repairService.deleteRepair).toHaveBeenCalledWith('1')
  })
})

describe('useUpdateRepairStatus', () => {
  it('should update repair status', async () => {
    vi.mocked(repairService.updateRepairStatus).mockResolvedValue({} as any)

    const { result } = renderHook(() => useUpdateRepairStatus(), { wrapper: createWrapper() })

    await result.current.mutateAsync({ id: '1', status: 'completed' })

    expect(repairService.updateRepairStatus).toHaveBeenCalledWith('1', 'completed')
  })
})
