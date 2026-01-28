import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { OperatorTable } from './OperatorTable'
import type { OperatorWithCurrentCar } from '@/types/operator'

const mockOperators: OperatorWithCurrentCar[] = [
  {
    id: '1',
    employee_number: 'EMP001',
    first_name: 'Jean',
    last_name: 'Dupont',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    current_car: {
      id: 'car-1',
      license_plate: 'AB-123-CD',
      brand: 'Renault',
      model: 'Clio',
      since: '2025-01-01',
    },
  },
  {
    id: '2',
    employee_number: 'EMP002',
    first_name: 'Marie',
    last_name: 'Martin',
    email: 'marie@example.com',
    department: 'IT',
    is_active: false,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
]

describe('OperatorTable', () => {
  it('should render operator table with data', () => {
    const onDelete = vi.fn()

    render(
      <BrowserRouter>
        <OperatorTable operators={mockOperators} onDelete={onDelete} />
      </BrowserRouter>
    )

    expect(screen.getByText('EMP001')).toBeInTheDocument()
    expect(screen.getByText('Jean')).toBeInTheDocument()
    expect(screen.getByText('Dupont')).toBeInTheDocument()
    expect(screen.getByText('EMP002')).toBeInTheDocument()
    expect(screen.getByText('Marie')).toBeInTheDocument()
    expect(screen.getByText('Martin')).toBeInTheDocument()
  })

  it('should display current car info for assigned operators', () => {
    const onDelete = vi.fn()

    render(
      <BrowserRouter>
        <OperatorTable operators={mockOperators} onDelete={onDelete} />
      </BrowserRouter>
    )

    expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    expect(screen.getByText('Renault Clio')).toBeInTheDocument()
  })

  it('should display dash for operators without current car', () => {
    const onDelete = vi.fn()

    render(
      <BrowserRouter>
        <OperatorTable operators={mockOperators} onDelete={onDelete} />
      </BrowserRouter>
    )

    // The second operator has no car, should show "-"
    const cells = screen.getAllByText('-')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('should display department when available', () => {
    const onDelete = vi.fn()

    render(
      <BrowserRouter>
        <OperatorTable operators={mockOperators} onDelete={onDelete} />
      </BrowserRouter>
    )

    expect(screen.getByText('IT')).toBeInTheDocument()
  })

  it('should display active status chip', () => {
    const onDelete = vi.fn()

    render(
      <BrowserRouter>
        <OperatorTable operators={mockOperators} onDelete={onDelete} />
      </BrowserRouter>
    )

    const activeChips = screen.getAllByText('Actif')
    expect(activeChips.length).toBeGreaterThan(0)
  })

  it('should display inactive status chip', () => {
    const onDelete = vi.fn()

    render(
      <BrowserRouter>
        <OperatorTable operators={mockOperators} onDelete={onDelete} />
      </BrowserRouter>
    )

    expect(screen.getByText('Inactif')).toBeInTheDocument()
  })

  it('should render empty state when no operators', () => {
    const onDelete = vi.fn()

    render(
      <BrowserRouter>
        <OperatorTable operators={[]} onDelete={onDelete} />
      </BrowserRouter>
    )

    expect(screen.getByText('Aucun opérateur trouvé')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    const onDelete = vi.fn()

    render(
      <BrowserRouter>
        <OperatorTable operators={[]} onDelete={onDelete} isLoading={true} />
      </BrowserRouter>
    )

    // NextUI uses 'grid' role instead of 'table'
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })
})
