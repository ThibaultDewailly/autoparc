import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('should not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('should render pagination controls when totalPages > 1', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    )
    
    expect(screen.getByText(/précédent/i)).toBeInTheDocument()
    expect(screen.getByText(/suivant/i)).toBeInTheDocument()
    expect(screen.getByText(/page 1 sur 5/i)).toBeInTheDocument()
  })

  it('should disable previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    )
    
    const previousButton = screen.getByText(/précédent/i).closest('button')
    expect(previousButton).toBeDisabled()
  })

  it('should disable next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />
    )
    
    const nextButton = screen.getByText(/suivant/i).closest('button')
    expect(nextButton).toBeDisabled()
  })

  it('should enable both buttons on middle page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
    )
    
    const previousButton = screen.getByText(/précédent/i).closest('button')
    const nextButton = screen.getByText(/suivant/i).closest('button')
    
    expect(previousButton).not.toBeDisabled()
    expect(nextButton).not.toBeDisabled()
  })

  it('should call onPageChange with previous page', () => {
    const handlePageChange = vi.fn()
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />
    )
    
    const previousButton = screen.getByText(/précédent/i)
    fireEvent.click(previousButton)
    
    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it('should call onPageChange with next page', () => {
    const handlePageChange = vi.fn()
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />
    )
    
    const nextButton = screen.getByText(/suivant/i)
    fireEvent.click(nextButton)
    
    expect(handlePageChange).toHaveBeenCalledWith(4)
  })

  it('should not call onPageChange when previous is disabled', () => {
    const handlePageChange = vi.fn()
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={handlePageChange} />
    )
    
    const previousButton = screen.getByText(/précédent/i)
    fireEvent.click(previousButton)
    
    expect(handlePageChange).not.toHaveBeenCalled()
  })

  it('should not call onPageChange when next is disabled', () => {
    const handlePageChange = vi.fn()
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={handlePageChange} />
    )
    
    const nextButton = screen.getByText(/suivant/i)
    fireEvent.click(nextButton)
    
    expect(handlePageChange).not.toHaveBeenCalled()
  })
})
