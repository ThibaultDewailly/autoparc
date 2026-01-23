import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginForm } from './LoginForm'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('should render email and password inputs', () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    fireEvent.click(submitButton)

    // Form should not submit with empty fields
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('should show validation error for invalid email', async () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    // Form should not submit with invalid email
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('should call onSubmit with valid credentials', async () => {
    mockOnSubmit.mockResolvedValue(undefined)
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should show error message when submission fails', async () => {
    const errorMessage = 'Invalid credentials'
    mockOnSubmit.mockRejectedValue(new Error(errorMessage))
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should clear validation errors when user types', async () => {
    renderWithProviders(<LoginForm onSubmit={mockOnSubmit} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })

    fireEvent.click(submitButton)

    // Form should not submit
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    // Type valid email and password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    // Now it should still not submit (missing password)
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })
})
