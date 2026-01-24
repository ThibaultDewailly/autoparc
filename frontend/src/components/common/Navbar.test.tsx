import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Navbar } from './Navbar'
import * as AuthContextModule from '@/contexts/AuthContext'

const mockLogout = vi.fn()
const mockUser = {
  id: '123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext')
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

function renderNavbar() {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: mockLogout,
  })
  
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  )
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render brand name', () => {
    renderNavbar()
    expect(screen.getByText('AutoParc')).toBeInTheDocument()
  })

  it('should render navigation links', () => {
    renderNavbar()
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
    expect(screen.getByText('Véhicules')).toBeInTheDocument()
  })

  it('should display user name in avatar', () => {
    renderNavbar()
    const avatar = screen.getByRole('button')
    expect(avatar).toBeInTheDocument()
  })

  it('should display user email in dropdown when opened', async () => {
    const user = userEvent.setup()
    renderNavbar()
    
    const avatar = screen.getByRole('button')
    await user.click(avatar)
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should call logout when logout menu item is clicked', async () => {
    const user = userEvent.setup()
    renderNavbar()
    
    const avatar = screen.getByRole('button')
    await user.click(avatar)
    
    const logoutButton = screen.getByText('Déconnexion')
    await user.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('should have correct links to dashboard', () => {
    renderNavbar()
    const dashboardLinks = screen.getAllByText('Tableau de bord')
    expect(dashboardLinks[0].closest('a')).toHaveAttribute('href', '/')
  })

  it('should have correct link to cars page', () => {
    renderNavbar()
    const carsLink = screen.getByText('Véhicules')
    expect(carsLink.closest('a')).toHaveAttribute('href', '/cars')
  })
})
