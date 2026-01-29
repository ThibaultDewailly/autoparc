import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GarageEditPage } from './GarageEditPage'
import * as useGaragesHook from '@/hooks/useGarages'
import type { Garage } from '@/types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockGarage: Garage = {
  id: 1,
  name: 'Garage Test',
  contactPerson: 'Jean Dupont',
  phone: '0123456789',
  email: 'test@garage.com',
  address: '123 Rue Test',
  specialization: 'Carrosserie',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

function renderWithProviders(_initialRoute = '/garages/1/edit') {
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
          <Route path="/garages/:id/edit" element={<GarageEditPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>,
    { wrapper: ({ children }) => <div>{children}</div> }
  )
}

describe('GarageEditPage', () => {
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, '', '/garages/1/edit')

    vi.spyOn(useGaragesHook, 'useGarage').mockReturnValue({
      data: mockGarage,
      isLoading: false,
      error: null,
    } as any)

    vi.spyOn(useGaragesHook, 'useUpdateGarage').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)
  })

  it('renders page title', () => {
    renderWithProviders()

    expect(screen.getByText(/modifier le garage/i)).toBeInTheDocument()
  })

  it('renders form with garage data', () => {
    renderWithProviders()

    expect(screen.getByDisplayValue('Garage Test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Jean Dupont')).toBeInTheDocument()
    expect(screen.getByDisplayValue('0123456789')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@garage.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123 Rue Test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Carrosserie')).toBeInTheDocument()
  })

  it('shows loading spinner while fetching', () => {
    vi.spyOn(useGaragesHook, 'useGarage').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithProviders()

    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()
  })

  it('shows error message when garage not found', () => {
    vi.spyOn(useGaragesHook, 'useGarage').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    } as any)

    renderWithProviders()

    expect(screen.getByText(/garage non trouvé/i)).toBeInTheDocument()
  })

  it('updates garage and navigates on submit', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue({ id: 1 })
    renderWithProviders()

    const nameInput = screen.getByDisplayValue('Garage Test')
    await user.clear(nameInput)
    await user.type(nameInput, 'Garage Modifié')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 1,
        data: expect.objectContaining({
          name: 'Garage Modifié',
        }),
      })
      expect(mockNavigate).toHaveBeenCalledWith('/garages')
    })
  })

  it('navigates back on cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith('/garages')
  })

  it('shows loading state during update', () => {
    vi.spyOn(useGaragesHook, 'useUpdateGarage').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any)

    renderWithProviders()

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    expect(submitButton).toHaveAttribute('data-loading', 'true')
  })
})
