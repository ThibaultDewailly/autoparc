import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeDetail } from './EmployeeDetail'
import type { Employee } from '@/types'

const mockEmployee: Employee = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  lastLoginAt: '2024-01-03T00:00:00Z',
}

function renderDetail(props = {}) {
  const defaultProps = {
    employee: mockEmployee,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onChangePassword: vi.fn(),
  }
  return render(<EmployeeDetail {...defaultProps} {...props} />)
}

describe('EmployeeDetail', () => {
  it('renders employee information correctly', () => {
    renderDetail()
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText(/admin/i)).toBeInTheDocument()
  })

  it('displays active status badge', () => {
    renderDetail()
    
    expect(screen.getByText('Actif')).toBeInTheDocument()
  })

  it('displays inactive status badge', () => {
    const inactiveEmployee = { ...mockEmployee, isActive: false }
    renderDetail({ employee: inactiveEmployee })
    
    expect(screen.getByText('Inactif')).toBeInTheDocument()
  })

  it('displays formatted dates', () => {
    renderDetail()
    
    expect(screen.getByText(/01\/01\/2024/)).toBeInTheDocument() // Created
    expect(screen.getByText(/02\/01\/2024/)).toBeInTheDocument() // Updated
    expect(screen.getByText(/03\/01\/2024/)).toBeInTheDocument() // Last login
  })

  it('displays "Jamais" when no last login', () => {
    const employeeWithoutLogin = { ...mockEmployee, lastLoginAt: undefined }
    renderDetail({ employee: employeeWithoutLogin })
    
    expect(screen.getByText('Jamais')).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', async () => {
    const onEdit = vi.fn()
    renderDetail({ onEdit })
    const user = userEvent.setup()
    
    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)
    
    expect(onEdit).toHaveBeenCalled()
  })

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = vi.fn()
    renderDetail({ onDelete })
    const user = userEvent.setup()
    
    const deleteButton = screen.getByRole('button', { name: /supprimer/i })
    await user.click(deleteButton)
    
    expect(onDelete).toHaveBeenCalled()
  })

  it('calls onChangePassword when change password button clicked', async () => {
    const onChangePassword = vi.fn()
    renderDetail({ onChangePassword })
    const user = userEvent.setup()
    
    const changePasswordButton = screen.getByRole('button', { name: /changer le mot de passe/i })
    await user.click(changePasswordButton)
    
    expect(onChangePassword).toHaveBeenCalled()
  })

  it('displays all employee fields', () => {
    renderDetail()
    
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Rôle')).toBeInTheDocument()
    expect(screen.getByText('Créé le')).toBeInTheDocument()
    expect(screen.getByText('Modifié le')).toBeInTheDocument()
    expect(screen.getByText('Dernière connexion')).toBeInTheDocument()
  })
})
