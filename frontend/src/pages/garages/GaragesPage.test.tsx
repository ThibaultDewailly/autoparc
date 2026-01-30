import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { GaragesPage } from './GaragesPage'
import * as garageHooks from '@/hooks/useGarages'

vi.mock('@/hooks/useGarages')

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{ui}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('GaragesPage', () => {
  it('renders garages page', () => {
    vi.mocked(garageHooks.useGarages).mockReturnValue({
      data: { data: [], total_pages: 0 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<GaragesPage />)

    expect(screen.getByText('Gestion des Garages')).toBeInTheDocument()
  })

  it('renders with loading state', () => {
    vi.mocked(garageHooks.useGarages).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithProviders(<GaragesPage />)

    expect(screen.getByText('Gestion des Garages')).toBeInTheDocument()
  })
})
