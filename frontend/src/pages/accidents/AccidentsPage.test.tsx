import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { AccidentsPage } from './AccidentsPage'
import * as accidentHooks from '@/hooks/useAccidents'

vi.mock('@/hooks/useAccidents')

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

describe('AccidentsPage', () => {
  it('renders accidents page', () => {
    vi.mocked(accidentHooks.useAccidents).mockReturnValue({
      data: { data: [], total_pages: 0 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<AccidentsPage />)

    expect(screen.getByText('Gestion des Accidents')).toBeInTheDocument()
  })

  it('renders with loading state', () => {
    vi.mocked(accidentHooks.useAccidents).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithProviders(<AccidentsPage />)

    expect(screen.getByText('Gestion des Accidents')).toBeInTheDocument()
  })
})
