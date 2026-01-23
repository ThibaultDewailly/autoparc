import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import * as AuthContextModule from '@/contexts/AuthContext'

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext')
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

function renderLoginPage() {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  })
  
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  it('should render login form container', () => {
    renderLoginPage()
    // Check that the login form is rendered by checking for email input
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('should render email and password inputs', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })

  it('should render submit button', () => {
    renderLoginPage()
    expect(screen.getByText('Se connecter')).toBeInTheDocument()
  })
  
  it('should render the login form component', () => {
    renderLoginPage()
    // Check that the container exists
    const container = screen.getByLabelText(/email/i).closest('form')
    expect(container).toBeInTheDocument()
  })
})
