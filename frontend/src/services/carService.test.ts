import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as carService from './carService'
import * as api from './api'

vi.mock('./api')

describe('carService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCars', () => {
    it('should fetch cars without parameters', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      const result = await carService.getCars()

      expect(api.apiGet).toHaveBeenCalledWith('/cars')
      expect(result).toEqual(mockResponse)
    })

    it('should fetch cars with pagination', async () => {
      const mockResponse = {
        data: [],
        page: 2,
        limit: 10,
        total: 50,
        total_pages: 5,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      await carService.getCars({ page: 2, limit: 10 })

      expect(api.apiGet).toHaveBeenCalledWith('/cars?page=2&limit=10')
    })

    it('should fetch cars with status filter', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20, total: 0, total_pages: 0 })

      await carService.getCars({ status: 'active' })

      expect(api.apiGet).toHaveBeenCalledWith('/cars?status=active')
    })

    it('should fetch cars with search query', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20, total: 0, total_pages: 0 })

      await carService.getCars({ search: 'Toyota' })

      expect(api.apiGet).toHaveBeenCalledWith('/cars?search=Toyota')
    })

    it('should fetch cars with all parameters', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20, total: 0, total_pages: 0 })

      await carService.getCars({ 
        page: 2, 
        limit: 15, 
        status: 'maintenance',
        search: 'AB-123-CD'
      })

      expect(api.apiGet).toHaveBeenCalledWith('/cars?page=2&limit=15&status=maintenance&search=AB-123-CD')
    })
  })

  describe('getCar', () => {
    it('should fetch a single car by id', async () => {
      const mockCar = {
        id: '123',
        licensePlate: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
        status: 'active' as const,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockCar)

      const result = await carService.getCar('123')

      expect(api.apiGet).toHaveBeenCalledWith('/cars/123')
      expect(result).toEqual(mockCar)
    })
  })

  describe('createCar', () => {
    it('should create a new car', async () => {
      const carData = {
        licensePlate: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
        greyCardNumber: 'GC123456',
        insuranceCompanyId: 'ins-1',
        rentalStartDate: '2024-01-01',
        status: 'active' as const,
      }
      
      const mockResponse = { id: '123', ...carData }
      vi.mocked(api.apiPost).mockResolvedValue(mockResponse)

      const result = await carService.createCar(carData)

      expect(api.apiPost).toHaveBeenCalledWith('/cars', carData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateCar', () => {
    it('should update a car', async () => {
      const updateData = {
        brand: 'Honda',
        model: 'Civic',
        status: 'maintenance' as const,
      }
      
      const mockResponse = { id: '123', ...updateData }
      vi.mocked(api.apiPut).mockResolvedValue(mockResponse)

      const result = await carService.updateCar('123', updateData)

      expect(api.apiPut).toHaveBeenCalledWith('/cars/123', updateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteCar', () => {
    it('should delete a car', async () => {
      vi.mocked(api.apiDelete).mockResolvedValue(undefined)

      await carService.deleteCar('123')

      expect(api.apiDelete).toHaveBeenCalledWith('/cars/123')
    })
  })
})
