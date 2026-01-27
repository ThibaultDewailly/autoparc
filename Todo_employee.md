# Todo: Administrative Employee Management

## Overview
This document outlines all the necessary tasks to implement the complete administrative employee management feature for the AutoParc system. This builds on top of the MVP which already has authentication and car management.

---

## 1. BACKEND - DATABASE LAYER

### 1.1 Database Migration Updates
- [ ] **Task 1.1.1**: Update `administrative_employees` table migration if needed
  - Verify all fields are present: `id`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `is_active`, `created_at`, `updated_at`, `last_login_at`
  - Ensure indexes exist: `idx_employees_email`, `idx_employees_is_active`
  - Add any missing constraints or default values
  - **Testing**: Run migration up/down to ensure reversibility

- [ ] **Task 1.1.2**: Create migration for employee audit enhancements
  - Add index on `action_logs` for employee-specific queries: `idx_action_logs_performed_by`
  - Ensure proper foreign key cascade rules on `created_by` fields
  - **Testing**: Verify index improves query performance on action_logs

- [ ] **Task 1.1.3**: Add seed data for testing
  - Create seed file for test employees (multiple roles if future-proofing)
  - Include active and inactive employee examples
  - **Testing**: Run seed data and verify insertion

---

## 2. BACKEND - REPOSITORY LAYER

### 2.1 Employee Repository Interface
- [ ] **Task 2.1.1**: Define `EmployeeRepository` interface
  - Methods: `Create`, `GetByID`, `GetByEmail`, `GetAll`, `Update`, `Delete`, `UpdateLastLogin`
  - Include filtering parameters: `isActive`, pagination, sorting
  - **Unit Tests**: Create interface mock for testing

### 2.2 Employee Repository Implementation
- [ ] **Task 2.2.1**: Implement `Create(employee *models.AdministrativeEmployee) error`
  - Use prepared statements for SQL injection prevention
  - Generate UUID for new employee
  - Hash password using bcrypt before storage
  - Set default values: `is_active=true`, `role='admin'`, `created_at=NOW()`
  - **Unit Tests**: 
    - Test successful creation
    - Test duplicate email error
    - Test missing required fields
    - Test password hashing is applied

- [ ] **Task 2.2.2**: Implement `GetByID(id string) (*models.AdministrativeEmployee, error)`
  - Return full employee details except password hash
  - Handle not found case
  - **Unit Tests**:
    - Test successful retrieval
    - Test non-existent ID returns error
    - Test password_hash is excluded from result

- [ ] **Task 2.2.3**: Implement `GetByEmail(email string) (*models.AdministrativeEmployee, error)`
  - Case-insensitive email search
  - Include password hash (needed for authentication)
  - **Unit Tests**:
    - Test successful retrieval
    - Test non-existent email returns error
    - Test case-insensitive matching

- [ ] **Task 2.2.4**: Implement `GetAll(filters EmployeeFilters) (*pagination.Result, error)`
  - Support pagination: page, limit
  - Support filtering: `is_active`, `role`, `search` (name or email)
  - Support sorting: `created_at`, `last_name`, `first_name`, `last_login_at`
  - Return total count for pagination
  - **Unit Tests**:
    - Test pagination works correctly
    - Test filtering by active/inactive status
    - Test search by name and email
    - Test sorting by different fields
    - Test empty result set

- [ ] **Task 2.2.5**: Implement `Update(id string, employee *models.AdministrativeEmployee) error`
  - Update fields: `first_name`, `last_name`, `email`, `role`, `is_active`
  - Set `updated_at=NOW()`
  - Do NOT update password here (separate method)
  - Validate email uniqueness if changed
  - **Unit Tests**:
    - Test successful update
    - Test partial updates
    - Test duplicate email prevents update
    - Test non-existent ID returns error
    - Test updated_at is automatically set

- [ ] **Task 2.2.6**: Implement `UpdatePassword(id string, passwordHash string) error`
  - Update password_hash only
  - Set `updated_at=NOW()`
  - **Unit Tests**:
    - Test successful password update
    - Test non-existent ID returns error

- [ ] **Task 2.2.7**: Implement `Delete(id string) error`
  - Soft delete: set `is_active=false`
  - Set `updated_at=NOW()`
  - **Unit Tests**:
    - Test successful soft delete
    - Test deleted employee not returned in active queries
    - Test non-existent ID returns error

- [ ] **Task 2.2.8**: Implement `UpdateLastLogin(id string) error`
  - Update `last_login_at` to NOW()
  - **Unit Tests**:
    - Test successful update
    - Test timestamp is set correctly

### 2.3 Integration Tests for Repository
- [ ] **Task 2.3.1**: Setup test database with dockertest
  - Spin up PostgreSQL container
  - Run migrations
  - Clean database between tests

- [ ] **Task 2.3.2**: Integration test for full CRUD workflow
  - Create → Read → Update → Delete cycle
  - Verify data persistence
  - Test transaction rollback on errors

- [ ] **Task 2.3.3**: Integration test for concurrent operations
  - Test multiple employees creation simultaneously
  - Test email uniqueness constraint under concurrency
  - Test update conflicts

---

## 3. BACKEND - SERVICE LAYER

### 3.1 Employee Service Interface
- [ ] **Task 3.1.1**: Define `EmployeeService` interface
  - Methods: `CreateEmployee`, `GetEmployee`, `GetEmployees`, `UpdateEmployee`, `DeleteEmployee`, `ChangePassword`, `ValidateEmployee`
  - Include DTOs for request/response objects
  - **Unit Tests**: Create interface mock

### 3.2 Employee Service Implementation
- [ ] **Task 3.2.1**: Implement `CreateEmployee(req CreateEmployeeRequest) (*EmployeeResponse, error)`
  - Validate input:
    - Email format and uniqueness
    - Password strength (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
    - First name and last name not empty
  - Hash password with bcrypt (cost factor 12)
  - Call repository to create
  - Log action in action_logs
  - Return sanitized employee data (no password)
  - **Unit Tests**:
    - Test successful creation
    - Test email validation failures
    - Test password strength validation
    - Test duplicate email error handling
    - Test action logging is called
    - Mock repository responses

- [ ] **Task 3.2.2**: Implement `GetEmployee(id string) (*EmployeeResponse, error)`
  - Validate UUID format
  - Call repository
  - Transform to response DTO
  - **Unit Tests**:
    - Test successful retrieval
    - Test invalid UUID format
    - Test not found error

- [ ] **Task 3.2.3**: Implement `GetEmployees(filters EmployeeFilters) (*PaginatedEmployeesResponse, error)`
  - Validate pagination parameters (page > 0, limit ≤ 100)
  - Call repository with filters
  - Transform to response DTOs
  - Include pagination metadata
  - **Unit Tests**:
    - Test successful retrieval with various filters
    - Test pagination parameter validation
    - Test empty result handling

- [ ] **Task 3.2.4**: Implement `UpdateEmployee(id string, req UpdateEmployeeRequest) (*EmployeeResponse, error)`
  - Validate input fields
  - Validate email format if changed
  - Check email uniqueness if changed
  - Call repository to update
  - Log action in action_logs with changes JSONB
  - **Unit Tests**:
    - Test successful update
    - Test partial updates
    - Test validation errors
    - Test email uniqueness check
    - Test action logging with changes

- [ ] **Task 3.2.5**: Implement `ChangePassword(id string, req ChangePasswordRequest) error`
  - Validate current password matches (for self-service)
  - Validate new password strength
  - Hash new password
  - Call repository UpdatePassword
  - Log action in action_logs
  - **Unit Tests**:
    - Test successful password change
    - Test current password validation
    - Test new password strength validation
    - Test action logging

- [ ] **Task 3.2.6**: Implement `DeleteEmployee(id string) error`
  - Check if employee has dependencies (created cars, logs, etc.)
  - Soft delete via repository
  - Log action in action_logs
  - **Unit Tests**:
    - Test successful deletion
    - Test dependency check
    - Test action logging

- [ ] **Task 3.2.7**: Implement validation helpers
  - `validateEmail(email string) error`
  - `validatePasswordStrength(password string) error`
  - `validateUUID(id string) error`
  - **Unit Tests**:
    - Test various email formats (valid/invalid)
    - Test password strength rules
    - Test UUID validation

### 3.3 Integration Tests for Service
- [ ] **Task 3.3.1**: Integration test with real repository and database
  - Test full workflow with database persistence
  - Verify action logs are created
  - Test error propagation from repository to service

---

## 4. BACKEND - HANDLER LAYER

### 4.1 Employee Handler Implementation
- [ ] **Task 4.1.1**: Implement `CreateEmployee` handler (POST /api/v1/employees)
  - Parse JSON request body
  - Validate request structure
  - Call service.CreateEmployee
  - Return 201 Created with employee data
  - Handle errors: 400 (validation), 409 (duplicate), 500 (server error)
  - **Unit Tests**:
    - Test successful creation returns 201
    - Test invalid JSON returns 400
    - Test validation errors return 400
    - Test duplicate email returns 409
    - Test service error returns 500
    - Mock service layer

- [ ] **Task 4.1.2**: Implement `GetEmployee` handler (GET /api/v1/employees/:id)
  - Parse ID from URL path
  - Call service.GetEmployee
  - Return 200 OK with employee data
  - Handle errors: 400 (invalid ID), 404 (not found), 500 (server error)
  - **Unit Tests**:
    - Test successful retrieval returns 200
    - Test invalid ID format returns 400
    - Test not found returns 404
    - Mock service layer

- [ ] **Task 4.1.3**: Implement `GetEmployees` handler (GET /api/v1/employees)
  - Parse query parameters: page, limit, search, is_active, sort_by, order
  - Validate query parameters
  - Call service.GetEmployees
  - Return 200 OK with paginated data
  - Handle errors: 400 (invalid params), 500 (server error)
  - **Unit Tests**:
    - Test successful retrieval returns 200
    - Test pagination parameters parsing
    - Test filter parameters parsing
    - Test invalid parameters return 400
    - Mock service layer

- [ ] **Task 4.1.4**: Implement `UpdateEmployee` handler (PUT /api/v1/employees/:id)
  - Parse ID from URL path
  - Parse JSON request body
  - Call service.UpdateEmployee
  - Return 200 OK with updated employee data
  - Handle errors: 400 (validation), 404 (not found), 409 (duplicate email), 500 (server error)
  - **Unit Tests**:
    - Test successful update returns 200
    - Test invalid ID returns 400
    - Test invalid body returns 400
    - Test not found returns 404
    - Test duplicate email returns 409
    - Mock service layer

- [ ] **Task 4.1.5**: Implement `ChangePassword` handler (POST /api/v1/employees/:id/change-password)
  - Parse ID from URL path
  - Parse JSON request body (current_password, new_password)
  - Verify requesting user is same as ID or is super-admin (future)
  - Call service.ChangePassword
  - Return 200 OK with success message
  - Handle errors: 400 (validation), 401 (wrong password), 404 (not found), 500 (server error)
  - **Unit Tests**:
    - Test successful password change returns 200
    - Test invalid new password returns 400
    - Test wrong current password returns 401
    - Mock service layer

- [ ] **Task 4.1.6**: Implement `DeleteEmployee` handler (DELETE /api/v1/employees/:id)
  - Parse ID from URL path
  - Call service.DeleteEmployee
  - Return 200 OK with success message
  - Handle errors: 400 (invalid ID), 404 (not found), 500 (server error)
  - **Unit Tests**:
    - Test successful deletion returns 200
    - Test invalid ID returns 400
    - Test not found returns 404
    - Mock service layer

### 4.2 Handler Integration Tests
- [ ] **Task 4.2.1**: Setup test HTTP server with real handlers
  - Configure routes
  - Setup test authentication middleware
  - Setup test database

- [ ] **Task 4.2.2**: Integration test for complete HTTP workflow
  - Test POST /api/v1/employees → 201 Created
  - Test GET /api/v1/employees/:id → 200 OK
  - Test GET /api/v1/employees with filters → 200 OK
  - Test PUT /api/v1/employees/:id → 200 OK
  - Test DELETE /api/v1/employees/:id → 200 OK
  - Test error responses

---

## 5. BACKEND - MIDDLEWARE & ROUTING

### 5.1 Routing Configuration
- [ ] **Task 5.1.1**: Add employee routes to main router
  - Group routes under `/api/v1/employees`
  - Apply authentication middleware
  - Configure route-specific middleware if needed
  - **Testing**: Verify routes are registered correctly

### 5.2 Authorization Middleware (Future Enhancement)
- [ ] **Task 5.2.1**: Implement role-based access control (RBAC)
  - Define roles: admin, super-admin, viewer
  - Restrict DELETE operations to super-admin only
  - **Unit Tests**:
    - Test admin can create/read/update
    - Test super-admin can delete
    - Test viewer has read-only access (future)

---

## 6. BACKEND - MODELS & DTOs

### 6.1 Models
- [ ] **Task 6.1.1**: Define `AdministrativeEmployee` model
  - Fields: ID, Email, PasswordHash, FirstName, LastName, Role, IsActive, CreatedAt, UpdatedAt, LastLoginAt
  - JSON tags for serialization
  - Validation tags for input validation
  - **Unit Tests**: Test model serialization/deserialization

### 6.2 DTOs (Data Transfer Objects)
- [ ] **Task 6.2.1**: Define request DTOs
  - `CreateEmployeeRequest`: email, password, first_name, last_name, role
  - `UpdateEmployeeRequest`: first_name, last_name, email, role, is_active (all optional)
  - `ChangePasswordRequest`: current_password, new_password
  - Add JSON validation tags
  - **Unit Tests**: Test JSON parsing and validation

- [ ] **Task 6.2.2**: Define response DTOs
  - `EmployeeResponse`: id, email, first_name, last_name, role, is_active, created_at, updated_at, last_login_at (no password)
  - `PaginatedEmployeesResponse`: data[], pagination{}
  - **Unit Tests**: Test serialization

- [ ] **Task 6.2.3**: Define filter DTOs
  - `EmployeeFilters`: page, limit, search, is_active, role, sort_by, order
  - Default values: page=1, limit=20, order=desc, sort_by=created_at
  - **Unit Tests**: Test default values and parsing

---

## 7. BACKEND - ERROR HANDLING

### 7.1 Custom Errors
- [ ] **Task 7.1.1**: Define employee-specific errors
  - `ErrEmployeeNotFound`
  - `ErrDuplicateEmail`
  - `ErrInvalidPassword`
  - `ErrWeakPassword`
  - **Unit Tests**: Test error messages are user-friendly (French)

### 7.2 Error Response Formatting
- [ ] **Task 7.2.1**: Ensure consistent error response format
  - Structure: `{"error": "message", "code": "ERROR_CODE"}`
  - Map errors to HTTP status codes
  - French error messages
  - **Unit Tests**: Test error response format

---

## 8. BACKEND - UTILITIES

### 8.1 Password Utilities
- [ ] **Task 8.1.1**: Implement password hashing utilities
  - `HashPassword(password string) (string, error)` - bcrypt with cost 12
  - `ComparePassword(hashedPassword, password string) error`
  - **Unit Tests**:
    - Test password hashing produces different hash each time
    - Test password comparison works correctly
    - Test wrong password fails comparison

### 8.2 Validation Utilities
- [ ] **Task 8.2.1**: Implement validation utilities
  - Email regex validation
  - Password strength checker
  - UUID validator
  - **Unit Tests**: Test various valid/invalid inputs

---

## 9. BACKEND - ACTION LOGGING

### 9.1 Employee Action Logging
- [ ] **Task 9.1.1**: Log employee creation
  - Entity type: "employee"
  - Action type: "create"
  - Store employee ID in entity_id
  - Store performed_by from session
  - **Unit Tests**: Verify log entry created

- [ ] **Task 9.1.2**: Log employee updates
  - Entity type: "employee"
  - Action type: "update"
  - Store changes in JSONB: before/after values
  - **Unit Tests**: Verify changes JSONB structure

- [ ] **Task 9.1.3**: Log employee deletion
  - Entity type: "employee"
  - Action type: "delete"
  - **Unit Tests**: Verify log entry created

- [ ] **Task 9.1.4**: Log password changes
  - Entity type: "employee"
  - Action type: "password_change"
  - Do NOT store password in changes
  - **Unit Tests**: Verify password not leaked in logs

---

## 10. BACKEND - COMPREHENSIVE INTEGRATION TESTS

### 10.1 Full Stack Integration Tests
- [ ] **Task 10.1.1**: Test complete employee lifecycle
  - Create employee via API → verify in database
  - Get employee via API → verify data matches
  - Update employee via API → verify changes in database
  - Change password → verify can login with new password
  - Delete employee → verify soft deleted

- [ ] **Task 10.1.2**: Test authentication integration
  - Create employee → login with credentials → access protected routes
  - Change password → login with new password
  - Delete employee → login should fail

- [ ] **Task 10.1.3**: Test pagination and filtering
  - Create multiple employees
  - Test pagination works correctly
  - Test filters return correct results
  - Test search functionality

- [ ] **Task 10.1.4**: Test concurrent operations
  - Create multiple employees simultaneously
  - Update same employee from multiple requests
  - Test email uniqueness under concurrent creates

- [ ] **Task 10.1.5**: Test error scenarios
  - Test duplicate email prevention
  - Test invalid data rejection
  - Test not found errors
  - Test validation errors

---

## 11. FRONTEND - API CLIENT

### 11.1 Employee Service
- [ ] **Task 11.1.1**: Create `employeeService.js`
  - `createEmployee(employeeData)` - POST /api/v1/employees
  - `getEmployee(id)` - GET /api/v1/employees/:id
  - `getEmployees(filters)` - GET /api/v1/employees
  - `updateEmployee(id, employeeData)` - PUT /api/v1/employees/:id
  - `changePassword(id, passwords)` - POST /api/v1/employees/:id/change-password
  - `deleteEmployee(id)` - DELETE /api/v1/employees/:id
  - Use Axios with credentials
  - Handle errors properly
  - **Unit Tests**:
    - Test API calls with correct parameters
    - Test error handling
    - Mock Axios

---

## 12. FRONTEND - TYPES

### 12.1 TypeScript Types
- [ ] **Task 12.1.1**: Define employee types in `types/employee.ts`
  - `Employee` interface: id, email, firstName, lastName, role, isActive, createdAt, updatedAt, lastLoginAt
  - `CreateEmployeeRequest` interface
  - `UpdateEmployeeRequest` interface
  - `ChangePasswordRequest` interface
  - `EmployeeFilters` interface
  - `PaginatedEmployees` interface
  - **Testing**: Verify types compile correctly

---

## 13. FRONTEND - HOOKS

### 13.1 Custom Hooks
- [ ] **Task 13.1.1**: Create `useEmployees` hook
  - Fetch employees with filters
  - Handle loading, error, and data states
  - Return: employees, loading, error, refetch
  - Use React Query or similar for caching
  - **Unit Tests**:
    - Test hook fetches data on mount
    - Test hook handles errors
    - Test hook refetch functionality

- [ ] **Task 13.1.2**: Create `useEmployee` hook
  - Fetch single employee by ID
  - Handle loading, error, and data states
  - **Unit Tests**:
    - Test hook fetches data
    - Test hook handles not found

- [ ] **Task 13.1.3**: Create `useCreateEmployee` mutation hook
  - Handle employee creation
  - Return: mutate, isLoading, error
  - **Unit Tests**:
    - Test mutation triggers API call
    - Test success callback
    - Test error handling

- [ ] **Task 13.1.4**: Create `useUpdateEmployee` mutation hook
  - Handle employee update
  - **Unit Tests**: Similar to create

- [ ] **Task 13.1.5**: Create `useDeleteEmployee` mutation hook
  - Handle employee deletion
  - Show confirmation before delete
  - **Unit Tests**: Similar to create

---

## 14. FRONTEND - COMPONENTS

### 14.1 Employee List Components
- [ ] **Task 14.1.1**: Create `EmployeeList` component
  - Display employees in table format
  - Columns: Nom, Prénom, Email, Rôle, Statut, Dernière connexion, Actions
  - Show loading state
  - Show error state
  - Show empty state
  - Include pagination controls
  - Include filter panel
  - Actions: View, Edit, Delete buttons
  - **Unit Tests**:
    - Test renders with employee data
    - Test renders loading state
    - Test renders error state
    - Test renders empty state
    - Test action buttons trigger correct functions
    - Mock hooks

- [ ] **Task 14.1.2**: Create `EmployeeCard` component (alternative to table for mobile)
  - Card-based layout for responsive design
  - Display key employee info
  - Actions: View, Edit, Delete
  - **Unit Tests**:
    - Test renders correctly
    - Test action buttons work

### 14.2 Employee Form Components
- [ ] **Task 14.2.1**: Create `EmployeeForm` component
  - Fields: Email, Mot de passe, Prénom, Nom, Rôle, Actif
  - Form validation:
    - Email format validation
    - Password strength indicator (min 8 chars, uppercase, lowercase, number)
    - Required field validation
  - Show/hide password toggle
  - Submit button with loading state
  - Cancel button
  - Display validation errors
  - Display server errors
  - **Unit Tests**:
    - Test form renders all fields
    - Test validation triggers on submit
    - Test shows validation errors
    - Test submit calls correct function
    - Test cancel navigates back
    - Mock form submission

- [ ] **Task 14.2.2**: Create `ChangePasswordForm` component
  - Fields: Mot de passe actuel, Nouveau mot de passe, Confirmer mot de passe
  - Password strength indicator for new password
  - Show/hide password toggles
  - Validation: passwords match, strength requirements
  - **Unit Tests**:
    - Test password match validation
    - Test strength validation
    - Test submit

### 14.3 Employee Detail Component
- [ ] **Task 14.3.1**: Create `EmployeeDetail` component
  - Display all employee information
  - Show created date, updated date, last login
  - Edit and Delete buttons
  - Link to change password
  - Show loading state
  - Show error state if employee not found
  - **Unit Tests**:
    - Test renders employee data
    - Test edit button navigates
    - Test delete button triggers confirmation

### 14.4 Filter and Search Components
- [ ] **Task 14.4.1**: Create `EmployeeFilterPanel` component
  - Filter by status: All, Active, Inactive
  - Filter by role (if multiple roles)
  - Search by name or email
  - Reset filters button
  - **Unit Tests**:
    - Test filters update query parameters
    - Test search input updates filter
    - Test reset clears all filters

- [ ] **Task 14.4.2**: Create `EmployeeSearchBar` component
  - Search input with debounce (300ms)
  - Search icon
  - Clear button
  - **Unit Tests**:
    - Test debounce works
    - Test clear button works

### 14.5 Utility Components
- [ ] **Task 14.5.1**: Create `EmployeeStatusBadge` component
  - Visual badge for active/inactive status
  - Colors: green for active, red for inactive
  - French labels: "Actif", "Inactif"
  - **Unit Tests**:
    - Test renders correct color
    - Test renders correct label

- [ ] **Task 14.5.2**: Create `EmployeeRoleBadge` component
  - Visual badge for role
  - Different colors per role
  - **Unit Tests**: Test renders correctly

- [ ] **Task 14.5.3**: Create `ConfirmDeleteDialog` component
  - Modal dialog for delete confirmation
  - Message: "Êtes-vous sûr de vouloir supprimer {firstName} {lastName}?"
  - Buttons: Annuler, Supprimer
  - **Unit Tests**:
    - Test shows correct message
    - Test confirm button triggers delete
    - Test cancel closes dialog

---

## 15. FRONTEND - PAGES

### 15.1 Employee Pages
- [ ] **Task 15.1.1**: Create `EmployeesPage` component (`/employees`)
  - Page title: "Employés administratifs"
  - "Ajouter un employé" button (navigates to create page)
  - Include EmployeeList component
  - Include EmployeeFilterPanel
  - Include pagination
  - Handle URL query parameters for filters
  - **Unit Tests**:
    - Test renders all components
    - Test add button navigates
    - Test pagination updates URL

- [ ] **Task 15.1.2**: Create `EmployeeDetailPage` component (`/employees/:id`)
  - Page title: "Détails de l'employé"
  - Include EmployeeDetail component
  - Breadcrumb navigation: Employés > [Name]
  - **Unit Tests**:
    - Test renders detail component
    - Test handles not found

- [ ] **Task 15.1.3**: Create `EmployeeCreatePage` component (`/employees/new`)
  - Page title: "Ajouter un employé"
  - Include EmployeeForm component (in create mode)
  - Success: redirect to employee list with success message
  - Cancel: navigate back to list
  - **Unit Tests**:
    - Test renders form
    - Test successful creation redirects
    - Test cancel navigates back

- [ ] **Task 15.1.4**: Create `EmployeeEditPage` component (`/employees/:id/edit`)
  - Page title: "Modifier l'employé"
  - Include EmployeeForm component (in edit mode, pre-filled)
  - Load existing employee data
  - Success: redirect to detail page with success message
  - Cancel: navigate back to detail page
  - **Unit Tests**:
    - Test loads employee data
    - Test form pre-filled
    - Test successful update redirects

- [ ] **Task 15.1.5**: Create `ChangePasswordPage` component (`/employees/:id/change-password`)
  - Page title: "Changer le mot de passe"
  - Include ChangePasswordForm component
  - Success: show success message, stay on page or redirect
  - Cancel: navigate back to detail page
  - **Unit Tests**:
    - Test renders form
    - Test successful change shows message

---

## 16. FRONTEND - ROUTING

### 16.1 Route Configuration
- [ ] **Task 16.1.1**: Add employee routes to router
  - `/employees` → EmployeesPage
  - `/employees/new` → EmployeeCreatePage
  - `/employees/:id` → EmployeeDetailPage
  - `/employees/:id/edit` → EmployeeEditPage
  - `/employees/:id/change-password` → ChangePasswordPage
  - Protect all routes with authentication
  - **Testing**: Verify routes navigate correctly

---

## 17. FRONTEND - NAVIGATION

### 17.1 Navigation Menu
- [ ] **Task 17.1.1**: Add "Employés" link to main navigation menu
  - Icon: user/people icon
  - Label: "Employés"
  - Active state when on employee pages
  - **Testing**: Verify link navigates to employee list

---

## 18. FRONTEND - VALIDATION

### 18.1 Client-side Validation
- [ ] **Task 18.1.1**: Create validation functions in `utils/validators.js`
  - `validateEmail(email)` - email format
  - `validatePassword(password)` - min 8 chars, complexity
  - `validateRequired(value)` - not empty
  - Return error messages in French
  - **Unit Tests**:
    - Test email validation with various formats
    - Test password strength rules
    - Test required field validation

### 18.2 Form Validation Hooks
- [ ] **Task 18.2.1**: Integrate validation into forms
  - Use React Hook Form or similar
  - Show real-time validation errors
  - Prevent submission if invalid
  - **Testing**: Test forms show validation errors

---

## 19. FRONTEND - ERROR HANDLING

### 19.1 Error Display
- [ ] **Task 19.1.1**: Create `ErrorMessage` component
  - Display error messages from API
  - Different styles for different error types
  - Dismissible
  - **Unit Tests**:
    - Test renders error message
    - Test dismissible

- [ ] **Task 19.1.2**: Handle API errors in components
  - Show user-friendly error messages
  - Handle 400, 404, 409, 500 errors
  - French error messages
  - **Testing**: Test error messages display

---

## 20. FRONTEND - LOADING STATES

### 20.1 Loading Indicators
- [ ] **Task 20.1.1**: Add loading spinners to list page
  - Show spinner while fetching employees
  - Skeleton loader for table rows (optional)
  - **Testing**: Test loading state displays

- [ ] **Task 20.1.2**: Add loading states to forms
  - Disable submit button while submitting
  - Show spinner on submit button
  - **Testing**: Test loading state during submission

---

## 21. FRONTEND - SUCCESS FEEDBACK

### 21.1 Success Messages
- [ ] **Task 21.1.1**: Create `SuccessMessage` component
  - Show success message after create/update/delete
  - Auto-dismiss after 3 seconds
  - Dismissible manually
  - **Unit Tests**:
    - Test renders message
    - Test auto-dismiss

- [ ] **Task 21.1.2**: Show success messages after actions
  - "Employé créé avec succès"
  - "Employé modifié avec succès"
  - "Employé supprimé avec succès"
  - "Mot de passe changé avec succès"
  - **Testing**: Test messages appear after actions

---

## 22. FRONTEND - RESPONSIVE DESIGN

### 22.1 Mobile Optimization
- [ ] **Task 22.1.1**: Make employee list responsive
  - Table view on desktop
  - Card view on mobile (use EmployeeCard)
  - **Testing**: Test on different screen sizes

- [ ] **Task 22.1.2**: Make forms responsive
  - Stack fields vertically on mobile
  - Appropriate input sizes
  - **Testing**: Test forms on mobile devices

---

## 23. FRONTEND - ACCESSIBILITY

### 23.1 Accessibility Compliance
- [ ] **Task 23.1.1**: Add ARIA labels to forms
  - Label all form inputs
  - Add aria-required attributes
  - Add aria-invalid for errors
  - **Testing**: Test with screen reader

- [ ] **Task 23.1.2**: Keyboard navigation
  - All actions accessible via keyboard
  - Focus indicators visible
  - Tab order logical
  - **Testing**: Test keyboard-only navigation

---

## 24. FRONTEND - INTERNATIONALIZATION (Future)

### 24.1 French Localization
- [ ] **Task 24.1.1**: Ensure all text is in French
  - Button labels
  - Form labels
  - Error messages
  - Success messages
  - Page titles
  - **Testing**: Review all pages for English text

---

## 25. END-TO-END TESTS

### 25.1 E2E Test Setup
- [ ] **Task 25.1.1**: Setup Playwright test environment
  - Configure test database
  - Setup test users
  - Configure base URL
  - **Testing**: Verify test environment works

### 25.2 E2E Test Scenarios
- [ ] **Task 25.2.1**: Test employee creation workflow
  - Login as admin
  - Navigate to employees page
  - Click "Ajouter un employé"
  - Fill form
  - Submit
  - Verify employee appears in list
  - Verify success message
  - **File**: `e2e/employees/create-employee.spec.ts`

- [ ] **Task 25.2.2**: Test employee update workflow
  - Login as admin
  - Navigate to employees page
  - Click on employee
  - Click edit button
  - Update fields
  - Submit
  - Verify changes reflected
  - Verify success message
  - **File**: `e2e/employees/update-employee.spec.ts`

- [ ] **Task 25.2.3**: Test employee deletion workflow
  - Login as admin
  - Navigate to employees page
  - Click delete button
  - Confirm deletion
  - Verify employee removed from list
  - Verify success message
  - **File**: `e2e/employees/delete-employee.spec.ts`

- [ ] **Task 25.2.4**: Test password change workflow
  - Login as employee
  - Navigate to change password page
  - Enter current and new passwords
  - Submit
  - Logout
  - Login with new password
  - Verify login successful
  - **File**: `e2e/employees/change-password.spec.ts`

- [ ] **Task 25.2.5**: Test search and filter functionality
  - Login as admin
  - Navigate to employees page
  - Enter search term
  - Verify filtered results
  - Select status filter
  - Verify filtered results
  - Clear filters
  - Verify all employees shown
  - **File**: `e2e/employees/search-filter.spec.ts`

- [ ] **Task 25.2.6**: Test pagination
  - Login as admin
  - Create 25+ employees
  - Navigate to employees page
  - Verify pagination controls appear
  - Click next page
  - Verify different employees shown
  - **File**: `e2e/employees/pagination.spec.ts`

- [ ] **Task 25.2.7**: Test validation errors
  - Login as admin
  - Navigate to create employee page
  - Submit empty form
  - Verify validation errors appear
  - Enter invalid email
  - Verify email error
  - Enter weak password
  - Verify password error
  - **File**: `e2e/employees/validation.spec.ts`

- [ ] **Task 25.2.8**: Test error scenarios
  - Test duplicate email error
  - Test not found error (invalid ID)
  - Test network error handling
  - **File**: `e2e/employees/error-scenarios.spec.ts`

---

## 26. DOCUMENTATION

### 26.1 API Documentation
- [ ] **Task 26.1.1**: Document employee endpoints in Design_Document
  - Update section 3.4 with detailed API specs
  - Include request/response examples
  - Document all error codes
  - **Review**: Have another developer review documentation

### 26.2 Code Documentation
- [ ] **Task 26.2.1**: Add JSDoc/GoDoc comments
  - Comment all public functions
  - Comment complex logic
  - Document parameters and return values
  - **Review**: Check documentation completeness

### 26.3 User Documentation (Optional)
- [ ] **Task 26.3.1**: Create user guide for employee management
  - How to add an employee
  - How to edit an employee
  - How to change password
  - How to delete an employee
  - **Format**: Markdown file in docs/ folder

---

## 27. PERFORMANCE OPTIMIZATION

### 27.1 Backend Performance
- [ ] **Task 27.1.1**: Add database indexes
  - Verify index on email for fast lookups
  - Add index on last_name, first_name for sorting
  - Add index on is_active for filtering
  - **Testing**: Test query performance with EXPLAIN ANALYZE

- [ ] **Task 27.1.2**: Implement query optimization
  - Use SELECT specific fields instead of SELECT *
  - Add pagination limits
  - **Testing**: Benchmark query times

### 27.2 Frontend Performance
- [ ] **Task 27.2.1**: Implement data caching
  - Use React Query or SWR for caching
  - Cache employee list for 5 minutes
  - Invalidate cache on mutations
  - **Testing**: Verify cache reduces API calls

- [ ] **Task 27.2.2**: Lazy load components
  - Lazy load pages with React.lazy
  - Show loading fallback
  - **Testing**: Verify lazy loading works

---

## 28. SECURITY

### 28.1 Backend Security
- [ ] **Task 28.1.1**: Security audit
  - Verify no SQL injection vulnerabilities
  - Verify passwords are always hashed
  - Verify password hashes never returned in API
  - Verify session validation on all endpoints
  - **Testing**: Penetration testing

- [ ] **Task 28.1.2**: Rate limiting
  - Implement rate limiting on employee endpoints
  - Prevent brute force password attempts
  - **Testing**: Test rate limits trigger

### 28.2 Frontend Security
- [ ] **Task 28.2.1**: Input sanitization
  - Sanitize user inputs before display
  - Prevent XSS attacks
  - **Testing**: Test with malicious inputs

---

## 29. CI/CD INTEGRATION

### 29.1 CI Pipeline
- [ ] **Task 29.1.1**: Update CI pipeline to include employee tests
  - Add employee repository tests to backend pipeline
  - Add employee service tests to backend pipeline
  - Add employee handler tests to backend pipeline
  - Add employee component tests to frontend pipeline
  - Add employee E2E tests to E2E pipeline
  - **Testing**: Verify CI runs all tests

- [ ] **Task 29.1.2**: Update code coverage requirements
  - Ensure employee code is covered
  - Maintain 80%+ coverage
  - **Testing**: Review coverage reports

---

## 30. FINAL INTEGRATION & TESTING

### 30.1 Manual Testing
- [ ] **Task 30.1.1**: Manual testing checklist
  - [ ] Create employee with valid data → Success
  - [ ] Create employee with duplicate email → Error
  - [ ] Create employee with weak password → Error
  - [ ] Get employee list with pagination → Success
  - [ ] Search employees by name → Success
  - [ ] Filter employees by status → Success
  - [ ] Update employee details → Success
  - [ ] Change password → Success
  - [ ] Delete employee → Success (soft delete)
  - [ ] Verify action logs created for all actions

### 30.2 Cross-browser Testing
- [ ] **Task 30.2.1**: Test on multiple browsers
  - Chrome
  - Firefox
  - Safari
  - Edge
  - **Testing**: Document any browser-specific issues

### 30.3 Load Testing (Optional)
- [ ] **Task 30.3.1**: Load test employee endpoints
  - Test with 100+ concurrent users
  - Test with 1000+ employees in database
  - **Testing**: Document performance metrics

---

## 31. DEPLOYMENT PREPARATION

### 31.1 Database Migration
- [ ] **Task 31.1.1**: Prepare production migration
  - Test migration on staging database
  - Backup database before migration
  - Document rollback procedure
  - **Testing**: Test migration up and down

### 31.2 Feature Flag (Optional)
- [ ] **Task 31.2.1**: Implement feature flag for employee management
  - Allow enabling/disabling feature without code change
  - **Testing**: Test feature toggle

---

## 32. POST-DEPLOYMENT

### 32.1 Monitoring
- [ ] **Task 32.1.1**: Setup monitoring for employee endpoints
  - Monitor error rates
  - Monitor response times
  - Setup alerts for failures
  - **Testing**: Trigger test alert

### 32.2 User Feedback
- [ ] **Task 32.2.1**: Collect user feedback
  - Create feedback form
  - Monitor usage patterns
  - Identify improvement areas

---

## SUMMARY

This comprehensive todo list covers all aspects of implementing administrative employee management:

### Backend (Tasks 1-10):
- ✅ Database migrations and seeding
- ✅ Repository layer with full CRUD
- ✅ Service layer with business logic and validation
- ✅ Handler layer with HTTP endpoints
- ✅ Models, DTOs, and error handling
- ✅ Password hashing and validation utilities
- ✅ Action logging for audit trail
- ✅ Comprehensive unit and integration tests

### Frontend (Tasks 11-24):
- ✅ API client service
- ✅ TypeScript types and interfaces
- ✅ Custom React hooks for data fetching
- ✅ Reusable components (list, form, detail, filters)
- ✅ Complete pages with routing
- ✅ Form validation with French messages
- ✅ Error handling and success feedback
- ✅ Responsive design and accessibility

### Testing (Tasks 25):
- ✅ E2E tests for all workflows
- ✅ Validation and error scenario tests
- ✅ Search, filter, and pagination tests

### Additional (Tasks 26-32):
- ✅ Documentation (API, code, user guides)
- ✅ Performance optimization
- ✅ Security audit
- ✅ CI/CD integration
- ✅ Manual testing checklist
- ✅ Deployment preparation
- ✅ Post-deployment monitoring

### Estimated Effort:
- **Backend**: 40-50 hours
- **Frontend**: 35-45 hours
- **Testing**: 20-25 hours
- **Documentation & Polish**: 10-15 hours
- **Total**: ~105-135 hours (13-17 days for 1 developer)

### Priority Order:
1. **Phase 1**: Backend foundation (Tasks 1-5) - Repository, Service, Handler layers
2. **Phase 2**: Backend completion (Tasks 6-10) - Models, errors, utilities, tests
3. **Phase 3**: Frontend foundation (Tasks 11-15) - API client, hooks, core components
4. **Phase 4**: Frontend completion (Tasks 16-24) - Pages, routing, validation, polish
5. **Phase 5**: Testing (Task 25) - E2E tests
6. **Phase 6**: Documentation & deployment (Tasks 26-32)

This approach ensures steady progress with testable milestones at each phase.
