import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { OperatorsPage } from './OperatorsPage'
import * as operatorHooks from '@/hooks/useOperators'
import type { PaginatedResponse } from '@/types'
import type { OperatorWithCurrentCar } from '@/types/operator'

vi.mock('@/hooks/useOperators')
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com', role: 'admin', firstName: 'Test', lastName: 'User', isActive: true },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
  }),
}))

const mockOperatorsData: PaginatedResponse<OperatorWithCurrentCar> = {
  data: [
    {
      id: '1',
      employee_number: 'EMP001',
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '0601020304',
      department: 'Production',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      current_car: {
        id: 'car-1',
        license_plate: 'AB-123-CD',
        brand: 'Renault',
        model: 'Clio',
        since: '2025-01-01',
      },
    },
    {
      id: '2',
      employee_number: 'EMP002',
      first_name: 'Marie',
      last_name: 'Martin',
      email: 'marie.martin@example.com',
      department: 'Logistique',
      is_active: true,
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
    },
    {
      id: '3',
      employee_number: 'EMP003',
      first_name: 'Pierre',
      last_name: 'Bernard',
      department: 'Maintenance',
      is_active: false,
      created_at: '2025-01-03T00:00:00Z',
      updated_at: '2025-01-03T00:00:00Z',
    },
  ],
  page: 1,
  limit: 20,
  total: 3,
  total_pages: 1,
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    )
  }
}

// Helper to create mock UseQueryResult
function createMockQueryResult<T>(
  data?: T,
  isLoading = false
): UseQueryResult<T, Error> {
  if (isLoading) {
    return {
      data: undefined as any,
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isSuccess: false,
      isPending: true,
      status: 'pending',
      fetchStatus: 'fetching',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isInitialLoading: true,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isLoadingError: false,
      isRefetching: false,
      isStale: true,
      isFetched: false,
      isFetchedAfterMount: false,
      isEnabled: true,
      promise: Promise.resolve({} as any),
    } as UseQueryResult<T, Error>
  }
  
  return {
    data: data as T,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isSuccess: true,
    isPending: false,
    status: 'success',
    fetchStatus: 'idle',
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isInitialLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isLoadingError: false,
    isRefetching: false,
    isStale: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isEnabled: true,
    promise: Promise.resolve({} as any),
  } as UseQueryResult<T, Error>
}

// Helper to create mock UseMutationResult
function createMockMutationResult(): UseMutationResult<void, Error, string> {
  return {
    mutateAsync: vi.fn(),
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    isIdle: true,
    error: null,
    data: undefined,
    status: 'idle',
    reset: vi.fn(),
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
  } as UseMutationResult<void, Error, string>
}

describe('OperatorsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the page title and add button', async () => {
    vi.mocked(operatorHooks.useOperators).mockReturnValue(
      createMockQueryResult(mockOperatorsData)
    )

    vi.mocked(operatorHooks.useDeleteOperator).mockReturnValue(
      createMockMutationResult()
    )

    render(<OperatorsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Opérateurs' })).toBeInTheDocument()
    })
    expect(screen.getByText('Ajouter un opérateur')).toBeInTheDocument()
  })

  it('should display operators with employee numbers', async () => {
    vi.mocked(operatorHooks.useOperators).mockReturnValue(
      createMockQueryResult(mockOperatorsData)
    )

    vi.mocked(operatorHooks.useDeleteOperator).mockReturnValue(
      createMockMutationResult()
    )

    render(<OperatorsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('EMP001')).toBeInTheDocument()
    })
    expect(screen.getByText('EMP002')).toBeInTheDocument()
    expect(screen.getByText('EMP003')).toBeInTheDocument()
  })

  it('should display operator names correctly', async () => {
    vi.mocked(operatorHooks.useOperators).mockReturnValue(
      createMockQueryResult(mockOperatorsData)
    )

    vi.mocked(operatorHooks.useDeleteOperator).mockReturnValue(
      createMockMutationResult()
    )

    render(<OperatorsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Jean')).toBeInTheDocument()
    })
    expect(screen.getByText('Dupont')).toBeInTheDocument()
    expect(screen.getByText('Marie')).toBeInTheDocument()
    expect(screen.getByText('Martin')).toBeInTheDocument()
    expect(screen.getByText('Pierre')).toBeInTheDocument()
    expect(screen.getByText('Bernard')).toBeInTheDocument()
  })

  it('should display departments correctly', async () => {
    vi.mocked(operatorHooks.useOperators).mockReturnValue(
      createMockQueryResult(mockOperatorsData)
    )

    vi.mocked(operatorHooks.useDeleteOperator).mockReturnValue(
      createMockMutationResult()
    )

    render(<OperatorsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Production')).toBeInTheDocument()
    })
    expect(screen.getByText('Logistique')).toBeInTheDocument()
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
  })

  it('should display current car information when operator has one', async () => {
    vi.mocked(operatorHooks.useOperators).mockReturnValue(
      createMockQueryResult(mockOperatorsData)
    )

    vi.mocked(operatorHooks.useDeleteOperator).mockReturnValue(
      createMockMutationResult()
    )

    render(<OperatorsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    })
    expect(screen.getByText('Renault Clio')).toBeInTheDocument()
  })

  it('should display active and inactive status correctly', async () => {
    vi.mocked(operatorHooks.useOperators).mockReturnValue(
      createMockQueryResult(mockOperatorsData)
    )

    vi.mocked(operatorHooks.useDeleteOperator).mockReturnValue(
      createMockMutationResult()
    )

    render(<OperatorsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      const activeChips = screen.getAllByText('Actif')
      expect(activeChips.length).toBeGreaterThanOrEqual(2)
    })
    const inactifElements = screen.getAllByText('Inactif')
    expect(inactifElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should render search and filter inputs', async () => {
    vi.mocked(operatorHooks.useOperators).mockReturnValue(
      createMockQueryResult(mockOperatorsData)
    )

    vi.mocked(operatorHooks.useDeleteOperator).mockReturnValue(
      createMockMutationResult()
    )

    render(<OperatorsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Rechercher par nom, numéro d\'employé, email...')
      ).toBeInTheDocument()
    })
    expect(screen.getByPlaceholderText('Département')).toBeInTheDocument()
  })

  it('should show loading state', async () => {
    vi.mocked(operatorHooks.useOperators).mockReturnValue(
      createMockQueryResult<PaginatedResponse<OperatorWithCurrentCar>>(undefined, true)
    )

    vi.mocked(operatorHooks.useDeleteOperator).mockReturnValue(
      createMockMutationResult()
    )

    render(<OperatorsPage />, { wrapper: createWrapper() })

    // The table should be in loading state
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })
  })

  it('should show empty state when no operators', async () => {
    vi.mocked(operatorHooks.useOperators).mockReturnValue(
      createMockQueryResult({
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      })
    )

    vi.mocked(operatorHooks.useDeleteOperator).mockReturnValue(
      createMockMutationResult()
    )

    render(<OperatorsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Aucun opérateur trouvé')).toBeInTheDocument()
    })
  })

  it('should display all three operators from mock data', async () => {
    vi.mocked(operatorHooks.useOperators).mockReturnValue(
      createMockQueryResult(mockOperatorsData)
    )

    vi.mocked(operatorHooks.useDeleteOperator).mockReturnValue(
      createMockMutationResult()
    )

    render(<OperatorsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      // Verify all three employee numbers are displayed
      expect(screen.getByText('EMP001')).toBeInTheDocument()
      expect(screen.getByText('EMP002')).toBeInTheDocument()
      expect(screen.getByText('EMP003')).toBeInTheDocument()
      
      // Verify all names are displayed
      expect(screen.getByText('Jean')).toBeInTheDocument()
      expect(screen.getByText('Marie')).toBeInTheDocument()
      expect(screen.getByText('Pierre')).toBeInTheDocument()
      
      expect(screen.getByText('Dupont')).toBeInTheDocument()
      expect(screen.getByText('Martin')).toBeInTheDocument()
      expect(screen.getByText('Bernard')).toBeInTheDocument()
    })
  })
})
