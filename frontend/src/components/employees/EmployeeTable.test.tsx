import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { EmployeeTable } from './EmployeeTable'
import type { Employee } from '@/types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockEmployees: Employee[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    lastLoginAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'admin',
    isActive: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
]

function renderTable(props = {}) {
  const defaultProps = {
    employees: mockEmployees,
    onDelete: vi.fn(),
    isLoading: false,
  }
  return render(
    <BrowserRouter>
      <EmployeeTable {...defaultProps} {...props} />
    </BrowserRouter>
  )
}

describe('EmployeeTable', () => {
  it('renders employee data correctly', () => {
    renderTable()
    
    expect(screen.getByText('Doe')).toBeInTheDocument()
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText('Smith')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })

  it('displays active status correctly', () => {
    renderTable()
    
    const activeChips = screen.getAllByText('Actif')
    const inactiveChips = screen.getAllByText('Inactif')
    
    expect(activeChips).toHaveLength(1)
    expect(inactiveChips).toHaveLength(1)
  })

  it('displays last login date when available', () => {
    renderTable()
    
    expect(screen.getByText(/03\/01\/2024/)).toBeInTheDocument()
  })

  it('displays dash when no last login', () => {
    renderTable()
    
    const cells = screen.getAllByRole('gridcell')
    const hasNeverLoggedIn = cells.some(cell => cell.textContent === '-')
    expect(hasNeverLoggedIn).toBeTruthy()
  })

  it('shows empty state when no employees', () => {
    renderTable({ employees: [] })
    
    expect(screen.getByText('Aucun employé trouvé')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    renderTable({ isLoading: true })
    
    // NextUI Table uses grid role
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = vi.fn()
    renderTable({ onDelete })
    const user = userEvent.setup()
    
    // Get all buttons - 3rd, 6th buttons are delete (each row has 3 buttons)
    const allButtons = screen.getAllByRole('button')
    await user.click(allButtons[2]) // First delete button (3rd button overall)
    
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('navigates to detail page when view button clicked', async () => {
    renderTable()
    const user = userEvent.setup()
    
    //Get first view button (1st button)
    const allButtons = screen.getAllByRole('button')
    await user.click(allButtons[0])
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employees/1')
    })
  })

  it('navigates to edit page when edit button clicked', async () => {
    renderTable()
    const user = userEvent.setup()
    
    // Get first edit button (2nd button)
    const allButtons = screen.getAllByRole('button')
    await user.click(allButtons[1])
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employees/1/edit')
    })
  })

  it('displays role correctly', () => {
    renderTable()
    
    const roleCells = screen.getAllByText(/admin/i)
    expect(roleCells.length).toBeGreaterThan(0)
  })
})
