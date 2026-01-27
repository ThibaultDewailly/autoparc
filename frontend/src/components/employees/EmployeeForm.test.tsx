import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeForm } from './EmployeeForm'
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
}

function renderForm(props = {}) {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isLoading: false,
  }
  return render(<EmployeeForm {...defaultProps} {...props} />)
}

describe('EmployeeForm', () => {
  describe('Create mode', () => {
    it('renders all required fields', () => {
      renderForm()
      
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
      expect(screen.getByLabelText('Prénom')).toBeInTheDocument()
      expect(screen.getByLabelText('Nom')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /rôle/i })).toBeInTheDocument()
    })

    it('does not show isActive switch in create mode', () => {
      renderForm()
      
      expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })

    it('shows password field in create mode', () => {
      renderForm()
      
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    })

    it('toggles password visibility', async () => {
      renderForm()
      const user = userEvent.setup()
      
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      const toggleButton = screen.getByRole('button', { name: '' })
      await user.click(toggleButton)
      
      expect(passwordInput).toHaveAttribute('type', 'text')
    })

    it('validates required fields', async () => {
      const onSubmit = vi.fn()
      renderForm({ onSubmit })
      const user = userEvent.setup()
      
      const submitButton = screen.getByRole('button', { name: /enregistrer/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email.*requis/i)).toBeInTheDocument()
        expect(screen.getByText(/mot de passe.*requis/i)).toBeInTheDocument()
        expect(screen.getByText('Le prénom est requis')).toBeInTheDocument()
        expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
      })
      
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('validates email format', async () => {
      renderForm()
      const user = userEvent.setup()
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /enregistrer/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/format.*email.*invalide/i)).toBeInTheDocument()
      })
    })

    it('validates password strength', async () => {
      renderForm()
      const user = userEvent.setup()
      
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Mot de passe'), 'weak')
      await user.type(screen.getByLabelText('Prénom'), 'John')
      await user.type(screen.getByLabelText('Nom'), 'Doe')
      
      const submitButton = screen.getByRole('button', { name: /enregistrer/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/mot de passe doit contenir/i)).toBeInTheDocument()
      })
    })

    it('submits valid form data', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      renderForm({ onSubmit })
      const user = userEvent.setup()
      
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Mot de passe'), 'Password123')
      await user.type(screen.getByLabelText('Prénom'), 'John')
      await user.type(screen.getByLabelText('Nom'), 'Doe')
      
      const submitButton = screen.getByRole('button', { name: /enregistrer/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'admin',
        })
      })
    })
  })

  describe('Edit mode', () => {
    it('pre-fills form with employee data', () => {
      renderForm({ employee: mockEmployee })
      
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
    })

    it('does not show password field in edit mode', () => {
      renderForm({ employee: mockEmployee })
      
      expect(screen.queryByLabelText(/mot de passe/i)).not.toBeInTheDocument()
    })

    it('shows isActive switch in edit mode', () => {
      renderForm({ employee: mockEmployee })
      
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('allows toggling isActive status', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      renderForm({ employee: mockEmployee, onSubmit })
      const user = userEvent.setup()
      
      const activeSwitch = screen.getByRole('switch')
      expect(activeSwitch).toBeChecked()
      
      await user.click(activeSwitch)
      
      const submitButton = screen.getByRole('button', { name: /enregistrer/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            isActive: false,
          })
        )
      })
    })

    it('submits update data without password', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      renderForm({ employee: mockEmployee, onSubmit })
      const user = userEvent.setup()
      
      const submitButton = screen.getByRole('button', { name: /enregistrer/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'admin',
          isActive: true,
        })
      })
    })
  })

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn()
    renderForm({ onCancel })
    const user = userEvent.setup()
    
    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)
    
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows loading state during submission', () => {
    renderForm({ isLoading: true })
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    expect(submitButton).toBeDisabled()
  })

  it('displays submission error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Email already exists'))
    renderForm({ onSubmit })
    const user = userEvent.setup()
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'Password123')
    await user.type(screen.getByLabelText('Prénom'), 'John')
    await user.type(screen.getByLabelText('Nom'), 'Doe')
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Email already exists/i)).toBeInTheDocument()
    })
  })

  it('clears field error when user types', async () => {
    renderForm()
    const user = userEvent.setup()
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email.*requis/i)).toBeInTheDocument()
    })
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')
    
    await waitFor(() => {
      expect(screen.queryByText(/email.*requis/i)).not.toBeInTheDocument()
    })
  })
})
