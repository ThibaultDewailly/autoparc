import { describe, it, expect } from 'vitest'
import type {
  CarOperator,
  CarOperatorAssignment,
  OperatorWithCurrentCar,
  OperatorDetail,
  CreateOperatorRequest,
  UpdateOperatorRequest,
  AssignOperatorRequest,
  UnassignOperatorRequest,
  OperatorFilters,
} from './operator'

describe('Operator Types', () => {
  it('should compile CarOperator type correctly', () => {
    const operator: CarOperator = {
      id: '123',
      employee_number: 'EMP001',
      first_name: 'Jean',
      last_name: 'Dupont',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }
    expect(operator.id).toBe('123')
  })

  it('should compile CarOperator with optional fields', () => {
    const operator: CarOperator = {
      id: '123',
      employee_number: 'EMP001',
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean@example.com',
      phone: '+33612345678',
      department: 'IT',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }
    expect(operator.email).toBe('jean@example.com')
  })

  it('should compile CarOperatorAssignment type correctly', () => {
    const assignment: CarOperatorAssignment = {
      id: '456',
      car_id: 'car-123',
      operator_id: 'op-123',
      start_date: '2025-01-01',
      created_at: '2025-01-01T00:00:00Z',
    }
    expect(assignment.car_id).toBe('car-123')
  })

  it('should compile CarOperatorAssignment with optional fields', () => {
    const assignment: CarOperatorAssignment = {
      id: '456',
      car_id: 'car-123',
      operator_id: 'op-123',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      notes: 'Test assignment',
      created_at: '2025-01-01T00:00:00Z',
    }
    expect(assignment.end_date).toBe('2025-12-31')
  })

  it('should compile OperatorWithCurrentCar type correctly', () => {
    const operator: OperatorWithCurrentCar = {
      id: '123',
      employee_number: 'EMP001',
      first_name: 'Jean',
      last_name: 'Dupont',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      current_car: {
        id: 'car-123',
        license_plate: 'AB-123-CD',
        brand: 'Renault',
        model: 'Clio',
        since: '2025-01-01',
      },
    }
    expect(operator.current_car?.license_plate).toBe('AB-123-CD')
  })

  it('should compile OperatorDetail type correctly', () => {
    const detail: OperatorDetail = {
      id: '123',
      employee_number: 'EMP001',
      first_name: 'Jean',
      last_name: 'Dupont',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      assignment_history: [],
    }
    expect(detail.assignment_history).toEqual([])
  })

  it('should compile CreateOperatorRequest type correctly', () => {
    const request: CreateOperatorRequest = {
      employee_number: 'EMP001',
      first_name: 'Jean',
      last_name: 'Dupont',
    }
    expect(request.employee_number).toBe('EMP001')
  })

  it('should compile UpdateOperatorRequest type correctly', () => {
    const request: UpdateOperatorRequest = {
      first_name: 'Jane',
      is_active: false,
    }
    expect(request.first_name).toBe('Jane')
  })

  it('should compile AssignOperatorRequest type correctly', () => {
    const request: AssignOperatorRequest = {
      operator_id: 'op-123',
      start_date: '2025-01-01',
    }
    expect(request.operator_id).toBe('op-123')
  })

  it('should compile UnassignOperatorRequest type correctly', () => {
    const request: UnassignOperatorRequest = {
      end_date: '2025-12-31',
    }
    expect(request.end_date).toBe('2025-12-31')
  })

  it('should compile OperatorFilters type correctly', () => {
    const filters: OperatorFilters = {
      search: 'Jean',
      department: 'IT',
      is_active: true,
      page: 1,
      limit: 20,
      sort_by: 'last_name',
      order: 'asc',
    }
    expect(filters.search).toBe('Jean')
  })
})
