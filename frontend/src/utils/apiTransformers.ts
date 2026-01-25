import type { User, Session, BackendUser, BackendSession, BackendLoginResponse } from '@/types'

// Transform backend User response to frontend format
export function transformUser(backendUser: BackendUser): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    role: backendUser.role,
    isActive: backendUser.is_active,
  }
}

// Transform backend Session response to frontend format
export function transformSession(backendSession: BackendSession): Session {
  return {
    id: backendSession.id,
    userId: backendSession.user_id,
    sessionToken: backendSession.session_token,
    expiresAt: backendSession.expires_at,
    createdAt: backendSession.created_at,
  }
}

// Transform backend LoginResponse to frontend format
// Note: Backend login only returns user, session is stored in httpOnly cookie
export function transformLoginResponse(backendResponse: BackendLoginResponse): { user: User } {
  return {
    user: transformUser(backendResponse.user),
  }
}
