import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GarageNewPage } from './GarageNewPage'
import * as useGaragesHook from '@/hooks/useGarages'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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

describe('GarageNewPage', () => {
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useGaragesHook, 'useCreateGarage').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)
  })

  it('renders page title', () => {
    renderWithProviders(<GarageNewPage />)

    expect(screen.getByText(/ajouter un garage/i)).toBeInTheDocument()
  })

  it('renders garage form', () => {
    renderWithProviders(<GarageNewPage />)

    expect(screen.getByLabelText(/nom du garage/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/téléphone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/adresse/i)).toBeInTheDocument()
  })

  it('creates garage and navigates on submit', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue({ id: 1 })
    renderWithProviders(<GarageNewPage />)

    const nameInput = screen.getByLabelText(/nom du garage/i)
    await user.type(nameInput, 'Garage Test')

    const phoneInput = screen.getByLabelText(/téléphone/i)
    await user.type(phoneInput, '0123456789')

    const addressInput = screen.getByLabelText(/adresse/i)
    await user.type(addressInput, '123 Rue Test')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Garage Test',
        phone: '0123456789',
        address: '123 Rue Test',
        contactPerson: undefined,
        email: undefined,
        specialization: undefined,
      })
      expect(mockNavigate).toHaveBeenCalledWith('/garages')
    })
  })

  it('navigates back on cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GarageNewPage />)

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith('/garages')
  })

  it('shows loading state during submission', () => {
    vi.spyOn(useGaragesHook, 'useCreateGarage').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any)

    renderWithProviders(<GarageNewPage />)

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    expect(submitButton).toHaveAttribute('data-loading', 'true')
  })
})
