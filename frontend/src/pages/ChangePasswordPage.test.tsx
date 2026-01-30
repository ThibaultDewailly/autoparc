 
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChangePasswordPage } from './ChangePasswordPage'
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
          <ChangePasswordPage />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.skip('shows loading state', () => {
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)
    vi.spyOn(employeeHooks, 'useChangePassword').mockReturnValue({
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
    vi.spyOn(employeeHooks, 'useChangePassword').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getByText(/employé introuvable/i)).toBeInTheDocument()
  })

  it('renders form with breadcrumb navigation', () => {
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any)
    vi.spyOn(employeeHooks, 'useChangePassword').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getAllByText('Employés').length).toBeGreaterThan(0)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getAllByText(/changer le mot de passe/i).length).toBeGreaterThan(0)
  })

  it('renders change password form', () => {
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any)
    vi.spyOn(employeeHooks, 'useChangePassword').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument()
  })

  it('submits form and navigates on success', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({})
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any)
    vi.spyOn(employeeHooks, 'useChangePassword').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)

    renderPage()
    const user = userEvent.setup()
    
    await user.type(screen.getByLabelText(/mot de passe actuel/i), 'OldPassword123')
    await user.type(screen.getByLabelText(/nouveau mot de passe/i), 'NewPassword123')
    await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'NewPassword123')
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 'employee-1',
        data: {
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword123',
        },
      })
      expect(mockNavigate).toHaveBeenCalledWith('/employees/employee-1')
    })
  })

  it('navigates back when cancel is clicked', async () => {
    vi.spyOn(employeeHooks, 'useEmployee').mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any)
    vi.spyOn(employeeHooks, 'useChangePassword').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    const user = userEvent.setup()
    
    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/employees/employee-1')
  })
})
