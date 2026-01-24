/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CarForm } from './CarForm'
import * as useInsuranceCompaniesHook from '@/hooks/useInsuranceCompanies'
import type { Car } from '@/types'

vi.mock('@/hooks/useInsuranceCompanies')

const mockInsuranceCompanies = [
  { id: '1', name: 'Assurance A', contactPerson: 'John', phone: '123', email: 'a@test.com', policyNumber: 'P1', address: 'Addr 1', createdAt: '', updatedAt: '' },
]

const mockCar: Car = {
  id: '1',
  licensePlate: 'AB-123-CD',
  brand: 'Toyota',
  model: 'Corolla',
  greyCardNumber: 'GC123',
  insuranceCompanyId: '1',
  rentalStartDate: '2024-01-01',
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'user-1',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('CarForm', () => {
  beforeEach(() => {
    vi.mocked(useInsuranceCompaniesHook.useInsuranceCompanies).mockReturnValue({
      data: mockInsuranceCompanies,
    } as any)
  })

  it('should render empty form for creating new car', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    const Wrapper = createWrapper()

    render(
      <Wrapper>
        <CarForm onSubmit={onSubmit} onCancel={onCancel} />
      </Wrapper>
    )

    expect(screen.getByLabelText(/plaque d'immatriculation/i)).toHaveValue('')
    expect(screen.getByLabelText(/marque/i)).toHaveValue('')
  })

  it('should allow filling out the form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    const Wrapper = createWrapper()

    render(
      <Wrapper>
        <CarForm onSubmit={onSubmit} onCancel={onCancel} />
      </Wrapper>
    )

    await user.type(screen.getByLabelText(/plaque d'immatriculation/i), 'EF-456-GH')
    await user.type(screen.getByLabelText(/marque/i), 'Honda')

    expect(screen.getByLabelText(/plaque d'immatriculation/i)).toHaveValue('EF-456-GH')
    expect(screen.getByLabelText(/marque/i)).toHaveValue('Honda')
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    const Wrapper = createWrapper()

    render(
      <Wrapper>
        <CarForm onSubmit={onSubmit} onCancel={onCancel} />
      </Wrapper>
    )

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })

  it('should render form with existing car data', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    const Wrapper = createWrapper()

    render(
      <Wrapper>
        <CarForm car={mockCar} onSubmit={onSubmit} onCancel={onCancel} />
      </Wrapper>
    )

    expect(screen.getByLabelText(/plaque d'immatriculation/i)).toHaveValue('AB-123-CD')
    expect(screen.getByLabelText(/marque/i)).toHaveValue('Toyota')
  })

  it('should disable license plate field in edit mode', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    const Wrapper = createWrapper()

    render(
      <Wrapper>
        <CarForm car={mockCar} onSubmit={onSubmit} onCancel={onCancel} />
      </Wrapper>
    )

    const licensePlateInput = screen.getByLabelText(/plaque d'immatriculation/i)
    expect(licensePlateInput).toBeDisabled()
  })

  it('should disable buttons when loading', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    const Wrapper = createWrapper()

    render(
      <Wrapper>
        <CarForm onSubmit={onSubmit} onCancel={onCancel} isLoading={true} />
      </Wrapper>
    )

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    expect(cancelButton).toBeDisabled()
  })

  it('should have all required form fields', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    const Wrapper = createWrapper()

    render(
      <Wrapper>
        <CarForm onSubmit={onSubmit} onCancel={onCancel} />
      </Wrapper>
    )

    expect(screen.getByLabelText(/plaque d'immatriculation/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/marque/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/modèle/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/numéro de carte grise/i)).toBeInTheDocument()
  })
})
