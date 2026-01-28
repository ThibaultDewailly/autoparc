export interface CarOperator {
  id: string
  employee_number: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  department?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CarOperatorAssignment {
  id: string
  car_id: string
  operator_id: string
  start_date: string
  end_date?: string
  notes?: string
  created_at: string
}

export interface OperatorWithCurrentCar extends CarOperator {
  current_car?: {
    id: string
    license_plate: string
    brand: string
    model: string
    since: string
  }
}

export interface OperatorDetail extends CarOperator {
  current_assignment?: CarOperatorAssignment
  assignment_history: CarOperatorAssignment[]
}

export interface CreateOperatorRequest {
  employee_number: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  department?: string
}

export interface UpdateOperatorRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  department?: string
  is_active?: boolean
}

export interface AssignOperatorRequest {
  operator_id: string
  start_date: string
  notes?: string
}

export interface UnassignOperatorRequest {
  end_date: string
  notes?: string
}

export interface OperatorFilters {
  search?: string
  department?: string
  is_active?: boolean
  page?: number
  limit?: number
  sort_by?: string
  order?: 'asc' | 'desc'
}
