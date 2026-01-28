# TODO: Operators & Assignments Feature - Iteration 2

**Feature**: Car Operator Management & Car-Operator Assignments  
**Goal**: Allow administrators to manage car operators (employees who use company cars) and assign/unassign them to vehicles with complete history tracking.

**Key Business Rules**:
- One operator can have **maximum 1 active car assignment** at a time
- One car can have **maximum 1 active operator assignment** at a time
- All assignment history must be preserved
- Assignment dates cannot overlap
- End date must be >= start date
- All actions must be logged for audit purposes

---

## PART 1: DATABASE

### 1.1 Create Migration Files

#### Migration: `000007_create_car_operators_table`

**File**: `migrations/000007_create_car_operators_table.up.sql`
```sql
CREATE TABLE car_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    department VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES administrative_employees(id)
);

-- Create indexes for search and performance
CREATE INDEX idx_operators_employee_number ON car_operators(employee_number);
CREATE INDEX idx_operators_name ON car_operators(last_name, first_name);
CREATE INDEX idx_operators_email ON car_operators(email);
CREATE INDEX idx_operators_is_active ON car_operators(is_active);
CREATE INDEX idx_operators_department ON car_operators(department);

-- Create trigger for updated_at
CREATE TRIGGER update_car_operators_updated_at
    BEFORE UPDATE ON car_operators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**File**: `migrations/000007_create_car_operators_table.down.sql`
```sql
DROP TRIGGER IF EXISTS update_car_operators_updated_at ON car_operators;
DROP INDEX IF EXISTS idx_operators_department;
DROP INDEX IF EXISTS idx_operators_is_active;
DROP INDEX IF EXISTS idx_operators_email;
DROP INDEX IF EXISTS idx_operators_name;
DROP INDEX IF EXISTS idx_operators_employee_number;
DROP TABLE IF EXISTS car_operators;
```

**Tests to Write**:
- [ ] Integration test: Create `car_operators` table successfully
- [ ] Integration test: Verify all indexes are created
- [ ] Integration test: Verify trigger is created
- [ ] Integration test: Verify `employee_number` uniqueness constraint
- [ ] Integration test: Verify foreign key constraint on `created_by`
- [ ] Integration test: Verify migration rollback works correctly

---

#### Migration: `000008_create_car_operator_assignments_table`

**File**: `migrations/000008_create_car_operator_assignments_table.up.sql`
```sql
CREATE TABLE car_operator_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES car_operators(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES administrative_employees(id),
    
    -- Business rule: end_date must be >= start_date
    CONSTRAINT no_overlap_dates CHECK (end_date IS NULL OR end_date >= start_date),
    
    -- Business rule: one operator can have max 1 active assignment (end_date IS NULL)
    CONSTRAINT unique_active_operator UNIQUE (operator_id, end_date) 
        WHERE end_date IS NULL,
    
    -- Business rule: one car can have max 1 active assignment (end_date IS NULL)
    CONSTRAINT unique_active_car_assignment UNIQUE (car_id, end_date)
        WHERE end_date IS NULL
);

-- Create indexes for relationship queries
CREATE INDEX idx_assignments_car ON car_operator_assignments(car_id, end_date);
CREATE INDEX idx_assignments_operator ON car_operator_assignments(operator_id, end_date);
CREATE INDEX idx_assignments_start_date ON car_operator_assignments(start_date);
CREATE INDEX idx_assignments_active ON car_operator_assignments(end_date) WHERE end_date IS NULL;
```

**File**: `migrations/000008_create_car_operator_assignments_table.down.sql`
```sql
DROP INDEX IF EXISTS idx_assignments_active;
DROP INDEX IF EXISTS idx_assignments_start_date;
DROP INDEX IF EXISTS idx_assignments_operator;
DROP INDEX IF EXISTS idx_assignments_car;
DROP TABLE IF EXISTS car_operator_assignments;
```

**Tests to Write**:
- [ ] Integration test: Create `car_operator_assignments` table successfully
- [ ] Integration test: Verify all indexes are created
- [ ] Integration test: Verify cascade delete on car deletion
- [ ] Integration test: Verify cascade delete on operator deletion
- [ ] Integration test: Verify `no_overlap_dates` constraint (end_date < start_date fails)
- [ ] Integration test: Verify `unique_active_operator` constraint (two active assignments for one operator fails)
- [ ] Integration test: Verify `unique_active_car_assignment` constraint (two active assignments for one car fails)
- [ ] Integration test: Verify past assignments don't conflict with constraints
- [ ] Integration test: Verify migration rollback works correctly

---

#### Migration: `000009_update_action_logs_for_operators`

**File**: `migrations/000009_update_action_logs_for_operators.up.sql`
```sql
-- No table changes needed, just documentation
-- The action_logs table already supports 'operator' entity_type
-- and 'assign'/'unassign' action_types as defined in CHECK constraints
```

**File**: `migrations/000009_update_action_logs_for_operators.down.sql`
```sql
-- No changes needed
```

---

### 1.2 Update Seed Data

**File**: `migrations/seeds/000003_seed_operators_and_assignments.up.sql`
```sql
-- Insert test operators
INSERT INTO car_operators (id, employee_number, first_name, last_name, email, phone, department, is_active, created_by)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'EMP001', 'Jean', 'Dupont', 'jean.dupont@company.com', '+33612345678', 'Ventes', true, (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ('22222222-2222-2222-2222-222222222222', 'EMP002', 'Marie', 'Martin', 'marie.martin@company.com', '+33623456789', 'Marketing', true, (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ('33333333-3333-3333-3333-333333333333', 'EMP003', 'Pierre', 'Dubois', 'pierre.dubois@company.com', '+33634567890', 'IT', true, (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ('44444444-4444-4444-4444-444444444444', 'EMP004', 'Sophie', 'Leroy', 'sophie.leroy@company.com', '+33645678901', 'RH', true, (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ('55555555-5555-5555-5555-555555555555', 'EMP005', 'Luc', 'Bernard', 'luc.bernard@company.com', '+33656789012', 'Finance', false, (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com'));

-- Insert test assignments (some active, some historical)
INSERT INTO car_operator_assignments (car_id, operator_id, start_date, end_date, notes, created_by)
VALUES
    -- Active assignments
    ((SELECT id FROM cars LIMIT 1 OFFSET 0), '11111111-1111-1111-1111-111111111111', '2025-01-01', NULL, 'Attribution initiale', (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ((SELECT id FROM cars LIMIT 1 OFFSET 1), '22222222-2222-2222-2222-222222222222', '2025-06-15', NULL, 'Nouveau véhicule pour Marketing', (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    
    -- Historical assignments
    ((SELECT id FROM cars LIMIT 1 OFFSET 0), '33333333-3333-3333-3333-333333333333', '2024-01-01', '2024-12-31', 'Ancienne attribution', (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com')),
    ((SELECT id FROM cars LIMIT 1 OFFSET 2), '44444444-4444-4444-4444-444444444444', '2024-06-01', '2025-05-31', 'Attribution temporaire', (SELECT id FROM administrative_employees WHERE email = 'admin@autoparc.com'));
```

**File**: `migrations/seeds/000003_seed_operators_and_assignments.down.sql`
```sql
DELETE FROM car_operator_assignments WHERE operator_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
);

DELETE FROM car_operators WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
);
```

**Tests to Write**:
- [ ] Integration test: Verify seed data inserts successfully
- [ ] Integration test: Verify active assignments are created correctly
- [ ] Integration test: Verify historical assignments are created correctly
- [ ] Integration test: Verify seed data rollback works correctly

---

## PART 2: BACKEND (Golang)

### 2.1 Models

**File**: `backend/internal/models/operator.go`

**Struct Definition**:
```go
type CarOperator struct {
    ID             string    `json:"id" db:"id"`
    EmployeeNumber string    `json:"employee_number" db:"employee_number"`
    FirstName      string    `json:"first_name" db:"first_name"`
    LastName       string    `json:"last_name" db:"last_name"`
    Email          *string   `json:"email,omitempty" db:"email"`
    Phone          *string   `json:"phone,omitempty" db:"phone"`
    Department     *string   `json:"department,omitempty" db:"department"`
    IsActive       bool      `json:"is_active" db:"is_active"`
    CreatedAt      time.Time `json:"created_at" db:"created_at"`
    UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
    CreatedBy      *string   `json:"created_by,omitempty" db:"created_by"`
}

type CarOperatorAssignment struct {
    ID         string     `json:"id" db:"id"`
    CarID      string     `json:"car_id" db:"car_id"`
    OperatorID string     `json:"operator_id" db:"operator_id"`
    StartDate  time.Time  `json:"start_date" db:"start_date"`
    EndDate    *time.Time `json:"end_date,omitempty" db:"end_date"`
    Notes      *string    `json:"notes,omitempty" db:"notes"`
    CreatedAt  time.Time  `json:"created_at" db:"created_at"`
    CreatedBy  *string    `json:"created_by,omitempty" db:"created_by"`
}

// Request/Response DTOs
type CreateOperatorRequest struct {
    EmployeeNumber string  `json:"employee_number" validate:"required,max=50"`
    FirstName      string  `json:"first_name" validate:"required,max=100"`
    LastName       string  `json:"last_name" validate:"required,max=100"`
    Email          *string `json:"email,omitempty" validate:"omitempty,email,max=255"`
    Phone          *string `json:"phone,omitempty" validate:"omitempty,max=50"`
    Department     *string `json:"department,omitempty" validate:"omitempty,max=100"`
}

type UpdateOperatorRequest struct {
    FirstName  *string `json:"first_name,omitempty" validate:"omitempty,max=100"`
    LastName   *string `json:"last_name,omitempty" validate:"omitempty,max=100"`
    Email      *string `json:"email,omitempty" validate:"omitempty,email,max=255"`
    Phone      *string `json:"phone,omitempty" validate:"omitempty,max=50"`
    Department *string `json:"department,omitempty" validate:"omitempty,max=100"`
    IsActive   *bool   `json:"is_active,omitempty"`
}

type AssignOperatorRequest struct {
    OperatorID string  `json:"operator_id" validate:"required,uuid"`
    StartDate  string  `json:"start_date" validate:"required,datetime=2006-01-02"`
    Notes      *string `json:"notes,omitempty"`
}

type UnassignOperatorRequest struct {
    EndDate string  `json:"end_date" validate:"required,datetime=2006-01-02"`
    Notes   *string `json:"notes,omitempty"`
}

type OperatorWithCurrentAssignment struct {
    CarOperator
    CurrentCar *struct {
        ID           string    `json:"id"`
        LicensePlate string    `json:"license_plate"`
        Brand        string    `json:"brand"`
        Model        string    `json:"model"`
        Since        time.Time `json:"since"`
    } `json:"current_car,omitempty"`
}

type OperatorDetailResponse struct {
    CarOperator
    CurrentAssignment *CarOperatorAssignment   `json:"current_assignment,omitempty"`
    AssignmentHistory []CarOperatorAssignment  `json:"assignment_history"`
}
```

**Tests to Write**:
- [ ] Unit test: Validate `CreateOperatorRequest` with valid data
- [ ] Unit test: Validate `CreateOperatorRequest` with missing required fields
- [ ] Unit test: Validate `CreateOperatorRequest` with invalid email format
- [ ] Unit test: Validate `UpdateOperatorRequest` with valid data
- [ ] Unit test: Validate `AssignOperatorRequest` with valid data
- [ ] Unit test: Validate `AssignOperatorRequest` with invalid UUID
- [ ] Unit test: Validate `AssignOperatorRequest` with invalid date format
- [ ] Unit test: Validate `UnassignOperatorRequest` with valid data
- [ ] Unit test: JSON marshaling/unmarshaling for all structs

---

### 2.2 Repository Layer

**File**: `backend/internal/repository/operator_repository.go`

**Interface**:
```go
type OperatorRepository interface {
    // CRUD operations
    Create(ctx context.Context, operator *models.CarOperator) error
    GetByID(ctx context.Context, id string) (*models.CarOperator, error)
    GetByEmployeeNumber(ctx context.Context, employeeNumber string) (*models.CarOperator, error)
    List(ctx context.Context, filters OperatorFilters) ([]models.CarOperator, int, error)
    Update(ctx context.Context, id string, updates map[string]interface{}) error
    Delete(ctx context.Context, id string) error
    
    // Assignment operations
    CreateAssignment(ctx context.Context, assignment *models.CarOperatorAssignment) error
    GetAssignmentByID(ctx context.Context, id string) (*models.CarOperatorAssignment, error)
    GetActiveAssignmentByCar(ctx context.Context, carID string) (*models.CarOperatorAssignment, error)
    GetActiveAssignmentByOperator(ctx context.Context, operatorID string) (*models.CarOperatorAssignment, error)
    GetAssignmentHistory(ctx context.Context, filters AssignmentFilters) ([]models.CarOperatorAssignment, error)
    EndAssignment(ctx context.Context, assignmentID string, endDate time.Time, notes *string) error
    
    // Validation
    HasActiveAssignment(ctx context.Context, operatorID string) (bool, error)
    CarHasActiveAssignment(ctx context.Context, carID string) (bool, error)
}

type OperatorFilters struct {
    Search     string
    Department string
    IsActive   *bool
    Page       int
    Limit      int
    SortBy     string
    Order      string
}

type AssignmentFilters struct {
    CarID      *string
    OperatorID *string
    Active     *bool
    StartDate  *time.Time
    EndDate    *time.Time
}
```

**Implementation**: `backend/internal/repository/operator_repository_impl.go`

**Tests to Write**:
- [ ] Unit test (with mock DB): Create operator successfully
- [ ] Unit test (with mock DB): Create operator with duplicate employee_number fails
- [ ] Unit test (with mock DB): GetByID returns operator
- [ ] Unit test (with mock DB): GetByID with non-existent ID returns error
- [ ] Unit test (with mock DB): GetByEmployeeNumber returns operator
- [ ] Unit test (with mock DB): List with filters returns paginated results
- [ ] Unit test (with mock DB): List with search filters by name
- [ ] Unit test (with mock DB): List with department filter
- [ ] Unit test (with mock DB): Update operator successfully
- [ ] Unit test (with mock DB): Delete operator successfully
- [ ] Unit test (with mock DB): CreateAssignment successfully
- [ ] Unit test (with mock DB): CreateAssignment fails if operator has active assignment
- [ ] Unit test (with mock DB): CreateAssignment fails if car has active assignment
- [ ] Unit test (with mock DB): GetActiveAssignmentByCar returns assignment
- [ ] Unit test (with mock DB): GetActiveAssignmentByOperator returns assignment
- [ ] Unit test (with mock DB): GetAssignmentHistory returns all assignments
- [ ] Unit test (with mock DB): EndAssignment sets end_date correctly
- [ ] Unit test (with mock DB): HasActiveAssignment returns true/false correctly
- [ ] Unit test (with mock DB): CarHasActiveAssignment returns true/false correctly
- [ ] Integration test (with real DB): Full CRUD cycle for operator
- [ ] Integration test (with real DB): Constraint violations are caught
- [ ] Integration test (with real DB): Assignment workflow (assign -> end -> reassign)
- [ ] Integration test (with real DB): Multiple historical assignments per operator

---

### 2.3 Service Layer

**File**: `backend/internal/service/operator_service.go`

**Interface**:
```go
type OperatorService interface {
    // Operator CRUD
    CreateOperator(ctx context.Context, req *models.CreateOperatorRequest, createdBy string) (*models.CarOperator, error)
    GetOperator(ctx context.Context, id string) (*models.OperatorDetailResponse, error)
    ListOperators(ctx context.Context, filters repository.OperatorFilters) ([]models.OperatorWithCurrentAssignment, int, error)
    UpdateOperator(ctx context.Context, id string, req *models.UpdateOperatorRequest, updatedBy string) (*models.CarOperator, error)
    DeleteOperator(ctx context.Context, id string, deletedBy string) error
    
    // Assignment operations
    AssignOperatorToCar(ctx context.Context, carID string, req *models.AssignOperatorRequest, assignedBy string) (*models.CarOperatorAssignment, error)
    UnassignOperatorFromCar(ctx context.Context, carID string, req *models.UnassignOperatorRequest, unassignedBy string) error
    GetCarAssignmentHistory(ctx context.Context, carID string) ([]models.CarOperatorAssignment, error)
    GetOperatorAssignmentHistory(ctx context.Context, operatorID string) ([]models.CarOperatorAssignment, error)
}
```

**Business Logic**:
1. **CreateOperator**: Validate employee_number uniqueness, create operator, log action
2. **AssignOperatorToCar**: 
   - Validate car exists and is active
   - Validate operator exists and is active
   - Check operator has no active assignment
   - Check car has no active assignment
   - Validate start_date (not in past, not too far in future)
   - Create assignment
   - Log 'assign' action for both car and operator
3. **UnassignOperatorFromCar**:
   - Validate car has active assignment
   - Validate end_date >= start_date
   - Update assignment with end_date
   - Log 'unassign' action for both car and operator

**Tests to Write**:
- [ ] Unit test (with mock repo): CreateOperator with valid data
- [ ] Unit test (with mock repo): CreateOperator with duplicate employee_number fails
- [ ] Unit test (with mock repo): CreateOperator logs action
- [ ] Unit test (with mock repo): GetOperator returns operator with current assignment
- [ ] Unit test (with mock repo): GetOperator returns operator with history
- [ ] Unit test (with mock repo): ListOperators returns operators with current cars
- [ ] Unit test (with mock repo): UpdateOperator updates fields correctly
- [ ] Unit test (with mock repo): UpdateOperator logs action
- [ ] Unit test (with mock repo): DeleteOperator soft deletes (sets is_active=false)
- [ ] Unit test (with mock repo): DeleteOperator logs action
- [ ] Unit test (with mock repo): AssignOperatorToCar with valid data
- [ ] Unit test (with mock repo): AssignOperatorToCar fails if operator inactive
- [ ] Unit test (with mock repo): AssignOperatorToCar fails if car inactive
- [ ] Unit test (with mock repo): AssignOperatorToCar fails if operator has active assignment
- [ ] Unit test (with mock repo): AssignOperatorToCar fails if car has active assignment
- [ ] Unit test (with mock repo): AssignOperatorToCar fails if start_date in past
- [ ] Unit test (with mock repo): AssignOperatorToCar logs actions for car and operator
- [ ] Unit test (with mock repo): UnassignOperatorFromCar with valid data
- [ ] Unit test (with mock repo): UnassignOperatorFromCar fails if no active assignment
- [ ] Unit test (with mock repo): UnassignOperatorFromCar fails if end_date < start_date
- [ ] Unit test (with mock repo): UnassignOperatorFromCar logs actions
- [ ] Integration test (with real DB): Complete workflow from create to assign to unassign

---

### 2.4 Handlers (Controllers)

**File**: `backend/internal/handlers/operator_handler.go`

**Endpoints**:
```go
func (h *OperatorHandler) RegisterRoutes(router *mux.Router) {
    // Operator CRUD
    router.HandleFunc("/api/v1/operators", h.ListOperators).Methods("GET")
    router.HandleFunc("/api/v1/operators", h.CreateOperator).Methods("POST")
    router.HandleFunc("/api/v1/operators/{id}", h.GetOperator).Methods("GET")
    router.HandleFunc("/api/v1/operators/{id}", h.UpdateOperator).Methods("PUT")
    router.HandleFunc("/api/v1/operators/{id}", h.DeleteOperator).Methods("DELETE")
    
    // Assignment operations
    router.HandleFunc("/api/v1/cars/{id}/assign", h.AssignOperator).Methods("POST")
    router.HandleFunc("/api/v1/cars/{id}/unassign", h.UnassignOperator).Methods("POST")
    router.HandleFunc("/api/v1/cars/{id}/assignment-history", h.GetCarAssignmentHistory).Methods("GET")
    router.HandleFunc("/api/v1/operators/{id}/assignment-history", h.GetOperatorAssignmentHistory).Methods("GET")
}
```

**Handler Functions**:
- `ListOperators`: GET /api/v1/operators (with pagination, search, filters)
- `CreateOperator`: POST /api/v1/operators
- `GetOperator`: GET /api/v1/operators/:id
- `UpdateOperator`: PUT /api/v1/operators/:id
- `DeleteOperator`: DELETE /api/v1/operators/:id
- `AssignOperator`: POST /api/v1/cars/:id/assign
- `UnassignOperator`: POST /api/v1/cars/:id/unassign
- `GetCarAssignmentHistory`: GET /api/v1/cars/:id/assignment-history
- `GetOperatorAssignmentHistory`: GET /api/v1/operators/:id/assignment-history

**Tests to Write**:
- [ ] Unit test (with mock service): ListOperators returns 200 with data
- [ ] Unit test (with mock service): ListOperators handles query parameters
- [ ] Unit test (with mock service): CreateOperator returns 201 with created operator
- [ ] Unit test (with mock service): CreateOperator returns 400 for invalid input
- [ ] Unit test (with mock service): CreateOperator returns 409 for duplicate employee_number
- [ ] Unit test (with mock service): GetOperator returns 200 with operator details
- [ ] Unit test (with mock service): GetOperator returns 404 for non-existent ID
- [ ] Unit test (with mock service): UpdateOperator returns 200 with updated operator
- [ ] Unit test (with mock service): UpdateOperator returns 400 for invalid input
- [ ] Unit test (with mock service): DeleteOperator returns 200
- [ ] Unit test (with mock service): DeleteOperator returns 404 for non-existent ID
- [ ] Unit test (with mock service): AssignOperator returns 201 with assignment
- [ ] Unit test (with mock service): AssignOperator returns 400 for invalid request
- [ ] Unit test (with mock service): AssignOperator returns 409 for conflict
- [ ] Unit test (with mock service): UnassignOperator returns 200
- [ ] Unit test (with mock service): UnassignOperator returns 400 for invalid request
- [ ] Unit test (with mock service): UnassignOperator returns 404 if no active assignment
- [ ] Unit test (with mock service): GetCarAssignmentHistory returns 200 with history
- [ ] Unit test (with mock service): GetOperatorAssignmentHistory returns 200 with history
- [ ] Unit test: All endpoints require authentication (401 if not authenticated)
- [ ] Integration test (with real DB): Complete API workflow via HTTP

---

### 2.5 Update Car Handler

**File**: `backend/internal/handlers/car_handler.go`

**Changes**:
- Update `GetCar` response to include `current_assignment` with operator details
- Update `ListCars` response to include `current_operator` summary

**Tests to Write**:
- [ ] Unit test: GetCar includes current_assignment when car is assigned
- [ ] Unit test: GetCar returns null current_assignment when car is not assigned
- [ ] Unit test: ListCars includes current_operator for assigned cars
- [ ] Integration test: GetCar response structure matches API spec

---

## PART 3: FRONTEND (React + Vite)

### 3.1 Types

**File**: `frontend/src/types/operator.ts`

```typescript
export interface CarOperator {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarOperatorAssignment {
  id: string;
  car_id: string;
  operator_id: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  created_at: string;
}

export interface OperatorWithCurrentCar extends CarOperator {
  current_car?: {
    id: string;
    license_plate: string;
    brand: string;
    model: string;
    since: string;
  };
}

export interface OperatorDetail extends CarOperator {
  current_assignment?: CarOperatorAssignment;
  assignment_history: CarOperatorAssignment[];
}

export interface CreateOperatorRequest {
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  department?: string;
}

export interface UpdateOperatorRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  is_active?: boolean;
}

export interface AssignOperatorRequest {
  operator_id: string;
  start_date: string;
  notes?: string;
}

export interface UnassignOperatorRequest {
  end_date: string;
  notes?: string;
}
```

**Tests to Write**:
- [ ] Unit test: Type definitions compile without errors
- [ ] Unit test: Type guards work correctly

---

### 3.2 API Service

**File**: `frontend/src/services/operatorService.ts`

```typescript
export const operatorService = {
  // Operator CRUD
  listOperators: (filters?: OperatorFilters) => Promise<PaginatedResponse<OperatorWithCurrentCar>>,
  getOperator: (id: string) => Promise<OperatorDetail>,
  createOperator: (data: CreateOperatorRequest) => Promise<CarOperator>,
  updateOperator: (id: string, data: UpdateOperatorRequest) => Promise<CarOperator>,
  deleteOperator: (id: string) => Promise<void>,
  
  // Assignment operations
  assignOperator: (carId: string, data: AssignOperatorRequest) => Promise<CarOperatorAssignment>,
  unassignOperator: (carId: string, data: UnassignOperatorRequest) => Promise<void>,
  getCarAssignmentHistory: (carId: string) => Promise<CarOperatorAssignment[]>,
  getOperatorAssignmentHistory: (operatorId: string) => Promise<CarOperatorAssignment[]>,
}
```

**Tests to Write**:
- [ ] Unit test: listOperators calls correct endpoint with query params
- [ ] Unit test: getOperator calls correct endpoint
- [ ] Unit test: createOperator sends POST request with data
- [ ] Unit test: updateOperator sends PUT request with data
- [ ] Unit test: deleteOperator sends DELETE request
- [ ] Unit test: assignOperator sends POST request to /cars/:id/assign
- [ ] Unit test: unassignOperator sends POST request to /cars/:id/unassign
- [ ] Unit test: getCarAssignmentHistory calls correct endpoint
- [ ] Unit test: getOperatorAssignmentHistory calls correct endpoint
- [ ] Unit test: All methods handle errors correctly
- [ ] Unit test: All methods include auth credentials

---

### 3.3 Pages

#### 3.3.1 Operators List Page

**File**: `frontend/src/pages/OperatorsPage.tsx`

**Features**:
- List all operators with pagination
- Search by name, employee_number, email
- Filter by department, is_active
- Display current car assignment
- Action buttons: View Details, Edit, Delete
- "Add New Operator" button
- French UI labels

**Tests to Write**:
- [ ] Unit test: Page renders without crashing
- [ ] Unit test: Displays loading state
- [ ] Unit test: Displays operator list when data loads
- [ ] Unit test: Search input filters operators
- [ ] Unit test: Department filter works
- [ ] Unit test: Active/Inactive filter works
- [ ] Unit test: Pagination controls work
- [ ] Unit test: "Add New Operator" button navigates to form
- [ ] Unit test: Edit button navigates to edit form
- [ ] Unit test: Delete button shows confirmation dialog
- [ ] Unit test: Displays current car info for assigned operators
- [ ] Unit test: Handles empty state correctly
- [ ] Unit test: Handles error state correctly

---

#### 3.3.2 Operator Detail Page

**File**: `frontend/src/pages/OperatorDetailPage.tsx`

**Features**:
- Display all operator information
- Display current assignment with car details
- Display assignment history table
- Edit/Delete buttons
- "Assign to Car" button (if no current assignment)
- "Unassign from Car" button (if has current assignment)
- French UI labels

**Tests to Write**:
- [ ] Unit test: Page renders without crashing
- [ ] Unit test: Displays operator information correctly
- [ ] Unit test: Displays current assignment when present
- [ ] Unit test: Displays "No current assignment" when not assigned
- [ ] Unit test: Displays assignment history table
- [ ] Unit test: "Assign to Car" button shows when not assigned
- [ ] Unit test: "Unassign from Car" button shows when assigned
- [ ] Unit test: Edit button navigates to edit form
- [ ] Unit test: Delete button shows confirmation dialog
- [ ] Unit test: Handles loading state
- [ ] Unit test: Handles error state

---

#### 3.3.3 Operator Form Page (Create/Edit)

**File**: `frontend/src/pages/OperatorFormPage.tsx`

**Features**:
- Form fields: employee_number, first_name, last_name, email, phone, department
- Validation:
  - employee_number: Required, max 50 chars
  - first_name: Required, max 100 chars
  - last_name: Required, max 100 chars
  - email: Optional, valid email format
  - phone: Optional
  - department: Optional
- Submit/Cancel buttons
- French labels and error messages

**Tests to Write**:
- [ ] Unit test: Form renders in create mode
- [ ] Unit test: Form renders in edit mode with pre-filled data
- [ ] Unit test: Required field validation works
- [ ] Unit test: Email validation works
- [ ] Unit test: Form submission calls createOperator service
- [ ] Unit test: Form submission calls updateOperator service in edit mode
- [ ] Unit test: Success message shown on create
- [ ] Unit test: Success message shown on update
- [ ] Unit test: Error message shown on failure
- [ ] Unit test: Cancel button navigates back
- [ ] Unit test: Form is disabled during submission

---

#### 3.3.4 Assignment Dialog/Modal

**File**: `frontend/src/components/operators/AssignmentDialog.tsx`

**Features**:
- Modal/Dialog component
- Select car from dropdown (only unassigned, active cars)
- Start date picker
- Notes textarea
- Validation:
  - operator_id: Required
  - start_date: Required, cannot be in past
- French labels

**Tests to Write**:
- [ ] Unit test: Dialog opens and closes correctly
- [ ] Unit test: Displays only unassigned cars in dropdown
- [ ] Unit test: Start date validation (no past dates)
- [ ] Unit test: Submit calls assignOperator service
- [ ] Unit test: Success closes dialog and refreshes data
- [ ] Unit test: Error displays error message
- [ ] Unit test: Cancel button closes dialog without saving

---

**File**: `frontend/src/components/operators/UnassignmentDialog.tsx`

**Features**:
- Modal/Dialog component
- Display current assignment info (car, operator, start_date)
- End date picker
- Notes textarea
- Validation:
  - end_date: Required, must be >= start_date
- French labels

**Tests to Write**:
- [ ] Unit test: Dialog opens and closes correctly
- [ ] Unit test: Displays current assignment info
- [ ] Unit test: End date validation (>= start_date)
- [ ] Unit test: Submit calls unassignOperator service
- [ ] Unit test: Success closes dialog and refreshes data
- [ ] Unit test: Error displays error message
- [ ] Unit test: Cancel button closes dialog without saving

---

### 3.4 Components

#### 3.4.1 Operator Table

**File**: `frontend/src/components/operators/OperatorTable.tsx`

**Features**:
- Table with columns: Employee Number, Name, Department, Current Car, Status, Actions
- Sortable columns
- Inline actions: View, Edit, Delete
- Responsive design

**Tests to Write**:
- [ ] Unit test: Renders table with data
- [ ] Unit test: Displays correct columns
- [ ] Unit test: Sorting works for each column
- [ ] Unit test: Action buttons trigger correct callbacks
- [ ] Unit test: Displays active/inactive badge correctly
- [ ] Unit test: Displays current car info when assigned

---

#### 3.4.2 Operator Card

**File**: `frontend/src/components/operators/OperatorCard.tsx`

**Features**:
- Card view for operator (alternative to table row)
- Display name, employee number, department, current car
- Action buttons
- Responsive design

**Tests to Write**:
- [ ] Unit test: Renders card with operator data
- [ ] Unit test: Displays all relevant information
- [ ] Unit test: Action buttons work correctly

---

#### 3.4.3 Assignment History Table

**File**: `frontend/src/components/operators/AssignmentHistoryTable.tsx`

**Features**:
- Table with columns: Car, Operator (or Car depending on context), Start Date, End Date, Duration, Notes
- Display active assignment differently (highlight, badge)
- French date formatting

**Tests to Write**:
- [ ] Unit test: Renders table with assignment data
- [ ] Unit test: Displays active assignment with highlight
- [ ] Unit test: Displays historical assignments
- [ ] Unit test: Calculates duration correctly
- [ ] Unit test: Formats dates in French format

---

### 3.5 Update Car Components

**File**: `frontend/src/pages/CarDetailPage.tsx`

**Changes**:
- Add "Current Operator" section
- Display operator info: name, employee_number, department, since date
- Add "Unassign" button if assigned
- Add "Assign Operator" button if not assigned
- Display assignment history section

**Tests to Write**:
- [ ] Unit test: Displays current operator when car is assigned
- [ ] Unit test: Displays "No operator assigned" when not assigned
- [ ] Unit test: "Assign Operator" button opens assignment dialog
- [ ] Unit test: "Unassign" button opens unassignment dialog
- [ ] Unit test: Assignment history section displays correctly

---

**File**: `frontend/src/components/cars/CarTable.tsx`

**Changes**:
- Add "Current Operator" column
- Display operator name or "-" if not assigned

**Tests to Write**:
- [ ] Unit test: Current operator column displays correctly
- [ ] Unit test: Displays "-" when no operator assigned

---

### 3.6 Routing

**File**: `frontend/src/App.tsx`

**Add Routes**:
```typescript
<Route path="/operators" element={<OperatorsPage />} />
<Route path="/operators/new" element={<OperatorFormPage />} />
<Route path="/operators/:id" element={<OperatorDetailPage />} />
<Route path="/operators/:id/edit" element={<OperatorFormPage />} />
```

**Update Navbar**:
- Add "Opérateurs" (Operators) link to navigation menu

**Tests to Write**:
- [ ] Unit test: All operator routes are registered
- [ ] Unit test: Navigation to operators page works
- [ ] Unit test: Navigation to operator detail works
- [ ] Unit test: Navigation to operator form works
- [ ] Unit test: Navbar displays operators link

---

## PART 4: E2E TESTS (Playwright)

### 4.1 Operator Management E2E Tests

**File**: `frontend/e2e/operators.spec.ts`

**Test Scenarios**:

```typescript
test.describe('Operator Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    // Navigate to operators page
  });
  
  test('should display operators list', async ({ page }) => {
    // Verify page title
    // Verify table/grid displays
    // Verify at least one operator is shown
  });
  
  test('should create new operator', async ({ page }) => {
    // Click "Add New Operator" button
    // Fill form with valid data
    // Submit form
    // Verify success message
    // Verify redirect to operators list or detail page
    // Verify operator appears in list
  });
  
  test('should show validation errors on create', async ({ page }) => {
    // Click "Add New Operator" button
    // Submit empty form
    // Verify required field errors are displayed
    // Fill invalid email
    // Verify email validation error
  });
  
  test('should search operators', async ({ page }) => {
    // Enter search term in search box
    // Verify filtered results
    // Clear search
    // Verify all operators shown again
  });
  
  test('should filter operators by department', async ({ page }) => {
    // Select department filter
    // Verify only operators from that department are shown
  });
  
  test('should filter operators by active status', async ({ page }) => {
    // Toggle active/inactive filter
    // Verify only active/inactive operators shown
  });
  
  test('should view operator details', async ({ page }) => {
    // Click on operator row
    // Verify detail page opens
    // Verify all operator information displayed
    // Verify assignment history section
  });
  
  test('should edit operator', async ({ page }) => {
    // Navigate to operator detail
    // Click Edit button
    // Update fields
    // Submit form
    // Verify success message
    // Verify updated data displayed
  });
  
  test('should deactivate operator', async ({ page }) => {
    // Navigate to operator detail
    // Click Delete/Deactivate button
    // Confirm action in dialog
    // Verify success message
    // Verify operator marked as inactive
  });
});
```

**Tests to Write**:
- [ ] E2E test: Display operators list
- [ ] E2E test: Create new operator successfully
- [ ] E2E test: Form validation on create
- [ ] E2E test: Search operators by name
- [ ] E2E test: Filter operators by department
- [ ] E2E test: Filter operators by status
- [ ] E2E test: View operator details
- [ ] E2E test: Edit operator successfully
- [ ] E2E test: Deactivate operator
- [ ] E2E test: Pagination works correctly

---

### 4.2 Assignment E2E Tests

**File**: `frontend/e2e/assignments.spec.ts`

**Test Scenarios**:

```typescript
test.describe('Car-Operator Assignments', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
  });
  
  test('should assign operator to car from car detail page', async ({ page }) => {
    // Navigate to unassigned car detail page
    // Click "Assign Operator" button
    // Select operator from dropdown
    // Select start date
    // Add notes
    // Submit
    // Verify success message
    // Verify current operator displayed
  });
  
  test('should assign car to operator from operator detail page', async ({ page }) => {
    // Navigate to operator without assignment
    // Click "Assign to Car" button
    // Select car from dropdown
    // Select start date
    // Submit
    // Verify success message
    // Verify current car displayed
  });
  
  test('should not allow assigning already assigned operator', async ({ page }) => {
    // Navigate to car detail
    // Click "Assign Operator" button
    // Try to select operator who already has a car
    // Verify operator is not in dropdown OR error message shown
  });
  
  test('should not allow assigning operator to already assigned car', async ({ page }) => {
    // Navigate to operator detail
    // Click "Assign to Car" button
    // Try to select car that already has an operator
    // Verify car is not in dropdown OR error message shown
  });
  
  test('should unassign operator from car', async ({ page }) => {
    // Navigate to car with active assignment
    // Click "Unassign" button
    // Select end date
    // Add notes
    // Submit
    // Verify success message
    // Verify "No operator assigned" displayed
  });
  
  test('should validate end date on unassignment', async ({ page }) => {
    // Navigate to car with active assignment
    // Click "Unassign" button
    // Enter end date before start date
    // Submit
    // Verify error message displayed
  });
  
  test('should display assignment history for car', async ({ page }) => {
    // Navigate to car detail
    // Verify assignment history section
    // Verify historical assignments displayed
    // Verify active assignment highlighted
  });
  
  test('should display assignment history for operator', async ({ page }) => {
    // Navigate to operator detail
    // Verify assignment history section
    // Verify historical assignments displayed
    // Verify active assignment highlighted
  });
  
  test('should reassign car after unassignment', async ({ page }) => {
    // Unassign operator from car
    // Immediately assign new operator
    // Verify successful reassignment
    // Verify both assignments in history
  });
});
```

**Tests to Write**:
- [ ] E2E test: Assign operator to car from car detail page
- [ ] E2E test: Assign car to operator from operator detail page
- [ ] E2E test: Validation - operator already assigned
- [ ] E2E test: Validation - car already assigned
- [ ] E2E test: Unassign operator from car
- [ ] E2E test: Validation - end date before start date
- [ ] E2E test: Display assignment history for car
- [ ] E2E test: Display assignment history for operator
- [ ] E2E test: Reassign car after unassignment
- [ ] E2E test: Complete assignment workflow end-to-end

---

### 4.3 Integration with Existing Features

**File**: `frontend/e2e/cars.spec.ts` (update existing)

**Add Tests**:

```typescript
test('should display current operator in car list', async ({ page }) => {
  // Navigate to cars page
  // Verify "Current Operator" column exists
  // Verify operator name displayed for assigned cars
});

test('should display current operator in car detail', async ({ page }) => {
  // Navigate to car detail
  // Verify "Current Operator" section
  // Verify operator information displayed
});
```

**Tests to Write**:
- [ ] E2E test: Car list shows current operator
- [ ] E2E test: Car detail shows current operator
- [ ] E2E test: Car detail shows assignment history

---

## SUMMARY

### Total Test Count Estimate

**Database**:
- Migration tests: ~15 tests

**Backend**:
- Model validation tests: ~10 tests
- Repository unit tests: ~25 tests
- Repository integration tests: ~10 tests
- Service unit tests: ~25 tests
- Service integration tests: ~5 tests
- Handler unit tests: ~25 tests
- Handler integration tests: ~5 tests
- **Total Backend**: ~105 tests

**Frontend**:
- Type tests: ~2 tests
- Service tests: ~15 tests
- Page tests: ~40 tests
- Component tests: ~25 tests
- Routing tests: ~5 tests
- **Total Frontend**: ~87 tests

**E2E Tests**:
- Operator management: ~10 tests
- Assignments: ~10 tests
- Integration: ~3 tests
- **Total E2E**: ~23 tests

**Grand Total**: ~230 tests

---

### Development Order

1. **Database** (Day 1)
   - Create migrations
   - Run migrations
   - Write integration tests
   - Add seed data

2. **Backend - Models & Repository** (Day 2-3)
   - Define models
   - Implement repository interface
   - Write unit tests
   - Write integration tests

3. **Backend - Service & Handlers** (Day 4-5)
   - Implement service layer
   - Write unit tests
   - Implement handlers
   - Write handler tests
   - Update car handler

4. **Frontend - Types & Services** (Day 6)
   - Define TypeScript types
   - Implement API service
   - Write service tests

5. **Frontend - Pages & Components** (Day 7-9)
   - Build operators list page
   - Build operator detail page
   - Build operator form page
   - Build assignment dialogs
   - Build reusable components
   - Write component tests
   - Update car pages

6. **Frontend - Routing & Navigation** (Day 10)
   - Add routes
   - Update navbar
   - Write routing tests

7. **E2E Tests** (Day 11-12)
   - Write operator management E2E tests
   - Write assignment E2E tests
   - Update existing car E2E tests

8. **Integration & Bug Fixes** (Day 13-14)
   - Run all tests
   - Fix any issues
   - Manual testing
   - Code review

---

### Success Criteria

- [ ] All database migrations run successfully
- [ ] All 230 tests pass
- [ ] Code coverage >= 80% for both backend and frontend
- [ ] Admin can create, view, edit, and deactivate operators
- [ ] Admin can assign operator to car
- [ ] Admin can unassign operator from car
- [ ] System enforces one-operator-one-car rule
- [ ] Assignment history is preserved and displayed
- [ ] All actions are logged in action_logs
- [ ] All UI text is in French
- [ ] All API endpoints match specification
- [ ] E2E tests cover complete workflows

---

### French Labels Reference

**Pages/Sections**:
- Opérateurs - Operators
- Détails de l'opérateur - Operator details
- Nouvel opérateur - New operator
- Modifier l'opérateur - Edit operator
- Historique d'attributions - Assignment history
- Attribution actuelle - Current assignment
- Aucune attribution - No assignment

**Fields**:
- Numéro d'employé - Employee number
- Prénom - First name
- Nom - Last name
- Email - Email
- Téléphone - Phone
- Département - Department
- Statut - Status
- Actif/Inactif - Active/Inactive
- Date de début - Start date
- Date de fin - End date
- Notes - Notes
- Véhicule - Car/Vehicle

**Actions**:
- Ajouter un opérateur - Add operator
- Attribuer un véhicule - Assign car
- Désattribuer - Unassign
- Chercher - Search
- Filtrer - Filter
- Voir les détails - View details

**Messages**:
- Opérateur créé avec succès - Operator created successfully
- Opérateur mis à jour avec succès - Operator updated successfully
- Opérateur désactivé avec succès - Operator deactivated successfully
- Attribution créée avec succès - Assignment created successfully
- Désattribution effectuée avec succès - Unassignment completed successfully
- L'opérateur a déjà un véhicule attribué - Operator already has an assigned car
- Le véhicule a déjà un opérateur attribué - Car already has an assigned operator
