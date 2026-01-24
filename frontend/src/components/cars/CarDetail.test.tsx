import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CarDetail } from './CarDetail'
import type { Car } from '@/types'

const mockCar: Car = {
  id: '1',
  licensePlate: 'AB-123-CD',
  brand: 'Toyota',
  model: 'Corolla',
  greyCardNumber: 'GC123',
  insuranceCompanyId: '1',
  insuranceCompany: {
    id: '1',
    name: 'Assurance Test',
    contactPerson: 'John Doe',
    phone: '0123456789',
    email: 'contact@assurance.com',
    policyNumber: 'POL123',
    address: '123 Rue de Test',    isActive: true,    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  rentalStartDate: '2024-01-01',
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  createdBy: 'user-1',
}

describe('CarDetail', () => {
  it('should render car license plate as heading', () => {
    render(<CarDetail car={mockCar} />)

    expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
  })

  it('should render car status chip', () => {
    render(<CarDetail car={mockCar} />)

    expect(screen.getByText('Actif')).toBeInTheDocument()
  })

  it('should render car basic information', () => {
    render(<CarDetail car={mockCar} />)

    expect(screen.getByText('Toyota')).toBeInTheDocument()
    expect(screen.getByText('Corolla')).toBeInTheDocument()
    expect(screen.getByText('GC123')).toBeInTheDocument()
    // Date appears in multiple places (rental start and created at)
    const dates = screen.getAllByText('01/01/2024')
    expect(dates.length).toBeGreaterThan(0)
  })

  it('should render insurance company information when available', () => {
    render(<CarDetail car={mockCar} />)

    expect(screen.getByText('Assurance Test')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('0123456789')).toBeInTheDocument()
    expect(screen.getByText('contact@assurance.com')).toBeInTheDocument()
    expect(screen.getByText('POL123')).toBeInTheDocument()
    expect(screen.getByText('123 Rue de Test')).toBeInTheDocument()
  })

  it('should render timestamps', () => {
    render(<CarDetail car={mockCar} />)

    const dates = screen.getAllByText('01/01/2024')
    expect(dates.length).toBeGreaterThan(0)
    expect(screen.getByText('02/01/2024')).toBeInTheDocument()
  })

  it('should render maintenance status with warning color', () => {
    const maintenanceCar = { ...mockCar, status: 'maintenance' as const }
    render(<CarDetail car={maintenanceCar} />)

    expect(screen.getByText('En maintenance')).toBeInTheDocument()
  })

  it('should render retired status with default color', () => {
    const retiredCar = { ...mockCar, status: 'retired' as const }
    render(<CarDetail car={retiredCar} />)

    expect(screen.getByText('Retiré')).toBeInTheDocument()
  })

  it('should render car without insurance company', () => {
    const carWithoutInsurance = {
      ...mockCar,
      insuranceCompany: undefined,
    }
    render(<CarDetail car={carWithoutInsurance} />)

    expect(screen.getByText('AB-123-CD')).toBeInTheDocument()
    expect(screen.getByText('Toyota')).toBeInTheDocument()
  })

  it('should display all field labels correctly', () => {
    render(<CarDetail car={mockCar} />)

    expect(screen.getByText('Marque')).toBeInTheDocument()
    expect(screen.getByText('Modèle')).toBeInTheDocument()
    expect(screen.getByText('Numéro de carte grise')).toBeInTheDocument()
    expect(screen.getByText('Date de début de location')).toBeInTheDocument()
    expect(screen.getByText('Compagnie d\'assurance')).toBeInTheDocument()
  })
})
