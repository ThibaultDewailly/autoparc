import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AccidentDetailPage } from './AccidentDetailPage'
import * as accidentHooks from '@/hooks/useAccidents'
import * as carHooks from '@/hooks/useCars'

vi.mock('@/hooks/useAccidents')
vi.mock('@/hooks/useCars')

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

const mockAccident = {
  id: 1,
  carId: 1,
  accidentDate: '2024-01-15T10:00:00Z',
  location: 'Paris',
  description: 'Accident description',
  damagesDescription: 'Minor damages',
  responsibleParty: 'Other driver',
  policeReportNumber: 'PR-123',
  insuranceClaimNumber: 'IC-456',
  status: 'declared' as const,
  photos: [
    {
      id: 1,
      accidentId: 1,
      photoUrl: 'http://example.com/photo1.jpg',
      uploadedAt: '2024-01-15T10:30:00Z',
    },
  ],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

describe('AccidentDetailPage', () => {
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
    window.history.pushState({}, '', '/accidents/1')

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/accidents/:id" element={<AccidentDetailPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  it('renders accident details', async () => {
    vi.mocked(accidentHooks.useAccident).mockReturnValue({
      data: mockAccident,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useUpdateAccidentStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [mockCar],
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    })

    expect(screen.getByText('Paris')).toBeInTheDocument()
    expect(screen.getByText('Accident description')).toBeInTheDocument()
    expect(screen.getByText('Minor damages')).toBeInTheDocument()
  })

  it('shows loading spinner while fetching', () => {
    vi.mocked(accidentHooks.useAccident).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useUpdateAccidentStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
  })

  it('shows error message when accident not found', () => {
    vi.mocked(accidentHooks.useAccident).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    } as any)

    vi.mocked(accidentHooks.useUpdateAccidentStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    expect(screen.getByText(/accident introuvable/i)).toBeInTheDocument()
  })

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(accidentHooks.useAccident).mockReturnValue({
      data: mockAccident,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useUpdateAccidentStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [mockCar],
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    expect(mockNavigate).toHaveBeenCalledWith('/accidents/1/edit')
  })

  it('updates accident status', async () => {
    const user = userEvent.setup()
    const updateStatusMock = vi.fn().mockResolvedValue({})

    vi.mocked(accidentHooks.useAccident).mockReturnValue({
      data: mockAccident,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useUpdateAccidentStatus).mockReturnValue({
      mutateAsync: updateStatusMock,
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [mockCar],
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    })

    const statusButton = screen.getByRole('button', { name: /en cours d'examen/i })
    await user.click(statusButton)

    expect(updateStatusMock).toHaveBeenCalledWith({ id: 1, status: 'under_review' })
  })

  it('displays accident photos', async () => {
    vi.mocked(accidentHooks.useAccident).mockReturnValue({
      data: mockAccident,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useUpdateAccidentStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [mockCar],
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    })

    const image = screen.getByAltText('Accident photo 1')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'http://example.com/photo1.jpg')
  })

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(accidentHooks.useAccident).mockReturnValue({
      data: mockAccident,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(accidentHooks.useUpdateAccidentStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    vi.mocked(carHooks.useCars).mockReturnValue({
      data: [mockCar],
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    })

    const backButton = screen.getByRole('button', { name: /retour/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/accidents')
  })
})
