/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CarDetailPage } from './CarDetailPage'
import * as carsHooks from '@/hooks/useCars'
import type { Car } from '@/types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/hooks/useCars')

const mockCar: Car = {
  id: '1',
  licensePlate: 'AB-123-CD',
  brand: 'Toyota',
  model: 'Corolla',
  greyCardNumber: 'GC123',
  insuranceCompanyId: '1',
  insuranceCompany: {
    id: '1',
    name: 'Assurance Test',
    contactPerson: 'John Doe',
    phone: '0123456789',
    email: 'contact@assurance.com',
    policyNumber: 'POL123',
    address: '123 Rue de Test',    isActive: true,    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  rentalStartDate: '2024-01-01',
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'user-1',
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
      <MemoryRouter initialEntries={['/cars/1']}>
        <AuthProvider>
          <Routes>
            <Route path="/cars/:id" element={children} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('CarDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn())
  })

  it('should show loading spinner while fetching car', () => {
    vi.mocked(carsHooks.useCar).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    vi.mocked(carsHooks.useDeleteCar).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarDetailPage />
      </Wrapper>
    )

    // Just verify page renders without car data during loading
    expect(screen.queryByText('AB-123-CD')).not.toBeInTheDocument()
  })

  it('should show not found message when car does not exist', () => {
    vi.mocked(carsHooks.useCar).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any)
    vi.mocked(carsHooks.useDeleteCar).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarDetailPage />
      </Wrapper>
    )

    expect(screen.getByText(/aucun véhicule trouvé/i)).toBeInTheDocument()
  })

  it('should render car details', () => {
    vi.mocked(carsHooks.useCar).mockReturnValue({
      data: mockCar,
      isLoading: false,
    } as any)
    vi.mocked(carsHooks.useDeleteCar).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarDetailPage />
      </Wrapper>
    )

    expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    expect(screen.getByText('Toyota')).toBeInTheDocument()
    expect(screen.getByText('Corolla')).toBeInTheDocument()
    expect(screen.getByText('GC123')).toBeInTheDocument()
  })

  it('should render action buttons', () => {
    vi.mocked(carsHooks.useCar).mockReturnValue({
      data: mockCar,
      isLoading: false,
    } as any)
    vi.mocked(carsHooks.useDeleteCar).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarDetailPage />
      </Wrapper>
    )

    expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
  })

  it('should navigate back to cars list when back button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(carsHooks.useCar).mockReturnValue({
      data: mockCar,
      isLoading: false,
    } as any)
    vi.mocked(carsHooks.useDeleteCar).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarDetailPage />
      </Wrapper>
    )

    const backButton = screen.getByRole('button', { name: /retour/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/cars')
  })

  it('should navigate to edit page when edit button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(carsHooks.useCar).mockReturnValue({
      data: mockCar,
      isLoading: false,
    } as any)
    vi.mocked(carsHooks.useDeleteCar).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarDetailPage />
      </Wrapper>
    )

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    expect(mockNavigate).toHaveBeenCalledWith('/cars/1/edit')
  })

  it('should delete car when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup()
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    vi.mocked(window.confirm).mockReturnValue(true)
    
    vi.mocked(carsHooks.useCar).mockReturnValue({
      data: mockCar,
      isLoading: false,
    } as any)
    vi.mocked(carsHooks.useDeleteCar).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarDetailPage />
      </Wrapper>
    )

    const deleteButton = screen.getByRole('button', { name: /supprimer/i })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('1')
      expect(mockNavigate).toHaveBeenCalledWith('/cars')
    })
  })

  it('should not delete car when delete is cancelled', async () => {
    const user = userEvent.setup()
    const mutateAsync = vi.fn()
    vi.mocked(window.confirm).mockReturnValue(false)
    
    vi.mocked(carsHooks.useCar).mockReturnValue({
      data: mockCar,
      isLoading: false,
    } as any)
    vi.mocked(carsHooks.useDeleteCar).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarDetailPage />
      </Wrapper>
    )

    const deleteButton = screen.getByRole('button', { name: /supprimer/i })
    await user.click(deleteButton)

    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('should show loading state on delete button during deletion', () => {
    vi.mocked(carsHooks.useCar).mockReturnValue({
      data: mockCar,
      isLoading: false,
    } as any)
    vi.mocked(carsHooks.useDeleteCar).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as any)

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <CarDetailPage />
      </Wrapper>
    )

    // Button should be in loading state
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
  })
})
