import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { GarageDetailPage } from './GarageDetailPage'
import * as garageHooks from '@/hooks/useGarages'
import * as repairHooks from '@/hooks/useRepairs'

vi.mock('@/hooks/useGarages')
vi.mock('@/hooks/useRepairs')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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

const mockRepairs = [
  {
    id: 1,
    carId: 1,
    garageId: 1,
    accidentId: null,
    repairType: 'maintenance' as const,
    description: 'Révision générale',
    startDate: '2024-01-20T00:00:00Z',
    endDate: '2024-01-22T00:00:00Z',
    cost: 500.0,
    status: 'completed' as const,
    invoiceNumber: 'INV-001',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
  },
]

describe('GarageDetailPage', () => {
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
    window.history.pushState({}, '', '/garages/1')

    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/garages/:id" element={<GarageDetailPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  it('renders garage details', async () => {
    vi.mocked(garageHooks.useGarage).mockReturnValue({
      data: mockGarage,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(garageHooks.useUpdateGarage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(repairHooks.useRepairs).mockReturnValue({
      data: { repairs: mockRepairs, totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('Garage Test')).toBeInTheDocument()
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('0123456789')).toBeInTheDocument()
    expect(screen.getByText('123 Rue Test')).toBeInTheDocument()
    expect(screen.getByText('Mécanique générale')).toBeInTheDocument()
  })

  it('shows loading spinner while fetching', () => {
    vi.mocked(garageHooks.useGarage).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    vi.mocked(garageHooks.useUpdateGarage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(repairHooks.useRepairs).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
  })

  it('shows error message when garage not found', () => {
    vi.mocked(garageHooks.useGarage).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    } as any)

    vi.mocked(garageHooks.useUpdateGarage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(repairHooks.useRepairs).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    expect(screen.getByText(/garage introuvable/i)).toBeInTheDocument()
  })

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(garageHooks.useGarage).mockReturnValue({
      data: mockGarage,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(garageHooks.useUpdateGarage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(repairHooks.useRepairs).mockReturnValue({
      data: { repairs: [], totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('Garage Test')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    expect(mockNavigate).toHaveBeenCalledWith('/garages/1/edit')
  })

  it('toggles garage status', async () => {
    const user = userEvent.setup()
    const toggleStatusMock = vi.fn().mockResolvedValue({})

    vi.mocked(garageHooks.useGarage).mockReturnValue({
      data: mockGarage,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(garageHooks.useUpdateGarage).mockReturnValue({
      mutateAsync: toggleStatusMock,
      isPending: false,
    } as any)

    vi.mocked(repairHooks.useRepairs).mockReturnValue({
      data: { repairs: [], totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('Garage Test')).toBeInTheDocument()
    })

    const toggleButton = screen.getByRole('button', { name: /désactiver/i })
    await user.click(toggleButton)

    expect(toggleStatusMock).toHaveBeenCalledWith({
      id: mockGarage.id,
      data: { ...mockGarage, isActive: false },
    })
  })

  it('displays related repairs', async () => {
    vi.mocked(garageHooks.useGarage).mockReturnValue({
      data: mockGarage,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(garageHooks.useUpdateGarage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(repairHooks.useRepairs).mockReturnValue({
      data: { repairs: mockRepairs, totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('Garage Test')).toBeInTheDocument()
    })

    expect(screen.getByText('1 réparation(s)')).toBeInTheDocument()
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
  })

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(garageHooks.useGarage).mockReturnValue({
      data: mockGarage,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(garageHooks.useUpdateGarage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(repairHooks.useRepairs).mockReturnValue({
      data: { repairs: [], totalPages: 1 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('Garage Test')).toBeInTheDocument()
    })

    const backButton = screen.getByRole('button', { name: /retour/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/garages')
  })
})
