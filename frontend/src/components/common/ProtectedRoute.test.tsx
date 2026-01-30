 
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import * as AuthContextModule from '@/contexts/AuthContext'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      mockNavigate(to)
      return <div>Redirecting to {to}</div>
    },
  }
})

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext')
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

function renderProtectedRoute(authContextValue: any) {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue(authContextValue)
  
  return render(
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

describe('ProtectedRoute', () => {
  it('should render children when authenticated', () => {
    const authContext = {
      user: { id: '1', email: 'test@test.com' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    }

    renderProtectedRoute(authContext)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should show spinner when loading', () => {
    const authContext = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
    }

    renderProtectedRoute(authContext)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', () => {
    const authContext = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    }

    renderProtectedRoute(authContext)
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
