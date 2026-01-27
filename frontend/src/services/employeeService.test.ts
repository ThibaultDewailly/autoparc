import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as employeeService from './employeeService'
import * as api from './api'
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest, ChangePasswordRequest } from '@/types'

vi.mock('./api')

describe('employeeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getEmployees', () => {
    it('should fetch employees without parameters', async () => {
      const mockResponse = {
        employees: [],
        totalCount: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      const result = await employeeService.getEmployees()

      expect(api.apiGet).toHaveBeenCalledWith('/employees')
      expect(result).toEqual(mockResponse)
    })

    it('should fetch employees with pagination', async () => {
      const mockResponse = {
        employees: [],
        totalCount: 50,
        page: 2,
        limit: 10,
        totalPages: 5,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      await employeeService.getEmployees({ page: 2, limit: 10 })

      expect(api.apiGet).toHaveBeenCalledWith('/employees?page=2&limit=10')
    })

    it('should fetch employees with search query', async () => {
      const mockResponse = {
        employees: [],
        totalCount: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      await employeeService.getEmployees({ search: 'John' })

      expect(api.apiGet).toHaveBeenCalledWith('/employees?search=John')
    })

    it('should fetch employees with isActive filter', async () => {
      const mockResponse = {
        employees: [],
        totalCount: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      await employeeService.getEmployees({ isActive: true })

      expect(api.apiGet).toHaveBeenCalledWith('/employees?is_active=true')
    })

    it('should fetch employees with role filter', async () => {
      const mockResponse = {
        employees: [],
        totalCount: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      await employeeService.getEmployees({ role: 'admin' })

      expect(api.apiGet).toHaveBeenCalledWith('/employees?role=admin')
    })

    it('should fetch employees with all parameters', async () => {
      const mockResponse = {
        employees: [],
        totalCount: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockResponse)

      await employeeService.getEmployees({
        page: 2,
        limit: 15,
        search: 'test',
        isActive: true,
        role: 'admin',
        sortBy: 'created_at',
        order: 'desc',
      })

      expect(api.apiGet).toHaveBeenCalledWith('/employees?page=2&limit=15&search=test&is_active=true&role=admin&sort_by=created_at&order=desc')
    })
  })

  describe('getEmployee', () => {
    it('should fetch a single employee by id', async () => {
      const mockEmployee: Employee = {
        id: '123',
        email: 'test@autoparc.fr',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }
      
      vi.mocked(api.apiGet).mockResolvedValue(mockEmployee)

      const result = await employeeService.getEmployee('123')

      expect(api.apiGet).toHaveBeenCalledWith('/employees/123')
      expect(result).toEqual(mockEmployee)
    })
  })

  describe('createEmployee', () => {
    it('should create a new employee', async () => {
      const employeeData: CreateEmployeeRequest = {
        email: 'new@autoparc.fr',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'admin',
      }

      const mockResponse: Employee = {
        id: '456',
        email: 'new@autoparc.fr',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'admin',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }
      
      vi.mocked(api.apiPost).mockResolvedValue(mockResponse)

      const result = await employeeService.createEmployee(employeeData)

      expect(api.apiPost).toHaveBeenCalledWith('/employees', employeeData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle creation errors', async () => {
      const employeeData: CreateEmployeeRequest = {
        email: 'existing@autoparc.fr',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'admin',
      }

      const error = new Error('Email already exists')
      vi.mocked(api.apiPost).mockRejectedValue(error)

      await expect(employeeService.createEmployee(employeeData)).rejects.toThrow('Email already exists')
    })
  })

  describe('updateEmployee', () => {
    it('should update an employee', async () => {
      const updateData: UpdateEmployeeRequest = {
        firstName: 'Updated',
        lastName: 'Name',
      }

      const mockResponse: Employee = {
        id: '123',
        email: 'test@autoparc.fr',
        firstName: 'Updated',
        lastName: 'Name',
        role: 'admin',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      }
      
      vi.mocked(api.apiPut).mockResolvedValue(mockResponse)

      const result = await employeeService.updateEmployee('123', updateData)

      expect(api.apiPut).toHaveBeenCalledWith('/employees/123', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should update employee status', async () => {
      const updateData: UpdateEmployeeRequest = {
        isActive: false,
      }

      const mockResponse: Employee = {
        id: '123',
        email: 'test@autoparc.fr',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        isActive: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      }
      
      vi.mocked(api.apiPut).mockResolvedValue(mockResponse)

      const result = await employeeService.updateEmployee('123', updateData)

      expect(api.apiPut).toHaveBeenCalledWith('/employees/123', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle update errors', async () => {
      const updateData: UpdateEmployeeRequest = {
        email: 'taken@autoparc.fr',
      }

      const error = new Error('Email already exists')
      vi.mocked(api.apiPut).mockRejectedValue(error)

      await expect(employeeService.updateEmployee('123', updateData)).rejects.toThrow('Email already exists')
    })
  })

  describe('changePassword', () => {
    it('should change employee password', async () => {
      const passwordData: ChangePasswordRequest = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      }
      
      vi.mocked(api.apiPost).mockResolvedValue(undefined)

      await employeeService.changePassword('123', passwordData)

      expect(api.apiPost).toHaveBeenCalledWith('/employees/123/change-password', passwordData)
    })

    it('should handle incorrect current password', async () => {
      const passwordData: ChangePasswordRequest = {
        currentPassword: 'WrongPass123!',
        newPassword: 'NewPass123!',
      }

      const error = new Error('Current password is incorrect')
      vi.mocked(api.apiPost).mockRejectedValue(error)

      await expect(employeeService.changePassword('123', passwordData)).rejects.toThrow('Current password is incorrect')
    })

    it('should handle weak new password', async () => {
      const passwordData: ChangePasswordRequest = {
        currentPassword: 'OldPass123!',
        newPassword: 'weak',
      }

      const error = new Error('Password does not meet strength requirements')
      vi.mocked(api.apiPost).mockRejectedValue(error)

      await expect(employeeService.changePassword('123', passwordData)).rejects.toThrow('Password does not meet strength requirements')
    })
  })

  describe('deleteEmployee', () => {
    it('should delete an employee', async () => {
      vi.mocked(api.apiDelete).mockResolvedValue(undefined)

      await employeeService.deleteEmployee('123')

      expect(api.apiDelete).toHaveBeenCalledWith('/employees/123')
    })

    it('should handle delete errors', async () => {
      const error = new Error('Employee not found')
      vi.mocked(api.apiDelete).mockRejectedValue(error)

      await expect(employeeService.deleteEmployee('nonexistent')).rejects.toThrow('Employee not found')
    })
  })
})
