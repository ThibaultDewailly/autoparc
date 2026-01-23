import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiGet, apiPost, apiPut, apiDelete, ApiClientError } from './api'

global.fetch = vi.fn()

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('apiGet', () => {
    it('should make GET request and return data', async () => {
      const mockData = { id: '1', name: 'Test' }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response)

      const result = await apiGet('/test')

      expect(fetch).toHaveBeenCalledWith('/api/v1/test', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual(mockData)
    })

    it('should throw ApiClientError on failure', async () => {
      const errorData = { message: 'Not found', code: 'NOT_FOUND' }
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => errorData,
      } as Response)

      await expect(apiGet('/test')).rejects.toThrow(ApiClientError)
      await expect(apiGet('/test')).rejects.toThrow('Not found')
    })

    it('should handle error without JSON body', async () => {
      // @ts-expect-error - mocking Response object for testing
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as Response)

      await expect(apiGet('/test')).rejects.toThrow('Internal Server Error')
    })
  })

  describe('apiPost', () => {
    it('should make POST request with data', async () => {
      const postData = { name: 'Test' }
      const responseData = { id: '1', ...postData }
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => responseData,
      } as Response)

      const result = await apiPost('/test', postData)

      expect(fetch).toHaveBeenCalledWith('/api/v1/test', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
      expect(result).toEqual(responseData)
    })

    it('should handle 204 No Content response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      } as Response)

      const result = await apiPost('/test')
      expect(result).toEqual({})
    })
  })

  describe('apiPut', () => {
    it('should make PUT request with data', async () => {
      const putData = { name: 'Updated' }
      const responseData = { id: '1', ...putData }
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => responseData,
      } as Response)

      const result = await apiPut('/test/1', putData)

      expect(fetch).toHaveBeenCalledWith('/api/v1/test/1', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(putData),
      })
      expect(result).toEqual(responseData)
    })
  })

  describe('apiDelete', () => {
    it('should make DELETE request', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      } as Response)

      const result = await apiDelete('/test/1')

      expect(fetch).toHaveBeenCalledWith('/api/v1/test/1', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual({})
    })
  })

  describe('ApiClientError', () => {
    it('should create error with correct properties', () => {
      const errorData = { error: 'Test error', message: 'Test error', code: 'TEST_ERROR' }
      const error = new ApiClientError('Test error', 400, errorData)

      expect(error.message).toBe('Test error')
      expect(error.status).toBe(400)
      expect(error.data).toEqual(errorData)
      expect(error.name).toBe('ApiClientError')
    })
  })
})
