import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { AccidentNewPage } from './AccidentNewPage'
import * as useAccidentsHook from '@/hooks/useAccidents'
import * as useCarsHook from '@/hooks/useCars'
import type { Car } from '@/types'

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
    id: '1',
    brand: 'Renault',
    model: 'Clio',
    licensePlate: 'AB-123-CD',
    greyCardNumber: 'GC123456',
    insuranceCompanyId: '1',
    rentalStartDate: '2020-01-01',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: '1',
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
      <AuthProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('AccidentNewPage', () => {
  const mockCreateMutateAsync = vi.fn()
  const mockUploadMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(useCarsHook, 'useCars').mockReturnValue({
      data: mockCars,
    } as any)

    vi.spyOn(useAccidentsHook, 'useCreateAccident').mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    } as any)

    vi.spyOn(useAccidentsHook, 'useUploadPhoto').mockReturnValue({
      mutateAsync: mockUploadMutateAsync,
      isPending: false,
    } as any)
  })

  it('renders page title', () => {
    renderWithProviders(<AccidentNewPage />)

    expect(screen.getByText(/ajouter un accident/i)).toBeInTheDocument()
  })

  it('renders accident form', () => {
    renderWithProviders(<AccidentNewPage />)

    expect(screen.getByRole('button', { name: /sélectionner un véhicule/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/date de l'accident/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lieu/i)).toBeInTheDocument()
  })

  it('creates accident without photos and navigates', async () => {
    const user = userEvent.setup()
    mockCreateMutateAsync.mockResolvedValue({ id: 1 })
    renderWithProviders(<AccidentNewPage />)

    const carSelect = screen.getByRole('button', { name: /sélectionner un véhicule/i })
    await user.click(carSelect)
    const carOption = await screen.findByText(/Renault Clio - AB-123-CD/i)
    await user.click(carOption)

    const dateInput = screen.getByLabelText(/date de l'accident/i)
    await user.type(dateInput, '2024-01-15')

    const locationInput = screen.getByLabelText(/lieu/i)
    await user.type(locationInput, 'Paris')

    const descriptionInput = screen.getByPlaceholderText(/description détaillée de l'accident/i)
    await user.type(descriptionInput, 'Test accident')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        carId: 1,
        accidentDate: '2024-01-15',
        location: 'Paris',
        description: 'Test accident',
        damagesDescription: undefined,
        responsibleParty: undefined,
        policeReportNumber: undefined,
        insuranceClaimNumber: undefined,
      })
      expect(mockUploadMutateAsync).not.toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/accidents')
    })
  })

  it('navigates back on cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AccidentNewPage />)

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith('/accidents')
  })

  it('shows loading state during submission', () => {
    vi.spyOn(useAccidentsHook, 'useCreateAccident').mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: true,
    } as any)

    renderWithProviders(<AccidentNewPage />)

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    expect(submitButton).toHaveAttribute('data-loading', 'true')
  })
})
