 
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee, useChangePassword, useDeleteEmployee } from './useEmployees'
import * as employeeService from '@/services/employeeService'
import type { Employee } from '@/types'

vi.mock('@/services/employeeService')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return function Wrapper({ children }: { children: any }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useEmployees', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch employees', async () => {
    const mockData = {
      employees: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    }
    
    vi.mocked(employeeService.getEmployees).mockResolvedValue(mockData)

    const { result } = renderHook(() => useEmployees(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockData)
  })

  it('should fetch employees with params', async () => {
    const mockData = {
      employees: [],
      totalCount: 50,
      page: 2,
      limit: 10,
      totalPages: 5,
    }
    
    vi.mocked(employeeService.getEmployees).mockResolvedValue(mockData)

    const { result } = renderHook(() => useEmployees({ page: 2, limit: 10, role: 'admin' }), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(employeeService.getEmployees).toHaveBeenCalledWith({ page: 2, limit: 10, role: 'admin' })
  })

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch employees')
    vi.mocked(employeeService.getEmployees).mockRejectedValue(error)

    const { result } = renderHook(() => useEmployees(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(error)
  })
})

describe('useEmployee', () => {
  it('should fetch single employee', async () => {
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
    
    vi.mocked(employeeService.getEmployee).mockResolvedValue(mockEmployee)

    const { result } = renderHook(() => useEmployee('123'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockEmployee)
  })

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useEmployee(undefined), { wrapper: createWrapper() })

    expect(result.current.isFetching).toBe(false)
  })

  it('should handle not found error', async () => {
    const error = new Error('Employee not found')
    vi.mocked(employeeService.getEmployee).mockRejectedValue(error)

    const { result } = renderHook(() => useEmployee('nonexistent'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(error)
  })
})

describe('useCreateEmployee', () => {
  it('should create employee', async () => {
    const newEmployee = {
      email: 'new@autoparc.fr',
      password: 'SecurePass123!',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'admin',
    }

    const createdEmployee: Employee = {
      id: '456',
      email: 'new@autoparc.fr',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'admin',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }
    
    vi.mocked(employeeService.createEmployee).mockResolvedValue(createdEmployee)

    const { result } = renderHook(() => useCreateEmployee(), { wrapper: createWrapper() })

    result.current.mutate(newEmployee)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(employeeService.createEmployee).toHaveBeenCalledWith(newEmployee, expect.anything())
  })

  it('should handle creation errors', async () => {
    const newEmployee = {
      email: 'existing@autoparc.fr',
      password: 'SecurePass123!',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'admin',
    }

    const error = new Error('Email already exists')
    vi.mocked(employeeService.createEmployee).mockRejectedValue(error)

    const { result } = renderHook(() => useCreateEmployee(), { wrapper: createWrapper() })

    result.current.mutate(newEmployee)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(error)
  })
})

describe('useUpdateEmployee', () => {
  it('should update employee', async () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    }

    const updatedEmployee: Employee = {
      id: '123',
      email: 'test@autoparc.fr',
      firstName: 'Updated',
      lastName: 'Name',
      role: 'admin',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    }
    
    vi.mocked(employeeService.updateEmployee).mockResolvedValue(updatedEmployee)

    const { result } = renderHook(() => useUpdateEmployee(), { wrapper: createWrapper() })

    result.current.mutate({ id: '123', data: updateData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(employeeService.updateEmployee).toHaveBeenCalledWith('123', updateData)
  })

  it('should handle update errors', async () => {
    const updateData = {
      email: 'taken@autoparc.fr',
    }

    const error = new Error('Email already exists')
    vi.mocked(employeeService.updateEmployee).mockRejectedValue(error)

    const { result } = renderHook(() => useUpdateEmployee(), { wrapper: createWrapper() })

    result.current.mutate({ id: '123', data: updateData })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(error)
  })
})

describe('useChangePassword', () => {
  it('should change password', async () => {
    const passwordData = {
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
    }
    
    vi.mocked(employeeService.changePassword).mockResolvedValue(undefined)

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() })

    result.current.mutate({ id: '123', data: passwordData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(employeeService.changePassword).toHaveBeenCalledWith('123', passwordData)
  })

  it('should handle incorrect current password', async () => {
    const passwordData = {
      currentPassword: 'WrongPass123!',
      newPassword: 'NewPass123!',
    }

    const error = new Error('Current password is incorrect')
    vi.mocked(employeeService.changePassword).mockRejectedValue(error)

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() })

    result.current.mutate({ id: '123', data: passwordData })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(error)
  })

  it('should handle weak password error', async () => {
    const passwordData = {
      currentPassword: 'OldPass123!',
      newPassword: 'weak',
    }

    const error = new Error('Password does not meet strength requirements')
    vi.mocked(employeeService.changePassword).mockRejectedValue(error)

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() })

    result.current.mutate({ id: '123', data: passwordData })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(error)
  })
})

describe('useDeleteEmployee', () => {
  it('should delete employee', async () => {
    vi.mocked(employeeService.deleteEmployee).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteEmployee(), { wrapper: createWrapper() })

    result.current.mutate('123')

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(employeeService.deleteEmployee).toHaveBeenCalledWith('123', expect.anything())
  })

  it('should handle delete errors', async () => {
    const error = new Error('Employee not found')
    vi.mocked(employeeService.deleteEmployee).mockRejectedValue(error)

    const { result } = renderHook(() => useDeleteEmployee(), { wrapper: createWrapper() })

    result.current.mutate('nonexistent')

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(error)
  })
})
