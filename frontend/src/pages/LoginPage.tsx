import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { ROUTES } from '@/utils/constants'
import type { LoginCredentials } from '@/types'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.dashboard)
    }
  }, [isAuthenticated, navigate])

  async function handleLogin(credentials: LoginCredentials) {
    await login(credentials)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <LoginForm onSubmit={handleLogin} />
    </div>
  )
}
