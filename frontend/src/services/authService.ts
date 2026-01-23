import { apiGet, apiPost } from './api'
import type { User, LoginCredentials, LoginResponse } from '@/types'

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiPost<LoginResponse, LoginCredentials>('/auth/login', credentials)
}

export async function logout(): Promise<void> {
  return apiPost<void>('/auth/logout')
}

export async function getCurrentUser(): Promise<User> {
  return apiGet<User>('/auth/me')
}
