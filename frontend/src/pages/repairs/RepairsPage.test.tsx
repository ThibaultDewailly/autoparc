import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { RepairsPage } from './RepairsPage'
import * as repairHooks from '@/hooks/useRepairs'

vi.mock('@/hooks/useRepairs')

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

describe('RepairsPage', () => {
  it('renders repairs page', () => {
    vi.mocked(repairHooks.useRepairs).mockReturnValue({
      data: { data: [], total_pages: 0 },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<RepairsPage />)

    expect(screen.getByText('Gestion des Réparations')).toBeInTheDocument()
  })

  it('renders with loading state', () => {
    vi.mocked(repairHooks.useRepairs).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithProviders(<RepairsPage />)

    expect(screen.getByText('Gestion des Réparations')).toBeInTheDocument()
  })
})
