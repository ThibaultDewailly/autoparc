import { apiGet, apiPost } from './api'
import type { User, LoginCredentials, LoginResponse } from '@/types'
import { transformUser, transformLoginResponse } from '@/utils/apiTransformers'

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiPost<any, LoginCredentials>('/auth/login', credentials)
  return transformLoginResponse(response)
}

export async function logout(): Promise<void> {
  return apiPost<void>('/auth/logout')
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiGet<any>('/auth/me')
  return transformUser(response)
}
