import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as repairService from './repairService'
import * as api from './api'

vi.mock('./api')

describe('repairService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRepairs', () => {
    it('should fetch repairs without parameters', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      const result = await repairService.getRepairs()

      expect(api.apiGet).toHaveBeenCalledWith('/repairs')
      expect(result).toEqual(mockResponse)
    })

    it('should fetch repairs with pagination', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 2, limit: 10 })

      await repairService.getRepairs({ page: 2, limit: 10 })

      expect(api.apiGet).toHaveBeenCalledWith('/repairs?page=2&limit=10')
    })

    it('should fetch repairs with car filter', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20 })

      await repairService.getRepairs({ carId: 'car-123' })

      expect(api.apiGet).toHaveBeenCalledWith('/repairs?car_id=car-123')
    })

    it('should fetch repairs with accident filter', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20 })

      await repairService.getRepairs({ accidentId: 'accident-123' })

      expect(api.apiGet).toHaveBeenCalledWith('/repairs?accident_id=accident-123')
    })

    it('should fetch repairs with garage filter', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20 })

      await repairService.getRepairs({ garageId: 'garage-123' })

      expect(api.apiGet).toHaveBeenCalledWith('/repairs?garage_id=garage-123')
    })

    it('should fetch repairs with repair type filter', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20 })

      await repairService.getRepairs({ repairType: 'maintenance' })

      expect(api.apiGet).toHaveBeenCalledWith('/repairs?repair_type=maintenance')
    })

    it('should fetch repairs with status filter', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20 })

      await repairService.getRepairs({ status: 'in_progress' })

      expect(api.apiGet).toHaveBeenCalledWith('/repairs?status=in_progress')
    })

    it('should fetch repairs with date range', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20 })

      await repairService.getRepairs({ 
        startDate: '2026-01-01', 
        endDate: '2026-01-31' 
      })

      expect(api.apiGet).toHaveBeenCalledWith('/repairs?start_date=2026-01-01&end_date=2026-01-31')
    })

    it('should fetch repairs with all parameters', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ data: [], page: 1, limit: 20 })

      await repairService.getRepairs({ 
        page: 2, 
        limit: 15, 
        carId: 'car-123',
        accidentId: 'accident-123',
        garageId: 'garage-123',
        repairType: 'accident',
        status: 'completed',
        startDate: '2026-01-01',
        endDate: '2026-01-31'
      })

      expect(api.apiGet).toHaveBeenCalledWith('/repairs?page=2&limit=15&car_id=car-123&accident_id=accident-123&garage_id=garage-123&repair_type=accident&status=completed&start_date=2026-01-01&end_date=2026-01-31')
    })
  })

  describe('getRepair', () => {
    it('should fetch a single repair by id', async () => {
      const mockRepair = {
        id: '123',
        carId: 'car-123',
        garageId: 'garage-123',
        repairType: 'maintenance' as const,
        description: 'Oil change',
        startDate: '2026-01-15',
        status: 'completed' as const,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockRepair)

      const result = await repairService.getRepair('123')

      expect(api.apiGet).toHaveBeenCalledWith('/repairs/123')
      expect(result).toEqual(mockRepair)
    })
  })

  describe('getRepairsByCar', () => {
    it('should fetch repairs for a specific car', async () => {
      const mockRepairs = [
        { id: '1', carId: 'car-123', repairType: 'maintenance' },
        { id: '2', carId: 'car-123', repairType: 'accident' },
      ]
      
      vi.mocked(api.apiGet).mockResolvedValue({ data: mockRepairs, page: 1, limit: 20 })

      const result = await repairService.getRepairsByCar('car-123')

      expect(api.apiGet).toHaveBeenCalledWith('/repairs?car_id=car-123')
      expect(result).toEqual(mockRepairs)
    })

    it('should return empty array if no data', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({ page: 1, limit: 20 })

      const result = await repairService.getRepairsByCar('car-123')

      expect(result).toEqual([])
    })
  })

  describe('getRepairsByAccident', () => {
    it('should fetch repairs for a specific accident', async () => {
      const mockRepairs = [
        { id: '1', accidentId: 'accident-123', repairType: 'accident' },
        { id: '2', accidentId: 'accident-123', repairType: 'accident' },
      ]
      
      vi.mocked(api.apiGet).mockResolvedValue({ data: mockRepairs, page: 1, limit: 20 })

      const result = await repairService.getRepairsByAccident('accident-123')

      expect(api.apiGet).toHaveBeenCalledWith('/repairs?accident_id=accident-123')
      expect(result).toEqual(mockRepairs)
    })
  })

  describe('getRepairsByGarage', () => {
    it('should fetch repairs for a specific garage', async () => {
      const mockRepairs = [
        { id: '1', garageId: 'garage-123' },
        { id: '2', garageId: 'garage-123' },
      ]
      
      vi.mocked(api.apiGet).mockResolvedValue({ data: mockRepairs, page: 1, limit: 20 })

      const result = await repairService.getRepairsByGarage('garage-123')

      expect(api.apiGet).toHaveBeenCalledWith('/repairs?garage_id=garage-123')
      expect(result).toEqual(mockRepairs)
    })
  })

  describe('createRepair', () => {
    it('should create a new repair', async () => {
      const repairData = {
        carId: 'car-123',
        garageId: 'garage-123',
        repairType: 'maintenance' as const,
        description: 'Oil change and filter replacement',
        startDate: '2026-02-01',
        cost: 150.50,
      }
      
      const mockCreatedRepair = {
        id: '123',
        ...repairData,
        status: 'scheduled' as const,
        createdAt: '2026-01-29T10:00:00Z',
        updatedAt: '2026-01-29T10:00:00Z',
        createdBy: 'user-123',
      }
      
      vi.mocked(api.apiPost).mockResolvedValue(mockCreatedRepair)

      const result = await repairService.createRepair(repairData)

      expect(api.apiPost).toHaveBeenCalledWith('/repairs', repairData)
      expect(result).toEqual(mockCreatedRepair)
    })

    it('should create an accident-related repair', async () => {
      const repairData = {
        carId: 'car-123',
        accidentId: 'accident-123',
        garageId: 'garage-123',
        repairType: 'accident' as const,
        description: 'Front bumper replacement',
        startDate: '2026-02-01',
        endDate: '2026-02-05',
        cost: 1200.00,
      }
      
      vi.mocked(api.apiPost).mockResolvedValue({ id: '456', ...repairData })

      await repairService.createRepair(repairData)

      expect(api.apiPost).toHaveBeenCalledWith('/repairs', repairData)
    })
  })

  describe('updateRepair', () => {
    it('should update a repair', async () => {
      const updateData = {
        description: 'Updated description',
        cost: 200.00,
        endDate: '2026-02-10',
      }
      
      vi.mocked(api.apiPut).mockResolvedValue({ id: '123', ...updateData })

      const result = await repairService.updateRepair('123', updateData)

      expect(api.apiPut).toHaveBeenCalledWith('/repairs/123', updateData)
      expect(result).toEqual({ id: '123', ...updateData })
    })
  })

  describe('deleteRepair', () => {
    it('should delete a repair', async () => {
      vi.mocked(api.apiDelete).mockResolvedValue(undefined)

      await repairService.deleteRepair('123')

      expect(api.apiDelete).toHaveBeenCalledWith('/repairs/123')
    })
  })

  describe('updateRepairStatus', () => {
    it('should update repair status', async () => {
      const mockUpdatedRepair = {
        id: '123',
        status: 'in_progress' as const,
      }
      
      vi.mocked(api.apiPut).mockResolvedValue(mockUpdatedRepair)

      const result = await repairService.updateRepairStatus('123', 'in_progress')

      expect(api.apiPut).toHaveBeenCalledWith('/repairs/123/status', { status: 'in_progress' })
      expect(result).toEqual(mockUpdatedRepair)
    })
  })
})
