import { apiGet, apiPost } from './api'
import type { User, LoginCredentials, LoginResponse, BackendLoginResponse, BackendUser } from '@/types'
import { transformUser } from '@/utils/apiTransformers'

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiPost<BackendLoginResponse, LoginCredentials>('/auth/login', credentials)
  // Backend only returns user, not session (session is in cookie)
  return { user: transformUser(response.user) }
}

export async function logout(): Promise<void> {
  return apiPost<void>('/auth/logout')
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiGet<BackendUser>('/auth/me')
  return transformUser(response)
}
