import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AccidentEditPage } from './AccidentEditPage'
import * as useAccidentsHook from '@/hooks/useAccidents'
import * as useCarsHook from '@/hooks/useCars'
import type { Accident, Car } from '@/types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockAccident: Accident = {
  id: 1,
  carId: 1,
  accidentDate: '2024-01-15',
  location: 'Paris, France',
  description: 'Accident de stationnement',
  damagesDescription: 'Pare-choc endommagé',
  status: 'declared',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
}

const mockCars: Car[] = [
  {
    id: 1,
    brand: 'Renault',
    model: 'Clio',
    licensePlate: 'AB-123-CD',
    vin: 'VF1RH123456789012',
    category: 'urban',
    mileage: 50000,
    acquisitionDate: '2020-01-01',
    status: 'available',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/accidents/:id/edit" element={<AccidentEditPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('AccidentEditPage', () => {
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, '', '/accidents/1/edit')

    vi.spyOn(useAccidentsHook, 'useAccident').mockReturnValue({
      data: mockAccident,
      isLoading: false,
      error: null,
    } as any)

    vi.spyOn(useCarsHook, 'useCars').mockReturnValue({
      data: mockCars,
    } as any)

    vi.spyOn(useAccidentsHook, 'useUpdateAccident').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)
  })

  it('renders page title', () => {
    renderWithProviders()

    expect(screen.getByText(/modifier l'accident/i)).toBeInTheDocument()
  })

  it('renders form with accident data', () => {
    renderWithProviders()

    expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Paris, France')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Accident de stationnement')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Pare-choc endommagé')).toBeInTheDocument()
  })

  it('shows loading spinner while fetching', () => {
    vi.spyOn(useAccidentsHook, 'useAccident').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithProviders()

    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()
  })

  it('shows error message when accident not found', () => {
    vi.spyOn(useAccidentsHook, 'useAccident').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    } as any)

    renderWithProviders()

    expect(screen.getByText(/accident non trouvé/i)).toBeInTheDocument()
  })

  it('updates accident and navigates on submit', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue({ id: 1 })
    renderWithProviders()

    const locationInput = screen.getByDisplayValue('Paris, France')
    await user.clear(locationInput)
    await user.type(locationInput, 'Lyon, France')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 1,
        data: expect.objectContaining({
          location: 'Lyon, France',
        }),
      })
      expect(mockNavigate).toHaveBeenCalledWith('/accidents')
    })
  })

  it('navigates back on cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith('/accidents')
  })

  it('shows loading state during update', () => {
    vi.spyOn(useAccidentsHook, 'useUpdateAccident').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any)

    renderWithProviders()

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    expect(submitButton).toHaveAttribute('data-loading', 'true')
  })
})
