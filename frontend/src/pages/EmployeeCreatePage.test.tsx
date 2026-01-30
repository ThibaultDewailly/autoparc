 
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EmployeeCreatePage } from './EmployeeCreatePage'
import { AuthProvider } from '@/contexts/AuthContext'
import * as employeeHooks from '@/hooks/useEmployees'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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
          <EmployeeCreatePage />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('EmployeeCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title and form', () => {
    vi.spyOn(employeeHooks, 'useCreateEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getByText(/ajouter un employé/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
  })

  it('renders breadcrumb navigation', () => {
    vi.spyOn(employeeHooks, 'useCreateEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    
    expect(screen.getAllByText('Employés').length).toBeGreaterThan(0)
    expect(screen.getByText(/nouvel employé/i)).toBeInTheDocument()
  })

  it('submits form and navigates on success', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({})
    vi.spyOn(employeeHooks, 'useCreateEmployee').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)

    renderPage()
    const user = userEvent.setup()
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'Password123')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'Password123')
    await user.type(screen.getByLabelText('Prénom'), 'John')
    await user.type(screen.getByLabelText('Nom'), 'Doe')
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/employees')
    })
  })

  it('navigates back when cancel is clicked', async () => {
    vi.spyOn(employeeHooks, 'useCreateEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderPage()
    const user = userEvent.setup()
    
    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/employees')
  })

  it('shows loading state during submission', () => {
    vi.spyOn(employeeHooks, 'useCreateEmployee').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as any)

    renderPage()
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    expect(submitButton).toBeDisabled()
  })
})
