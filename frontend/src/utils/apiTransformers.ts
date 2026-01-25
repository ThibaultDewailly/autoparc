import type { User, Session } from '@/types'

// Transform backend User response to frontend format
export function transformUser(backendUser: any): User {
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
export function transformSession(backendSession: any): Session {
  return {
    id: backendSession.id,
    userId: backendSession.user_id,
    sessionToken: backendSession.session_token,
    expiresAt: backendSession.expires_at,
    createdAt: backendSession.created_at,
  }
}

// Transform backend LoginResponse to frontend format
export function transformLoginResponse(backendResponse: any): { user: User; session: Session } {
  return {
    user: transformUser(backendResponse.user),
    session: transformSession(backendResponse.session),
  }
}
