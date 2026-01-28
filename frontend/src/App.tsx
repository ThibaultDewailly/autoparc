import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CarsPage } from '@/pages/CarsPage'
import { CarDetailPage } from '@/pages/CarDetailPage'
import { CarFormPage } from '@/pages/CarFormPage'
import { EmployeesPage } from '@/pages/EmployeesPage'
import { EmployeeDetailPage } from '@/pages/EmployeeDetailPage'
import { EmployeeCreatePage } from '@/pages/EmployeeCreatePage'
import { EmployeeEditPage } from '@/pages/EmployeeEditPage'
import { ChangePasswordPage } from '@/pages/ChangePasswordPage'
import { OperatorsPage } from '@/pages/OperatorsPage'
import { OperatorDetailPage } from '@/pages/OperatorDetailPage'
import { OperatorFormPage } from '@/pages/OperatorFormPage'
import { ROUTES } from '@/utils/constants'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        
        <Route
          path={ROUTES.dashboard}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.cars}
          element={
            <ProtectedRoute>
              <CarsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.carNew}
          element={
            <ProtectedRoute>
              <CarFormPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/cars/:id"
          element={
            <ProtectedRoute>
              <CarDetailPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/cars/:id/edit"
          element={
            <ProtectedRoute>
              <CarFormPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.employees}
          element={
            <ProtectedRoute>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.employeeNew}
          element={
            <ProtectedRoute>
              <EmployeeCreatePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute>
              <EmployeeDetailPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/employees/:id/edit"
          element={
            <ProtectedRoute>
              <EmployeeEditPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/employees/:id/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.operators}
          element={
            <ProtectedRoute>
              <OperatorsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.operatorNew}
          element={
            <ProtectedRoute>
              <OperatorFormPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/operators/:id"
          element={
            <ProtectedRoute>
              <OperatorDetailPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/operators/:id/edit"
          element={
            <ProtectedRoute>
              <OperatorFormPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
