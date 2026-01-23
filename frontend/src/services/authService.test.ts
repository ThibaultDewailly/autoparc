import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authService from './authService'
import * as api from './api'

vi.mock('./api')

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call apiPost with correct parameters', async () => {
      const credentials = { email: 'test@test.com', password: 'password123' }
      const mockResponse = { user: { id: '1', email: credentials.email } }
      
      vi.mocked(api.apiPost).mockResolvedValue(mockResponse)

      const result = await authService.login(credentials)

      expect(api.apiPost).toHaveBeenCalledWith('/auth/login', credentials)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('logout', () => {
    it('should call apiPost to logout endpoint', async () => {
      vi.mocked(api.apiPost).mockResolvedValue(undefined)

      await authService.logout()

      expect(api.apiPost).toHaveBeenCalledWith('/auth/logout')
    })
  })

  describe('getCurrentUser', () => {
    it('should call apiGet to fetch current user', async () => {
      const mockUser = { 
        id: '1', 
        email: 'test@test.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockUser)

      const result = await authService.getCurrentUser()

      expect(api.apiGet).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(mockUser)
    })
  })
})
