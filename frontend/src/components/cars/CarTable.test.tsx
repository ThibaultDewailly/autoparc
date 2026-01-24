import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { CarTable } from './CarTable'
import type { Car } from '@/types'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockCars: Car[] = [
  {
    id: '1',
    licensePlate: 'AB-123-CD',
    brand: 'Toyota',
    model: 'Corolla',
    greyCardNumber: 'GC123',
    insuranceCompanyId: 'ins-1',
    rentalStartDate: '2024-01-01',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'user-1',
  },
  {
    id: '2',
    licensePlate: 'EF-456-GH',
    brand: 'Honda',
    model: 'Civic',
    greyCardNumber: 'GC456',
    insuranceCompanyId: 'ins-2',
    rentalStartDate: '2024-02-01',
    status: 'maintenance',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    createdBy: 'user-1',
  },
]

function renderCarTable(cars: Car[] = mockCars, onDelete = vi.fn(), isLoading = false) {
  return render(
    <BrowserRouter>
      <CarTable cars={cars} onDelete={onDelete} isLoading={isLoading} />
    </BrowserRouter>
  )
}

describe('CarTable', () => {
  it('should render table with car data', () => {
    renderCarTable()

    expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    expect(screen.getByText('Toyota')).toBeInTheDocument()
    expect(screen.getByText('Corolla')).toBeInTheDocument()
    expect(screen.getByText('EF-456-GH')).toBeInTheDocument()
    expect(screen.getByText('Honda')).toBeInTheDocument()
    expect(screen.getByText('Civic')).toBeInTheDocument()
  })

  it('should render status chips with correct colors', () => {
    renderCarTable()

    const activeChip = screen.getByText('Actif')
    const maintenanceChip = screen.getByText('En maintenance')

    expect(activeChip).toBeInTheDocument()
    expect(maintenanceChip).toBeInTheDocument()
  })

  it('should render formatted dates', () => {
    renderCarTable()

    expect(screen.getByText('01/01/2024')).toBeInTheDocument()
    expect(screen.getByText('01/02/2024')).toBeInTheDocument()
  })

  it('should show empty message when no cars', () => {
    renderCarTable([])

    expect(screen.getByText('Aucun véhicule trouvé')).toBeInTheDocument()
  })

  it('should render action buttons', () => {
    renderCarTable()

    // Should have 6 buttons per row (3 actions × 2 cars)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(6)
  })

  it('should show loading state', () => {
    renderCarTable(mockCars, vi.fn(), true)

    expect(screen.getByRole('grid')).toBeInTheDocument()
  })
})
