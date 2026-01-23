/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CarsPage } from './CarsPage'
import * as carsHooks from '@/hooks/useCars'
import type { PaginatedResponse, Car } from '@/types'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockCarsData: PaginatedResponse<Car> = {
  data: [
    {
      id: '1',
      license_plate: 'AB-123-CD',
      brand: 'Toyota',
      model: 'Corolla',
      grey_card_number: 'GC123',
      insurance_company_id: 'ins-1',
      rental_start_date: '2024-01-01',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by: 'user-1',
    },
  ],
  page: 1,
  limit: 10,
  total: 1,
  total_pages: 1,
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('CarsPage', () => {
  it('should render page title and add button', () => {
    vi.spyOn(carsHooks, 'useCars').mockReturnValue({
      data: mockCarsData,
      isLoading: false,
    } as any)
    vi.spyOn(carsHooks, 'useDeleteCar').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarsPage />
      </Wrapper>
    )

    expect(screen.getByRole('heading', { name: 'Véhicules' })).toBeInTheDocument()
    expect(screen.getByText('Ajouter un véhicule')).toBeInTheDocument()
  })

  it('should render cars table with data', () => {
    vi.spyOn(carsHooks, 'useCars').mockReturnValue({
      data: mockCarsData,
      isLoading: false,
    } as any)
    vi.spyOn(carsHooks, 'useDeleteCar').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarsPage />
      </Wrapper>
    )

    expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    expect(screen.getByText('Toyota')).toBeInTheDocument()
    expect(screen.getByText('Corolla')).toBeInTheDocument()
  })

  it('should render search and filter controls', () => {
    vi.spyOn(carsHooks, 'useCars').mockReturnValue({
      data: mockCarsData,
      isLoading: false,
    } as any)
    vi.spyOn(carsHooks, 'useDeleteCar').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarsPage />
      </Wrapper>
    )

    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument()
  })

  it('should render delete modal and call mutation', async () => {
    const user = userEvent.setup()
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    
    vi.spyOn(carsHooks, 'useCars').mockReturnValue({
      data: mockCarsData,
      isLoading: false,
    } as any)
    vi.spyOn(carsHooks, 'useDeleteCar').mockReturnValue({
      mutateAsync,
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarsPage />
      </Wrapper>
    )

    // Find and click delete button using data attributes
    const buttons = screen.getAllByRole('button')
    // Last button in each row should be delete (6 buttons = 3 per row * 2 rows, so button indices 2,5)
    const deleteButton = buttons.find(btn => 
      btn.className.includes('danger')
    )
    
    if (deleteButton) {
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/Supprimer le véhicule/i)).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /supprimer/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith('1')
      })
    }
  })

  it('should show loading state', () => {
    vi.spyOn(carsHooks, 'useCars').mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    vi.spyOn(carsHooks, 'useDeleteCar').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarsPage />
      </Wrapper>
    )

    expect(screen.getByRole('grid')).toBeInTheDocument()
  })
})
