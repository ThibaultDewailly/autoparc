import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardPage } from './DashboardPage'
import * as AuthContextModule from '@/contexts/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

const mockUser = {
  id: '123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  role: 'admin',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext')
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

function renderDashboardPage() {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })
  
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('DashboardPage', () => {
  it('should render welcome message', () => {
    renderDashboardPage()
    expect(screen.getByText(/Bienvenue/i)).toBeInTheDocument()
  })

  it('should render search bar', () => {
    renderDashboardPage()
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument()
  })

  it('should render link to cars page', () => {
    renderDashboardPage()
    const link = screen.getByText(/Voir tous les véhicules/i)
    expect(link.closest('a')).toHaveAttribute('href', '/cars')
  })
  
  it('should display navbar', () => {
    renderDashboardPage()
    expect(screen.getByText('AutoParc')).toBeInTheDocument()
  })
})
