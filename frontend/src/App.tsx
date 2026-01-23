import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CarsPage } from '@/pages/CarsPage'
import { CarDetailPage } from '@/pages/CarDetailPage'
import { CarFormPage } from '@/pages/CarFormPage'
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
        
        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
