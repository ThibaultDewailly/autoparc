import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RepairNewPage } from './RepairNewPage'
import * as useRepairsHook from '@/hooks/useRepairs'
import * as useCarsHook from '@/hooks/useCars'
import * as useGaragesHook from '@/hooks/useGarages'
import * as useAccidentsHook from '@/hooks/useAccidents'
import type { Car, Garage } from '@/types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('RepairNewPage', () => {
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(useCarsHook, 'useCars').mockReturnValue({
      data: mockCars,
    } as any)

    vi.spyOn(useGaragesHook, 'useGarages').mockReturnValue({
      data: { garages: mockGarages, total: 1 },
    } as any)

    vi.spyOn(useAccidentsHook, 'useAccidents').mockReturnValue({
      data: { accidents: [], total: 0 },
    } as any)

    vi.spyOn(useRepairsHook, 'useCreateRepair').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)
  })

  it('renders page title', () => {
    renderWithProviders(<RepairNewPage />)

    expect(screen.getByText(/ajouter une réparation/i)).toBeInTheDocument()
  })

  it('renders repair form with data', () => {
    renderWithProviders(<RepairNewPage />)

    expect(screen.getByRole('button', { name: /sélectionner un véhicule/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sélectionner un garage/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sélectionner un type/i })).toBeInTheDocument()
  })

  it('navigates back on cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RepairNewPage />)

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith('/repairs')
  })

  it('shows loading state during submission', () => {
    vi.spyOn(useRepairsHook, 'useCreateRepair').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any)

    renderWithProviders(<RepairNewPage />)

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    expect(submitButton).toHaveAttribute('data-loading', 'true')
  })
})
