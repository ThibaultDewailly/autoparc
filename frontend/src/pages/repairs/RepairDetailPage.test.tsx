import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RepairDetailPage } from './RepairDetailPage'
import * as repairHooks from '@/hooks/useRepairs'
import * as carHooks from '@/hooks/useCars'
import * as garageHooks from '@/hooks/useGarages'
import * as accidentHooks from '@/hooks/useAccidents'

vi.mock('@/hooks/useRepairs')
vi.mock('@/hooks/useCars')
vi.mock('@/hooks/useGarages')
vi.mock('@/hooks/useAccidents')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockCar = {
  id: 1,
  licensePlate: 'AB-123-CD',
  brand: 'Toyota',
  model: 'Corolla',
  greyCardNumber: 'GC123456',
  insuranceCompanyId: 1,
  rentalStartDate: '2024-01-01T00:00:00Z',
  status: 'active' as const,
  isActive: true,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
}

const mockGarage = {
  id: 1,
  name: 'Garage Test',
  address: '123 Rue Test',
  phone: '0123456789',
  contactPerson: 'John Doe',
  specialization: 'Mécanique générale',
  isActive: true,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

const mockRepair = {
  id: 1,
  carId: 1,
  garageId: 1,
  accidentId: null,
  repairType: 'maintenance' as const,
  description: 'Révision générale',
  startDate: '2024-01-20T00:00:00Z',
  endDate: '2024-01-22T00:00:00Z',
  cost: 500.0,
  status: 'scheduled' as const,
  invoiceNumber: 'INV-001',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

describe('RepairDetailPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    mockNavigate.mockClear()
  })

  function renderWithProviders() {
    window.history.pushState({}, '', '/repairs/1')

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/repairs/:id" element={<RepairDetailPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  it('renders repair details', async () => {
    vi.mocked(repairHooks.useRepair).mockReturnValue({
      data: mockRepair,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(repairHooks.useUpdateRepairStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [mockCar],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(garageHooks.useGarages).mockReturnValue({
      data: { garages: [mockGarage], totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useAccidents).mockReturnValue({
      data: { accidents: [], totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    })

    expect(screen.getByText('Garage Test')).toBeInTheDocument()
    expect(screen.getByText('Révision générale')).toBeInTheDocument()
    expect(screen.getByText('500 €')).toBeInTheDocument()
  })

  it('shows loading spinner while fetching', () => {
    vi.mocked(repairHooks.useRepair).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    vi.mocked(repairHooks.useUpdateRepairStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(garageHooks.useGarages).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useAccidents).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
  })

  it('shows error message when repair not found', () => {
    vi.mocked(repairHooks.useRepair).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    } as any)

    vi.mocked(repairHooks.useUpdateRepairStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(garageHooks.useGarages).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useAccidents).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    expect(screen.getByText(/réparation introuvable/i)).toBeInTheDocument()
  })

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(repairHooks.useRepair).mockReturnValue({
      data: mockRepair,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(repairHooks.useUpdateRepairStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [mockCar],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(garageHooks.useGarages).mockReturnValue({
      data: { garages: [mockGarage], totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useAccidents).mockReturnValue({
      data: { accidents: [], totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    expect(mockNavigate).toHaveBeenCalledWith('/repairs/1/edit')
  })

  it('updates repair status', async () => {
    const user = userEvent.setup()
    const updateStatusMock = vi.fn().mockResolvedValue({})

    vi.mocked(repairHooks.useRepair).mockReturnValue({
      data: mockRepair,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(repairHooks.useUpdateRepairStatus).mockReturnValue({
      mutateAsync: updateStatusMock,
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [mockCar],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(garageHooks.useGarages).mockReturnValue({
      data: { garages: [mockGarage], totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useAccidents).mockReturnValue({
      data: { accidents: [], totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    })

    const statusButton = screen.getByRole('button', { name: /en cours/i })
    await user.click(statusButton)

    expect(updateStatusMock).toHaveBeenCalledWith({ id: 1, status: 'in_progress' })
  })

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(repairHooks.useRepair).mockReturnValue({
      data: mockRepair,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(repairHooks.useUpdateRepairStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [mockCar],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(garageHooks.useGarages).mockReturnValue({
      data: { garages: [mockGarage], totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useAccidents).mockReturnValue({
      data: { accidents: [], totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    })

    const backButton = screen.getByRole('button', { name: /retour/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/repairs')
  })
})
