import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as operatorService from './operatorService'
import * as api from './api'

vi.mock('./api')

describe('operatorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOperators', () => {
    it('should fetch operators without parameters', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      }

      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      const result = await operatorService.getOperators()

      expect(api.apiGet).toHaveBeenCalledWith('/operators')
      expect(result).toEqual(mockResponse)
    })

    it('should fetch operators with pagination', async () => {
      const mockResponse = {
        data: [],
        page: 2,
        limit: 10,
        total: 50,
        total_pages: 5,
      }

      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      await operatorService.getOperators({ page: 2, limit: 10 })

      expect(api.apiGet).toHaveBeenCalledWith('/operators?page=2&limit=10')
    })

    it('should fetch operators with search query', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      })

      await operatorService.getOperators({ search: 'Dupont' })

      expect(api.apiGet).toHaveBeenCalledWith('/operators?search=Dupont')
    })

    it('should fetch operators with department filter', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      })

      await operatorService.getOperators({ department: 'IT' })

      expect(api.apiGet).toHaveBeenCalledWith('/operators?department=IT')
    })

    it('should fetch operators with is_active filter', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      })

      await operatorService.getOperators({ is_active: true })

      expect(api.apiGet).toHaveBeenCalledWith('/operators?is_active=true')
    })

    it('should fetch operators with sort parameters', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      })

      await operatorService.getOperators({ sort_by: 'last_name', order: 'asc' })

      expect(api.apiGet).toHaveBeenCalledWith(
        '/operators?sort_by=last_name&order=asc'
      )
    })

    it('should fetch operators with all parameters', async () => {
      vi.mocked(api.apiGet).mockResolvedValue({
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      })

      await operatorService.getOperators({
        page: 3,
        limit: 15,
        search: 'Jean',
        department: 'Marketing',
        is_active: false,
        sort_by: 'first_name',
        order: 'desc',
      })

      expect(api.apiGet).toHaveBeenCalledWith(
        '/operators?page=3&limit=15&search=Jean&department=Marketing&is_active=false&sort_by=first_name&order=desc'
      )
    })
  })

  describe('getOperator', () => {
    it('should fetch a single operator by id', async () => {
      const mockOperator = {
        id: '123',
        employee_number: 'EMP001',
        first_name: 'Jean',
        last_name: 'Dupont',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        assignment_history: [],
      }

      vi.mocked(api.apiGet).mockResolvedValue(mockOperator)

      const result = await operatorService.getOperator('123')

      expect(api.apiGet).toHaveBeenCalledWith('/operators/123')
      expect(result).toEqual(mockOperator)
    })
  })

  describe('createOperator', () => {
    it('should create a new operator', async () => {
      const operatorData = {
        employee_number: 'EMP001',
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+33612345678',
        department: 'IT',
      }

      const mockResponse = {
        id: '123',
        ...operatorData,
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      vi.mocked(api.apiPost).mockResolvedValue(mockResponse)

      const result = await operatorService.createOperator(operatorData)

      expect(api.apiPost).toHaveBeenCalledWith('/operators', operatorData)
      expect(result).toEqual(mockResponse)
    })

    it('should create operator with minimal fields', async () => {
      const operatorData = {
        employee_number: 'EMP002',
        first_name: 'Marie',
        last_name: 'Martin',
      }

      const mockResponse = {
        id: '456',
        ...operatorData,
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      vi.mocked(api.apiPost).mockResolvedValue(mockResponse)

      const result = await operatorService.createOperator(operatorData)

      expect(api.apiPost).toHaveBeenCalledWith('/operators', operatorData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateOperator', () => {
    it('should update an operator', async () => {
      const updateData = {
        first_name: 'Jean-Pierre',
        phone: '+33698765432',
      }

      const mockResponse = {
        id: '123',
        employee_number: 'EMP001',
        first_name: 'Jean-Pierre',
        last_name: 'Dupont',
        phone: '+33698765432',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-28T00:00:00Z',
      }

      vi.mocked(api.apiPut).mockResolvedValue(mockResponse)

      const result = await operatorService.updateOperator('123', updateData)

      expect(api.apiPut).toHaveBeenCalledWith('/operators/123', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should deactivate an operator', async () => {
      const updateData = {
        is_active: false,
      }

      const mockResponse = {
        id: '123',
        employee_number: 'EMP001',
        first_name: 'Jean',
        last_name: 'Dupont',
        is_active: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-28T00:00:00Z',
      }

      vi.mocked(api.apiPut).mockResolvedValue(mockResponse)

      const result = await operatorService.updateOperator('123', updateData)

      expect(api.apiPut).toHaveBeenCalledWith('/operators/123', updateData)
      expect(result.is_active).toBe(false)
    })
  })

  describe('deleteOperator', () => {
    it('should delete an operator', async () => {
      vi.mocked(api.apiDelete).mockResolvedValue(undefined)

      await operatorService.deleteOperator('123')

      expect(api.apiDelete).toHaveBeenCalledWith('/operators/123')
    })
  })

  describe('assignOperatorToCar', () => {
    it('should assign an operator to a car', async () => {
      const assignmentData = {
        operator_id: 'op-123',
        start_date: '2025-01-01',
        notes: 'New assignment',
      }

      const mockResponse = {
        id: 'assignment-123',
        car_id: 'car-456',
        operator_id: 'op-123',
        start_date: '2025-01-01',
        notes: 'New assignment',
        created_at: '2025-01-01T00:00:00Z',
      }

      vi.mocked(api.apiPost).mockResolvedValue(mockResponse)

      const result = await operatorService.assignOperatorToCar(
        'car-456',
        assignmentData
      )

      expect(api.apiPost).toHaveBeenCalledWith(
        '/cars/car-456/assign',
        assignmentData
      )
      expect(result).toEqual(mockResponse)
    })

    it('should assign operator without notes', async () => {
      const assignmentData = {
        operator_id: 'op-123',
        start_date: '2025-01-01',
      }

      const mockResponse = {
        id: 'assignment-123',
        car_id: 'car-456',
        operator_id: 'op-123',
        start_date: '2025-01-01',
        created_at: '2025-01-01T00:00:00Z',
      }

      vi.mocked(api.apiPost).mockResolvedValue(mockResponse)

      const result = await operatorService.assignOperatorToCar(
        'car-456',
        assignmentData
      )

      expect(api.apiPost).toHaveBeenCalledWith(
        '/cars/car-456/assign',
        assignmentData
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('unassignOperatorFromCar', () => {
    it('should unassign an operator from a car', async () => {
      const unassignmentData = {
        end_date: '2025-12-31',
        notes: 'End of assignment',
      }

      vi.mocked(api.apiPost).mockResolvedValue(undefined)

      await operatorService.unassignOperatorFromCar('car-456', unassignmentData)

      expect(api.apiPost).toHaveBeenCalledWith(
        '/cars/car-456/unassign',
        unassignmentData
      )
    })

    it('should unassign operator without notes', async () => {
      const unassignmentData = {
        end_date: '2025-12-31',
      }

      vi.mocked(api.apiPost).mockResolvedValue(undefined)

      await operatorService.unassignOperatorFromCar('car-456', unassignmentData)

      expect(api.apiPost).toHaveBeenCalledWith(
        '/cars/car-456/unassign',
        unassignmentData
      )
    })
  })

  describe('getCarAssignmentHistory', () => {
    it('should fetch assignment history for a car', async () => {
      const mockHistory = [
        {
          id: 'assignment-1',
          car_id: 'car-123',
          operator_id: 'op-456',
          start_date: '2025-01-01',
          end_date: '2025-06-30',
          created_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'assignment-2',
          car_id: 'car-123',
          operator_id: 'op-789',
          start_date: '2025-07-01',
          created_at: '2025-07-01T00:00:00Z',
        },
      ]

      vi.mocked(api.apiGet).mockResolvedValue(mockHistory)

      const result = await operatorService.getCarAssignmentHistory('car-123')

      expect(api.apiGet).toHaveBeenCalledWith('/cars/car-123/assignment-history')
      expect(result).toEqual(mockHistory)
    })

    it('should handle empty assignment history', async () => {
      vi.mocked(api.apiGet).mockResolvedValue([])

      const result = await operatorService.getCarAssignmentHistory('car-123')

      expect(result).toEqual([])
    })
  })

  describe('getOperatorAssignmentHistory', () => {
    it('should fetch assignment history for an operator', async () => {
      const mockHistory = [
        {
          id: 'assignment-1',
          car_id: 'car-123',
          operator_id: 'op-456',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'assignment-2',
          car_id: 'car-789',
          operator_id: 'op-456',
          start_date: '2025-01-01',
          created_at: '2025-01-01T00:00:00Z',
        },
      ]

      vi.mocked(api.apiGet).mockResolvedValue(mockHistory)

      const result =
        await operatorService.getOperatorAssignmentHistory('op-456')

      expect(api.apiGet).toHaveBeenCalledWith(
        '/operators/op-456/assignment-history'
      )
      expect(result).toEqual(mockHistory)
    })

    it('should handle empty assignment history', async () => {
      vi.mocked(api.apiGet).mockResolvedValue([])

      const result =
        await operatorService.getOperatorAssignmentHistory('op-456')

      expect(result).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should propagate errors from apiGet', async () => {
      const error = new Error('Network error')
      vi.mocked(api.apiGet).mockRejectedValue(error)

      await expect(operatorService.getOperators()).rejects.toThrow(
        'Network error'
      )
    })

    it('should propagate errors from apiPost', async () => {
      const error = new Error('Validation error')
      vi.mocked(api.apiPost).mockRejectedValue(error)

      const operatorData = {
        employee_number: 'EMP001',
        first_name: 'Jean',
        last_name: 'Dupont',
      }

      await expect(
        operatorService.createOperator(operatorData)
      ).rejects.toThrow('Validation error')
    })

    it('should propagate errors from apiPut', async () => {
      const error = new Error('Not found')
      vi.mocked(api.apiPut).mockRejectedValue(error)

      await expect(
        operatorService.updateOperator('123', { first_name: 'Jane' })
      ).rejects.toThrow('Not found')
    })

    it('should propagate errors from apiDelete', async () => {
      const error = new Error('Forbidden')
      vi.mocked(api.apiDelete).mockRejectedValue(error)

      await expect(operatorService.deleteOperator('123')).rejects.toThrow(
        'Forbidden'
      )
    })
  })
})
