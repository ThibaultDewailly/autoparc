 
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardPage } from './DashboardPage'
import * as AuthContextModule from '@/contexts/AuthContext'
import * as carService from '@/services/carService'
import type { PaginatedResponse, Car } from '@/types'

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext')
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

vi.mock('@/services/carService')

const mockUser = {
  id: '123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  )
}

function renderDashboardPage() {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })
  
  const Wrapper = createWrapper()
  return render(
    <Wrapper>
      <DashboardPage />
    </Wrapper>
  )
}

describe('DashboardPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Statistics API Integration', () => {
    it('should fetch and display all three statistics from API', async () => {
      const mockTotalResponse: PaginatedResponse<Car> = {
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 150,
        totalPages: 150,
      }

      const mockActiveResponse: PaginatedResponse<Car> = {
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 120,
        totalPages: 120,
      }

      const mockMaintenanceResponse: PaginatedResponse<Car> = {
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 25,
        totalPages: 25,
      }

      vi.mocked(carService.getCars).mockImplementation((params) => {
        if (params?.status === 'active') {
          return Promise.resolve(mockActiveResponse)
        }
        if (params?.status === 'maintenance') {
          return Promise.resolve(mockMaintenanceResponse)
        }
        return Promise.resolve(mockTotalResponse)
      })

      renderDashboardPage()

      // Wait for all API calls to complete
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
      })

      expect(screen.getByText('120')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
      
      // Verify correct API calls were made
      expect(carService.getCars).toHaveBeenCalledTimes(3)
      expect(carService.getCars).toHaveBeenCalledWith({ limit: 1 })
      expect(carService.getCars).toHaveBeenCalledWith({ status: 'active', limit: 1 })
      expect(carService.getCars).toHaveBeenCalledWith({ status: 'maintenance', limit: 1 })
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(carService.getCars).mockRejectedValue(new Error('API Error'))

      renderDashboardPage()

      // Should still render the page structure
      await waitFor(() => {
        expect(screen.getByText(/Bienvenue/i)).toBeInTheDocument()
      })

      // Should show 0 as fallback
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThanOrEqual(3)
    })

    it('should handle partial API failures', async () => {
      const mockTotalResponse: PaginatedResponse<Car> = {
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 100,
        totalPages: 100,
      }

      vi.mocked(carService.getCars).mockImplementation((params) => {
        if (params?.status === 'active') {
          return Promise.reject(new Error('Active API Error'))
        }
        if (params?.status === 'maintenance') {
          return Promise.reject(new Error('Maintenance API Error'))
        }
        return Promise.resolve(mockTotalResponse)
      })

      renderDashboardPage()

      // Should show total count but 0 for failed requests
      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument()
      })

      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle empty response data', async () => {
      vi.mocked(carService.getCars).mockResolvedValue({
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 0,
        totalPages: 0,
      })

      renderDashboardPage()

      await waitFor(() => {
        const zeros = screen.getAllByText('0')
        expect(zeros.length).toBeGreaterThanOrEqual(3)
      })
    })

    it('should handle missing totalCount field', async () => {
      vi.mocked(carService.getCars).mockResolvedValue({
        cars: [],
        page: 1,
        limit: 1,
        total: 50,
      } as any)

      renderDashboardPage()

      await waitFor(() => {
        const numbers = screen.getAllByText('50')
        expect(numbers.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('Real-time Statistics Updates', () => {
    it('should display updated statistics after data changes', async () => {
      const initialResponse: PaginatedResponse<Car> = {
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 100,
        totalPages: 100,
      }

      const updatedResponse: PaginatedResponse<Car> = {
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 105,
        totalPages: 105,
      }

      // First render shows initial data
      vi.mocked(carService.getCars).mockResolvedValue(initialResponse)

      const { rerender } = renderDashboardPage()

      await waitFor(() => {
        const numbers = screen.getAllByText('100')
        expect(numbers.length).toBeGreaterThanOrEqual(1)
      })

      // Simulate data update
      vi.mocked(carService.getCars).mockResolvedValue(updatedResponse)

      // Rerender with updated data
      const Wrapper = createWrapper()
      rerender(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      )

      await waitFor(() => {
        const numbers = screen.getAllByText('105')
        expect(numbers.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('Concurrent API Calls', () => {
    it('should make all three API calls concurrently', async () => {
      const callOrder: string[] = []

      vi.mocked(carService.getCars).mockImplementation((params) => {
        if (params?.status === 'active') {
          callOrder.push('active')
        } else if (params?.status === 'maintenance') {
          callOrder.push('maintenance')
        } else {
          callOrder.push('total')
        }

        return Promise.resolve({
          cars: [],
          page: 1,
          limit: 1,
          totalCount: 10,
          totalPages: 10,
        })
      })

      renderDashboardPage()

      await waitFor(() => {
        expect(carService.getCars).toHaveBeenCalledTimes(3)
      })

      // All three calls should have been initiated (order may vary due to concurrency)
      expect(callOrder).toContain('total')
      expect(callOrder).toContain('active')
      expect(callOrder).toContain('maintenance')
    })

    it('should not block rendering while API calls are in progress', async () => {
      let resolveTotal: any
      let resolveActive: any
      let resolveMaintenance: any

      vi.mocked(carService.getCars).mockImplementation((params) => {
        if (params?.status === 'active') {
          return new Promise((resolve) => {
            resolveActive = resolve
          })
        }
        if (params?.status === 'maintenance') {
          return new Promise((resolve) => {
            resolveMaintenance = resolve
          })
        }
        return new Promise((resolve) => {
          resolveTotal = resolve
        })
      })

      renderDashboardPage()

      // Page should render immediately even though API calls are pending
      expect(screen.getByText(/Bienvenue/i)).toBeInTheDocument()
      expect(screen.getByText(/Total de véhicules/i)).toBeInTheDocument()

      // Resolve API calls
      resolveTotal({
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 100,
        totalPages: 100,
      })

      resolveActive({
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 80,
        totalPages: 80,
      })

      resolveMaintenance({
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 15,
        totalPages: 15,
      })

      // Statistics should appear after resolution
      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('80')).toBeInTheDocument()
        expect(screen.getByText('15')).toBeInTheDocument()
      })
    })
  })

  describe('Query Invalidation', () => {
    it('should refetch statistics when query is invalidated', async () => {
      const firstResponse: PaginatedResponse<Car> = {
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 100,
        totalPages: 100,
      }

      const secondResponse: PaginatedResponse<Car> = {
        cars: [],
        page: 1,
        limit: 1,
        totalCount: 110,
        totalPages: 110,
      }

      let callCount = 0
      vi.mocked(carService.getCars).mockImplementation(() => {
        callCount++
        if (callCount <= 3) {
          return Promise.resolve(firstResponse)
        }
        return Promise.resolve(secondResponse)
      })

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </BrowserRouter>
      )

      vi.mocked(AuthContextModule.useAuth).mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
      })

      render(
        <Wrapper>
          <DashboardPage />
        </Wrapper>
      )

      await waitFor(() => {
        const numbers = screen.getAllByText('100')
        expect(numbers.length).toBeGreaterThanOrEqual(1)
      })

      // Invalidate queries to trigger refetch
      await queryClient.invalidateQueries({ queryKey: ['cars'] })

      // Should show updated data after refetch
      await waitFor(() => {
        const numbers = screen.getAllByText('110')
        expect(numbers.length).toBeGreaterThanOrEqual(1)
      })

      // Should have made 6 calls total (3 initial + 3 after invalidation)
      expect(callCount).toBe(6)
    })
  })
})
