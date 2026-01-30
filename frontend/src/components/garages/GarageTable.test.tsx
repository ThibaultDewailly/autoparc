import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { GarageTable } from './GarageTable'

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('GarageTable', () => {
  it('renders empty state', () => {
    renderWithRouter(<GarageTable garages={[]} isLoading={false} onDelete={vi.fn()} />)

    expect(screen.getByText('Aucun garage trouvé')).toBeInTheDocument()
  })

  it('renders garages list', () => {
    const garages = [
      {
        id: '1',
        name: 'Garage Test',
        address: '123 Main St',
        phone: '1234567890',
        email: 'test@test.com',
        isActive: true,
        createdAt: '2024-01-01',
      } as any,
    ]

    renderWithRouter(<GarageTable garages={garages} isLoading={false} onDelete={vi.fn()} />)

    expect(screen.getByText('Garage Test')).toBeInTheDocument()
  })
})
