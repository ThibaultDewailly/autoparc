import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GarageForm } from './GarageForm'
import type { Garage } from '@/types'

describe('GarageForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByLabelText(/nom du garage/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/téléphone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/personne de contact/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/adresse/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/spécialisation/i)).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument()
  })

  it('populates form when garage prop is provided', () => {
    const garage: Garage = {
      id: 1,
      name: 'Garage Test',
      contactPerson: 'Jean Dupont',
      phone: '0123456789',
      email: 'test@garage.com',
      address: '123 Rue Test',
      specialization: 'Carrosserie',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    render(<GarageForm garage={garage} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByDisplayValue('Garage Test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Jean Dupont')).toBeInTheDocument()
    expect(screen.getByDisplayValue('0123456789')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@garage.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123 Rue Test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Carrosserie')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/le nom du garage est requis/i)).toBeInTheDocument()
      expect(screen.getByText(/le téléphone est requis/i)).toBeInTheDocument()
      expect(screen.getByText(/l'adresse est requise/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates phone format', async () => {
    const user = userEvent.setup()
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const phoneInput = screen.getByLabelText(/téléphone/i)
    await user.type(phoneInput, '123')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/format de téléphone invalide/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const nameInput = screen.getByLabelText(/nom du garage/i)
    await user.type(nameInput, 'Garage Test')

    const phoneInput = screen.getByLabelText(/téléphone/i)
    await user.type(phoneInput, '0123456789')

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')

    const addressInput = screen.getByLabelText(/adresse/i)
    await user.type(addressInput, '123 Rue Test')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('allows empty email', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(undefined)
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const nameInput = screen.getByLabelText(/nom du garage/i)
    await user.type(nameInput, 'Garage Test')

    const phoneInput = screen.getByLabelText(/téléphone/i)
    await user.type(phoneInput, '0123456789')

    const addressInput = screen.getByLabelText(/adresse/i)
    await user.type(addressInput, '123 Rue Test')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(undefined)
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const nameInput = screen.getByLabelText(/nom du garage/i)
    await user.type(nameInput, 'Garage Test')

    const phoneInput = screen.getByLabelText(/téléphone/i)
    await user.type(phoneInput, '0123456789')

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@garage.com')

    const contactInput = screen.getByLabelText(/personne de contact/i)
    await user.type(contactInput, 'Jean Dupont')

    const addressInput = screen.getByLabelText(/adresse/i)
    await user.type(addressInput, '123 Rue Test')

    const specializationInput = screen.getByLabelText(/spécialisation/i)
    await user.type(specializationInput, 'Carrosserie')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Garage Test',
        phone: '0123456789',
        email: 'test@garage.com',
        contactPerson: 'Jean Dupont',
        address: '123 Rue Test',
        specialization: 'Carrosserie',
      })
    })
  })

  it('trims whitespace from fields', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(undefined)
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const nameInput = screen.getByLabelText(/nom du garage/i)
    await user.type(nameInput, '  Garage Test  ')

    const phoneInput = screen.getByLabelText(/téléphone/i)
    await user.type(phoneInput, '  0123456789  ')

    const addressInput = screen.getByLabelText(/adresse/i)
    await user.type(addressInput, '  123 Rue Test  ')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Garage Test',
        phone: '0123456789',
        address: '123 Rue Test',
        contactPerson: undefined,
        email: undefined,
        specialization: undefined,
      })
    })
  })

  it('converts empty optional fields to undefined', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue(undefined)
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const nameInput = screen.getByLabelText(/nom du garage/i)
    await user.type(nameInput, 'Garage Test')

    const phoneInput = screen.getByLabelText(/téléphone/i)
    await user.type(phoneInput, '0123456789')

    const addressInput = screen.getByLabelText(/adresse/i)
    await user.type(addressInput, '123 Rue Test')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Garage Test',
        phone: '0123456789',
        address: '123 Rue Test',
        contactPerson: undefined,
        email: undefined,
        specialization: undefined,
      })
    })
  })

  it('displays general error on submit failure', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockRejectedValue(new Error('Erreur serveur'))
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const nameInput = screen.getByLabelText(/nom du garage/i)
    await user.type(nameInput, 'Garage Test')

    const phoneInput = screen.getByLabelText(/téléphone/i)
    await user.type(phoneInput, '0123456789')

    const addressInput = screen.getByLabelText(/adresse/i)
    await user.type(addressInput, '123 Rue Test')

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/erreur serveur/i)).toBeInTheDocument()
    })
  })

  it('clears field error on change', async () => {
    const user = userEvent.setup()
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/le nom du garage est requis/i)).toBeInTheDocument()
    })

    const nameInput = screen.getByLabelText(/nom du garage/i)
    await user.type(nameInput, 'G')

    expect(screen.queryByText(/le nom du garage est requis/i)).not.toBeInTheDocument()
  })

  it('disables buttons when loading', () => {
    render(<GarageForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />)

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })

    expect(cancelButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('data-loading', 'true')
  })
})
