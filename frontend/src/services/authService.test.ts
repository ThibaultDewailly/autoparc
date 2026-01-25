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
      const mockBackendResponse = { 
        user: { 
          id: '1', 
          email: credentials.email,
          first_name: 'Test',
          last_name: 'User',
          role: 'admin',
          is_active: true
        },
        session: {
          id: 'session-1',
          user_id: '1',
          session_token: 'token123',
          expires_at: '2024-12-31T23:59:59Z',
          created_at: '2024-01-01T00:00:00Z'
        }
      }
      
      vi.mocked(api.apiPost).mockResolvedValue(mockBackendResponse)

      const result = await authService.login(credentials)

      expect(api.apiPost).toHaveBeenCalledWith('/auth/login', credentials)
      expect(result.user.firstName).toBe('Test')
      expect(result.user.lastName).toBe('User')
      // Session is stored in httpOnly cookie, not returned in login response
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
      const mockBackendUser = { 
        id: '1', 
        email: 'test@test.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'admin',
        is_active: true,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockBackendUser)

      const result = await authService.getCurrentUser()

      expect(api.apiGet).toHaveBeenCalledWith('/auth/me')
      expect(result.firstName).toBe('Test')
      expect(result.lastName).toBe('User')
      expect(result.isActive).toBe(true)
    })
  })
})
