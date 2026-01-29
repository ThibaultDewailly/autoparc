import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as garageService from './garageService'
import * as api from './api'

vi.mock('./api')

describe('garageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getGarages', () => {
    it('should fetch garages without parameters', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      const result = await garageService.getGarages()

      expect(api.apiGet).toHaveBeenCalledWith('/garages')
      expect(result).toEqual(mockResponse)
    })

    it('should fetch garages with pagination', async () => {
      const mockResponse = {
        data: [],
        page: 2,
        limit: 10,
        total: 50,
        total_pages: 5,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      await garageService.getGarages({ page: 2, limit: 10 })

      expect(api.apiGet).toHaveBeenCalledWith('/garages?page=2&limit=10')
    })

    it('should fetch garages with active filter', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20, total: 0, total_pages: 0 })

      await garageService.getGarages({ isActive: true })

      expect(api.apiGet).toHaveBeenCalledWith('/garages?is_active=true')
    })

    it('should fetch garages with search query', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20, total: 0, total_pages: 0 })

      await garageService.getGarages({ search: 'Auto Repair' })

      expect(api.apiGet).toHaveBeenCalledWith('/garages?search=Auto+Repair')
    })

    it('should fetch garages with all parameters', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20, total: 0, total_pages: 0 })

      await garageService.getGarages({ 
        page: 2, 
        limit: 15, 
        isActive: false,
        search: 'Garage'
      })

      expect(api.apiGet).toHaveBeenCalledWith('/garages?page=2&limit=15&search=Garage&is_active=false')
    })
  })

  describe('getGarage', () => {
    it('should fetch a single garage by id', async () => {
      const mockGarage = {
        id: '123',
        name: 'Auto Repair Pro',
        phone: '0123456789',
        address: '123 Main St',
        isActive: true,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockGarage)

      const result = await garageService.getGarage('123')

      expect(api.apiGet).toHaveBeenCalledWith('/garages/123')
      expect(result).toEqual(mockGarage)
    })
  })

  describe('createGarage', () => {
    it('should create a new garage', async () => {
      const garageData = {
        name: 'Auto Repair Pro',
        phone: '0123456789',
        address: '123 Main St',
        email: 'contact@autorepair.com',
        specialization: 'Carrosserie',
      }
      
      const mockCreatedGarage = {
        id: '123',
        ...garageData,
        isActive: true,
        createdAt: '2026-01-29T10:00:00Z',
        updatedAt: '2026-01-29T10:00:00Z',
        createdBy: 'user-123',
      }
      
      vi.mocked(api.apiPost).mockResolvedValue(mockCreatedGarage)

      const result = await garageService.createGarage(garageData)

      expect(api.apiPost).toHaveBeenCalledWith('/garages', garageData)
      expect(result).toEqual(mockCreatedGarage)
    })

    it('should create a garage with minimal data', async () => {
      const garageData = {
        name: 'Simple Garage',
        phone: '0123456789',
        address: '456 Oak St',
      }
      
      vi.mocked(api.apiPost).mockResolvedValue({ id: '456', ...garageData })

      await garageService.createGarage(garageData)

      expect(api.apiPost).toHaveBeenCalledWith('/garages', garageData)
    })
  })

  describe('updateGarage', () => {
    it('should update a garage', async () => {
      const updateData = {
        name: 'Updated Garage Name',
        phone: '0987654321',
      }
      
      const mockUpdatedGarage = {
        id: '123',
        ...updateData,
        address: '123 Main St',
        isActive: true,
      }
      
      vi.mocked(api.apiPut).mockResolvedValue(mockUpdatedGarage)

      const result = await garageService.updateGarage('123', updateData)

      expect(api.apiPut).toHaveBeenCalledWith('/garages/123', updateData)
      expect(result).toEqual(mockUpdatedGarage)
    })

    it('should update single field', async () => {
      const updateData = { email: 'newemail@garage.com' }
      
      vi.mocked(api.apiPut).mockResolvedValue({ id: '123', ...updateData })

      await garageService.updateGarage('123', updateData)

      expect(api.apiPut).toHaveBeenCalledWith('/garages/123', updateData)
    })
  })

  describe('deleteGarage', () => {
    it('should delete a garage', async () => {
      vi.mocked(api.apiDelete).mockResolvedValue(undefined)

      await garageService.deleteGarage('123')

      expect(api.apiDelete).toHaveBeenCalledWith('/garages/123')
    })
  })

  describe('searchGarages', () => {
    it('should search garages with query', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Auto Repair' }],
        page: 1,
        limit: 100,
        total: 1,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      const result = await garageService.searchGarages('Auto')

      expect(api.apiGet).toHaveBeenCalledWith('/garages?limit=100&search=Auto')
      expect(result).toEqual(mockResponse)
    })
  })
})
