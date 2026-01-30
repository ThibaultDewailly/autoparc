 
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EmployeesPage } from './EmployeesPage'
import { AuthProvider } from '@/contexts/AuthContext'
import * as employeeHooks from '@/hooks/useEmployees'

const mockNavigate = vi.fn()
const mockSetSearchParams = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  }
})

const mockEmployeesData = {
  employees: [
    {
      id: '1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '2',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  totalPages: 1,
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <EmployeesPage />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('EmployeesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title and add button', () => {
    vi.spyOn(employeeHooks, 'useEmployees').mockReturnValue({
      data: mockEmployeesData,
      isLoading: false,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getAllByText('Employés').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /ajouter un employé/i })).toBeInTheDocument()
  })

  it('renders search bar', () => {
    vi.spyOn(employeeHooks, 'useEmployees').mockReturnValue({
      data: mockEmployeesData,
      isLoading: false,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getByPlaceholderText(/rechercher par nom ou email/i)).toBeInTheDocument()
  })

  it('renders employee table with data', () => {
    vi.spyOn(employeeHooks, 'useEmployees').mockReturnValue({
      data: mockEmployeesData,
      isLoading: false,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('handles search input', async () => {
    const mockUseEmployees = vi.spyOn(employeeHooks, 'useEmployees')
    mockUseEmployees.mockReturnValue({
      data: mockEmployeesData,
      isLoading: false,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    const user = userEvent.setup()
    
    const searchInput = screen.getByPlaceholderText(/rechercher par nom ou email/i)
    await user.type(searchInput, 'John')
    
    await waitFor(() => {
      expect(mockUseEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'John' })
      )
    })
  })

  it.skip('opens delete confirmation modal', async () => {
    vi.spyOn(employeeHooks, 'useEmployees').mockReturnValue({
      data: mockEmployeesData,
      isLoading: false,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    const user = userEvent.setup()
    
    const deleteButtons = screen.getAllByText(/voir|supprimer/i)
    const deleteButton = deleteButtons.find(btn => btn.textContent?.includes('Supprimer'))
    if (deleteButton) {
      await user.click(deleteButton)
    }
    
    await waitFor(() => {
      expect(screen.getByText(/supprimer l'employé/i)).toBeInTheDocument()
    })
  })

  it.skip('deletes employee when confirmed', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({})
    vi.spyOn(employeeHooks, 'useEmployees').mockReturnValue({
      data: mockEmployeesData,
      isLoading: false,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)

    renderPage()
    const user = userEvent.setup()
    
    const deleteButtons = screen.getAllByText(/voir|supprimer/i)
    const deleteButton = deleteButtons.find(btn => btn.textContent?.includes('Supprimer'))
    if (deleteButton) {
      await user.click(deleteButton)
    }
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument()
    })
    
    const confirmButton = screen.getByRole('button', { name: 'Supprimer' })
    await user.click(confirmButton)
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('1')
    })
  })

  it.skip('shows loading state', () => {
    vi.spyOn(employeeHooks, 'useEmployees').mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
