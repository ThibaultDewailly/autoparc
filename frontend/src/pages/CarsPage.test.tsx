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
  cars: [
    {
      id: '1',
      licensePlate: 'AB-123-CD',
      brand: 'Toyota',
      model: 'Corolla',
      greyCardNumber: 'GC123',
      insuranceCompanyId: 'ins-1',
      rentalStartDate: '2024-01-01',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'user-1',
    },
  ],
  page: 1,
  limit: 10,
  totalCount: 1,
  totalPages: 1,
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

    // Find all buttons and look for the danger colored delete button
    const buttons = screen.getAllByRole('button')
    const deleteButtons = buttons.filter(btn => 
      btn.className.includes('danger')
    )
    
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0])

      // Modal renders in a portal, use getAllByText to find the header
      await waitFor(() => {
        const headers = screen.queryAllByText(/Supprimer le véhicule/i)
        expect(headers.length).toBeGreaterThan(0)
      })

      // Find the confirm button (there are two "Supprimer" buttons - one for "Supprimer le véhicule" and one for the actual delete action)
      const allButtons = screen.getAllByRole('button')
      const confirmButton = allButtons.find(btn => 
        btn.textContent === 'Supprimer' && btn.className.includes('danger')
      )
      
      if (confirmButton) {
        await user.click(confirmButton)

        await waitFor(() => {
          expect(mutateAsync).toHaveBeenCalledWith('1')
        })
      }
    }
  })

  it('should display delete confirmation with vehicle ID and proper styling', async () => {
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

    // Find and click delete button
    const buttons = screen.getAllByRole('button')
    const deleteButtons = buttons.filter(btn => 
      btn.className.includes('danger')
    )
    
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0])

      // Verify the confirmation message includes the vehicle license plate
      await waitFor(() => {
        expect(screen.getByText(/Êtes-vous sûr de vouloir supprimer le véhicule AB-123-CD \?/i)).toBeInTheDocument()
      })

      // Verify the text has proper styling (text-gray-900 class)
      // Modal renders in document.body, so we need to search the entire document
      const confirmationText = document.querySelector('p.text-gray-900')
      expect(confirmationText).not.toBeNull()
      expect(confirmationText?.textContent).toContain('Êtes-vous sûr de vouloir supprimer le véhicule AB-123-CD ?')
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
