import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('should render with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />)
    
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument()
  })

  it('should render with custom placeholder', () => {
    const customPlaceholder = 'Custom search placeholder'
    render(
      <SearchBar 
        value="" 
        onChange={() => {}} 
        placeholder={customPlaceholder}
      />
    )
    
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument()
  })

  it('should display the provided value', () => {
    render(<SearchBar value="test search" onChange={() => {}} />)
    
    const input = screen.getByRole('searchbox') as HTMLInputElement
    expect(input.value).toBe('test search')
  })

  it('should call onChange when input changes', () => {
    const handleChange = vi.fn()
    render(<SearchBar value="" onChange={handleChange} />)
    
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    expect(handleChange).toHaveBeenCalledWith('new value')
  })
})
