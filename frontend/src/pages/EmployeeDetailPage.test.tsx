 
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EmployeeDetailPage } from './EmployeeDetailPage'
import { AuthProvider } from '@/contexts/AuthContext'
import * as employeeHooks from '@/hooks/useEmployees'
import type { Employee } from '@/types'

const mockNavigate = vi.fn()
const mockParams = { id: 'employee-1' }

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  }
})

const mockEmployee: Employee = {
  id: 'employee-1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
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
          <EmployeeDetailPage />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('EmployeeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.skip('shows loading state', () => {
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows error state when employee not found', () => {
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getByText(/employé introuvable/i)).toBeInTheDocument()
  })

  it('renders employee details', () => {
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
  })

  it('navigates to edit page when edit is clicked', async () => {
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    const user = userEvent.setup()
    
    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/employees/employee-1/edit')
  })

  it('navigates to change password page', async () => {
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    const user = userEvent.setup()
    
    const changePasswordButton = screen.getByRole('button', { name: /changer le mot de passe/i })
    await user.click(changePasswordButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/employees/employee-1/change-password')
  })

  it('opens delete confirmation modal', async () => {
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    const user = userEvent.setup()
    
    const deleteButton = screen.getByRole('button', { name: /supprimer/i })
    await user.click(deleteButton)
    
    await waitFor(() => {
      expect(screen.getByText(/supprimer l'employé/i)).toBeInTheDocument()
    })
  })

  it('deletes employee when confirmed', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({})
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any)
    vi.spyOn(employeeHooks, 'useDeleteEmployee').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)

    renderPage()
    const user = userEvent.setup()
    
    const deleteButton = screen.getByRole('button', { name: /supprimer/i })
    await user.click(deleteButton)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument()
    })
    
    const confirmButton = screen.getByRole('button', { name: 'Supprimer' })
    await user.click(confirmButton)
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('employee-1')
      expect(mockNavigate).toHaveBeenCalledWith('/employees')
    })
  })
})
