 
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardPage } from './DashboardPage'
import * as AuthContextModule from '@/contexts/AuthContext'
import * as carsHooks from '@/hooks/useCars'
import type { PaginatedResponse, Car } from '@/types'

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

const mockTotalData: PaginatedResponse<Car> = {
  cars: [],
  page: 1,
  limit: 1,
  totalCount: 101,
  totalPages: 101,
}

const mockActiveData: PaginatedResponse<Car> = {
  cars: [],
  page: 1,
  limit: 1,
  totalCount: 85,
  totalPages: 85,
}

const mockMaintenanceData: PaginatedResponse<Car> = {
  cars: [],
  page: 1,
  limit: 1,
  totalCount: 12,
  totalPages: 12,
}

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext')
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

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

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render welcome message', () => {
    vi.spyOn(carsHooks, 'useCars').mockReturnValue({
      data: mockTotalData,
      isLoading: false,
    } as any)

    renderDashboardPage()
    expect(screen.getByText(/Bienvenue/i)).toBeInTheDocument()
    expect(screen.getByText(/Gestion des Véhicules/i)).toBeInTheDocument()
  })

  it('should render search bar', () => {
    vi.spyOn(carsHooks, 'useCars').mockReturnValue({
      data: mockTotalData,
      isLoading: false,
    } as any)

    renderDashboardPage()
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument()
  })

  it('should render link to cars page', () => {
    vi.spyOn(carsHooks, 'useCars').mockReturnValue({
      data: mockTotalData,
      isLoading: false,
    } as any)

    renderDashboardPage()
    const link = screen.getByText(/Voir tous les véhicules/i)
    expect(link.closest('a')).toHaveAttribute('href', '/cars')
  })
  
  it('should display navbar', () => {
    vi.spyOn(carsHooks, 'useCars').mockReturnValue({
      data: mockTotalData,
      isLoading: false,
    } as any)

    renderDashboardPage()
    expect(screen.getByText('AutoParc')).toBeInTheDocument()
  })

  describe('Statistics Cards', () => {
    it('should display total vehicles statistic', () => {
      vi.spyOn(carsHooks, 'useCars').mockImplementation((params) => {
        if (!params?.status) {
          return { data: mockTotalData, isLoading: false } as any
        }
        return { data: undefined, isLoading: false } as any
      })

      renderDashboardPage()
      
      expect(screen.getByText('101')).toBeInTheDocument()
      expect(screen.getByText(/Total de véhicules/i)).toBeInTheDocument()
    })

    it('should display active vehicles statistic', () => {
      vi.spyOn(carsHooks, 'useCars').mockImplementation((params) => {
        if (params?.status === 'active') {
          return { data: mockActiveData, isLoading: false } as any
        }
        if (!params?.status) {
          return { data: mockTotalData, isLoading: false } as any
        }
        return { data: undefined, isLoading: false } as any
      })

      renderDashboardPage()
      
      expect(screen.getByText('85')).toBeInTheDocument()
      expect(screen.getByText(/Véhicules actifs/i)).toBeInTheDocument()
    })

    it('should display maintenance vehicles statistic', () => {
      vi.spyOn(carsHooks, 'useCars').mockImplementation((params) => {
        if (params?.status === 'maintenance') {
          return { data: mockMaintenanceData, isLoading: false } as any
        }
        if (params?.status === 'active') {
          return { data: mockActiveData, isLoading: false } as any
        }
        if (!params?.status) {
          return { data: mockTotalData, isLoading: false } as any
        }
        return { data: undefined, isLoading: false } as any
      })

      renderDashboardPage()
      
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText(/Véhicules en maintenance/i)).toBeInTheDocument()
    })

    it('should make three separate API calls with correct filters', () => {
      const useCarsSpy = vi.spyOn(carsHooks, 'useCars').mockReturnValue({
        data: mockTotalData,
        isLoading: false,
      } as any)

      renderDashboardPage()
      
      // Should call useCars three times: total, active, maintenance
      expect(useCarsSpy).toHaveBeenCalledTimes(3)
      expect(useCarsSpy).toHaveBeenCalledWith({ limit: 1 })
      expect(useCarsSpy).toHaveBeenCalledWith({ status: 'active', limit: 1 })
      expect(useCarsSpy).toHaveBeenCalledWith({ status: 'maintenance', limit: 1 })
    })

    it('should handle zero counts gracefully', () => {
      vi.spyOn(carsHooks, 'useCars').mockReturnValue({
        data: { ...mockTotalData, totalCount: 0 },
        isLoading: false,
      } as any)

      renderDashboardPage()
      
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Clickable Statistics Links', () => {
    it('should have clickable link for total vehicles', () => {
      vi.spyOn(carsHooks, 'useCars').mockReturnValue({
        data: mockTotalData,
        isLoading: false,
      } as any)

      renderDashboardPage()
      
      const totalCard = screen.getByText(/Total de véhicules/i).closest('a')
      expect(totalCard).toHaveAttribute('href', '/cars')
    })

    it('should have clickable link for active vehicles with status filter', () => {
      vi.spyOn(carsHooks, 'useCars').mockReturnValue({
        data: mockActiveData,
        isLoading: false,
      } as any)

      renderDashboardPage()
      
      const activeCard = screen.getByText(/Véhicules actifs/i).closest('a')
      expect(activeCard).toHaveAttribute('href', '/cars?status=active')
    })

    it('should have clickable link for maintenance vehicles with status filter', () => {
      vi.spyOn(carsHooks, 'useCars').mockReturnValue({
        data: mockMaintenanceData,
        isLoading: false,
      } as any)

      renderDashboardPage()
      
      const maintenanceCard = screen.getByText(/Véhicules en maintenance/i).closest('a')
      expect(maintenanceCard).toHaveAttribute('href', '/cars?status=maintenance')
    })
  })

  describe('Search functionality', () => {
    it('should navigate to cars page with search query when search is performed', async () => {
      const user = userEvent.setup()
      
      vi.spyOn(carsHooks, 'useCars').mockReturnValue({
        data: mockTotalData,
        isLoading: false,
      } as any)

      // Mock window.location.href
      delete (window as any).location
      window.location = { href: '' } as any

      renderDashboardPage()
      
      const searchInput = screen.getByPlaceholderText(/rechercher/i)
      const searchButton = screen.getAllByRole('button', { name: /rechercher/i })[0]
      
      await user.type(searchInput, 'AA-123-BB')
      await user.click(searchButton)
      
      await waitFor(() => {
        expect(window.location.href).toBe('/cars?search=AA-123-BB')
      })
    })

    it('should disable search button when input is empty', () => {
      vi.spyOn(carsHooks, 'useCars').mockReturnValue({
        data: mockTotalData,
        isLoading: false,
      } as any)

      renderDashboardPage()
      
      const searchButton = screen.getAllByRole('button', { name: /rechercher/i })[0]
      expect(searchButton).toBeDisabled()
    })
  })
})
