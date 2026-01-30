import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAccidents,
  useAccident,
  useAccidentsByCar,
  useCreateAccident,
  useUpdateAccident,
  useDeleteAccident,
  useUpdateAccidentStatus,
  useAccidentPhotos,
  useUploadPhoto,
  useDeletePhoto,
} from './useAccidents'
import * as accidentService from '@/services/accidentService'

vi.mock('@/services/accidentService')

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

describe('useAccidents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch accidents', async () => {
    const mockData = { accidents: [], total: 0, page: 1, limit: 10 }
    vi.mocked(accidentService.getAccidents).mockResolvedValue(mockData)

    const { result } = renderHook(() => useAccidents(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockData)
  })

  it('should fetch accidents with filters', async () => {
    const mockData = { accidents: [], total: 0, page: 1, limit: 10 }
    vi.mocked(accidentService.getAccidents).mockResolvedValue(mockData)

    const { result } = renderHook(() => useAccidents({ status: 'declared' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(accidentService.getAccidents).toHaveBeenCalledWith({ status: 'declared' })
  })
})

describe('useAccident', () => {
  it('should fetch single accident', async () => {
    const mockAccident = {
      id: '1',
      carId: '1',
      accidentDate: '2024-01-15',
      location: 'Paris',
      description: 'Test',
      status: 'declared' as const,
    }
    vi.mocked(accidentService.getAccident).mockResolvedValue(mockAccident as any)

    const { result } = renderHook(() => useAccident('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockAccident)
  })

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useAccident(undefined), { wrapper: createWrapper() })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useAccidentsByCar', () => {
  it('should fetch accidents by car', async () => {
    const mockAccidents = [{ id: '1', carId: '1' }]
    vi.mocked(accidentService.getAccidentsByCar).mockResolvedValue(mockAccidents as any)

    const { result } = renderHook(() => useAccidentsByCar('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockAccidents)
  })

  it('should not fetch when carId is undefined', () => {
    const { result } = renderHook(() => useAccidentsByCar(undefined), { wrapper: createWrapper() })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateAccident', () => {
  it('should create accident', async () => {
    const mockAccident = { id: '1', carId: '1' }
    vi.mocked(accidentService.createAccident).mockResolvedValue(mockAccident as any)

    const { result } = renderHook(() => useCreateAccident(), { wrapper: createWrapper() })

    const accidentData = {
      carId: '1',
      accidentDate: '2024-01-15',
      location: 'Paris',
      description: 'Test',
    }

    await result.current.mutateAsync(accidentData)

    expect(accidentService.createAccident).toHaveBeenCalledWith(accidentData)
  })
})

describe('useUpdateAccident', () => {
  it('should update accident', async () => {
    vi.mocked(accidentService.updateAccident).mockResolvedValue({} as any)

    const { result } = renderHook(() => useUpdateAccident(), { wrapper: createWrapper() })

    const updateData = { location: 'Lyon' }

    await result.current.mutateAsync({ id: '1', data: updateData })

    expect(accidentService.updateAccident).toHaveBeenCalledWith('1', updateData)
  })
})

describe('useDeleteAccident', () => {
  it('should delete accident', async () => {
    vi.mocked(accidentService.deleteAccident).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteAccident(), { wrapper: createWrapper() })

    await result.current.mutateAsync('1')

    expect(accidentService.deleteAccident).toHaveBeenCalledWith('1')
  })
})

describe('useUpdateAccidentStatus', () => {
  it('should update accident status', async () => {
    vi.mocked(accidentService.updateAccidentStatus).mockResolvedValue({} as any)

    const { result } = renderHook(() => useUpdateAccidentStatus(), { wrapper: createWrapper() })

    await result.current.mutateAsync({ id: '1', status: 'under_review' })

    expect(accidentService.updateAccidentStatus).toHaveBeenCalledWith('1', 'under_review')
  })
})

describe('useAccidentPhotos', () => {
  it('should fetch accident photos', async () => {
    const mockPhotos = [{ id: '1', photoUrl: 'http://example.com/photo.jpg' }]
    vi.mocked(accidentService.getPhotos).mockResolvedValue(mockPhotos as any)

    const { result } = renderHook(() => useAccidentPhotos('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockPhotos)
  })

  it('should not fetch when accidentId is undefined', () => {
    const { result } = renderHook(() => useAccidentPhotos(undefined), { wrapper: createWrapper() })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useUploadPhoto', () => {
  it('should upload photo', async () => {
    const mockPhoto = { id: '1', photoUrl: 'http://example.com/photo.jpg' }
    vi.mocked(accidentService.uploadPhoto).mockResolvedValue(mockPhoto as any)

    const { result } = renderHook(() => useUploadPhoto(), { wrapper: createWrapper() })

    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })

    await result.current.mutateAsync({ accidentId: '1', file })

    expect(accidentService.uploadPhoto).toHaveBeenCalledWith('1', file, undefined)
  })
})

describe('useDeletePhoto', () => {
  it('should delete photo', async () => {
    vi.mocked(accidentService.deletePhoto).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeletePhoto(), { wrapper: createWrapper() })

    await result.current.mutateAsync({ accidentId: '1', photoId: '2' })

    expect(accidentService.deletePhoto).toHaveBeenCalledWith('1', '2')
  })
})
