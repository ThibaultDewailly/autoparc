import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangePasswordForm } from './ChangePasswordForm'

function renderForm(props = {}) {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isLoading: false,
  }
  return render(<ChangePasswordForm {...defaultProps} {...props} />)
}

describe('ChangePasswordForm', () => {
  it('renders all password fields', () => {
    renderForm()
    
    expect(screen.getByLabelText(/mot de passe actuel/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmer/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })
    const user = userEvent.setup()
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/mot de passe actuel.*requis/i)).toBeInTheDocument()
      expect(screen.getByText(/nouveau mot de passe.*requis/i)).toBeInTheDocument()
      expect(screen.getByText(/confirmation.*requise/i)).toBeInTheDocument()
    })
    
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('validates new password strength', async () => {
    renderForm()
    const user = userEvent.setup()
    
    await user.type(screen.getByLabelText(/mot de passe actuel/i), 'OldPassword123')
    await user.type(screen.getByLabelText(/nouveau mot de passe/i), 'weak')
    await user.type(screen.getByLabelText(/confirmer/i), 'weak')
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/mot de passe doit contenir/i)).toBeInTheDocument()
    })
  })

  it('validates password confirmation match', async () => {
    renderForm()
    const user = userEvent.setup()
    
    await user.type(screen.getByLabelText(/mot de passe actuel/i), 'OldPassword123')
    await user.type(screen.getByLabelText(/nouveau mot de passe/i), 'NewPassword123')
    await user.type(screen.getByLabelText(/confirmer/i), 'DifferentPassword123')
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/mots de passe ne correspondent pas/i)).toBeInTheDocument()
    })
  })

  it('submits valid password change', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderForm({ onSubmit })
    const user = userEvent.setup()
    
    await user.type(screen.getByLabelText(/mot de passe actuel/i), 'OldPassword123')
    await user.type(screen.getByLabelText(/nouveau mot de passe/i), 'NewPassword123')
    await user.type(screen.getByLabelText(/confirmer/i), 'NewPassword123')
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
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
    
    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    expect(cancelButton).toBeDisabled()
  })

  it('displays submission error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Wrong current password'))
    renderForm({ onSubmit })
    const user = userEvent.setup()
    
    await user.type(screen.getByLabelText(/mot de passe actuel/i), 'WrongPassword123')
    await user.type(screen.getByLabelText(/nouveau mot de passe/i), 'NewPassword123')
    await user.type(screen.getByLabelText(/confirmer/i), 'NewPassword123')
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Wrong current password/i)).toBeInTheDocument()
    })
  })

  it('clears field error when user types', async () => {
    renderForm()
    const user = userEvent.setup()
    
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/mot de passe actuel.*requis/i)).toBeInTheDocument()
    })
    
    const currentPasswordInput = screen.getByLabelText(/mot de passe actuel/i)
    await user.type(currentPasswordInput, 'password')
    
    await waitFor(() => {
      expect(screen.queryByText(/mot de passe actuel.*requis/i)).not.toBeInTheDocument()
    })
  })

  it('shows password strength hint', () => {
    renderForm()
    
    expect(screen.getByText(/minimum 8 caractères.*1 majuscule.*1 minuscule.*1 chiffre/i)).toBeInTheDocument()
  })
})
