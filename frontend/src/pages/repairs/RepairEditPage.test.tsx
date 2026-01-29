import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RepairEditPage } from './RepairEditPage'
import * as useRepairsHook from '@/hooks/useRepairs'
import * as useCarsHook from '@/hooks/useCars'
import * as useGaragesHook from '@/hooks/useGarages'
import * as useAccidentsHook from '@/hooks/useAccidents'
import type { Repair, Car, Garage } from '@/types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockRepair: Repair = {
  id: 1,
  carId: 1,
  garageId: 1,
  repairType: 'maintenance',
  description: 'Vidange moteur',
  estimatedCost: 150.0,
  startDate: '2024-01-20',
  status: 'scheduled',
  createdAt: '2024-01-20T00:00:00Z',
  updatedAt: '2024-01-20T00:00:00Z',
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

const mockGarages: Garage[] = [
  {
    id: 1,
    name: 'Garage Auto Pro',
    contactPerson: 'Jean Dupont',
    phone: '0123456789',
    address: '123 Rue Test',
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
          <Route path="/repairs/:id/edit" element={<RepairEditPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('RepairEditPage', () => {
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, '', '/repairs/1/edit')

    vi.spyOn(useRepairsHook, 'useRepair').mockReturnValue({
      data: mockRepair,
      isLoading: false,
      error: null,
    } as any)

    vi.spyOn(useCarsHook, 'useCars').mockReturnValue({
      data: mockCars,
    } as any)

    vi.spyOn(useGaragesHook, 'useGarages').mockReturnValue({
      data: { garages: mockGarages, total: 1 },
    } as any)

    vi.spyOn(useAccidentsHook, 'useAccidents').mockReturnValue({
      data: { accidents: [], total: 0 },
    } as any)

    vi.spyOn(useRepairsHook, 'useUpdateRepair').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)
  })

  it('renders page title', () => {
    renderWithProviders()

    expect(screen.getByText(/modifier la réparation/i)).toBeInTheDocument()
  })

  it('renders form with repair data', () => {
    renderWithProviders()

    expect(screen.getByDisplayValue('Vidange moteur')).toBeInTheDocument()
    expect(screen.getByDisplayValue('150')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-01-20')).toBeInTheDocument()
  })

  it('shows loading spinner while fetching', () => {
    vi.spyOn(useRepairsHook, 'useRepair').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithProviders()

    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()
  })

  it('shows error message when repair not found', () => {
    vi.spyOn(useRepairsHook, 'useRepair').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    } as any)

    renderWithProviders()

    expect(screen.getByText(/réparation non trouvée/i)).toBeInTheDocument()
  })

  it('updates repair and navigates on submit', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue({ id: 1 })
    renderWithProviders()

    const descriptionInput = screen.getByDisplayValue('Vidange moteur')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Vidange et filtre')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 1,
        data: expect.objectContaining({
          description: 'Vidange et filtre',
        }),
      })
      expect(mockNavigate).toHaveBeenCalledWith('/repairs')
    })
  })

  it('navigates back on cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith('/repairs')
  })

  it('shows loading state during update', () => {
    vi.spyOn(useRepairsHook, 'useUpdateRepair').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any)

    renderWithProviders()

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    expect(submitButton).toHaveAttribute('data-loading', 'true')
  })
})
