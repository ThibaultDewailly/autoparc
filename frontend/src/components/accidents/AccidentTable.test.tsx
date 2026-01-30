import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AccidentTable } from './AccidentTable'

vi.mock('@/components/accidents/AccidentStatusBadge', () => ({
  AccidentStatusBadge: () => <div>Status Badge</div>,
}))

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('AccidentTable', () => {
  it('renders empty state', () => {
    renderWithRouter(<AccidentTable accidents={[]} isLoading={false} onDelete={vi.fn()} />)

    expect(screen.getByText('Aucun accident trouvé')).toBeInTheDocument()
  })

  it('renders accidents with vehicle info', () => {
    const accidents = [
      {
        id: '1',
        carId: 'car1',
        car: { licensePlate: 'ABC-123' },
        accidentDate: '2024-01-01',
        location: 'Paris',
        description: 'Test accident',
        status: 'pending' as const,
        createdAt: '2024-01-01',
      } as any,
    ]

    renderWithRouter(<AccidentTable accidents={accidents} isLoading={false} onDelete={vi.fn()} />)

    expect(screen.getByText('ABC-123')).toBeInTheDocument()
    expect(screen.getByText('Paris')).toBeInTheDocument()
  })
})
