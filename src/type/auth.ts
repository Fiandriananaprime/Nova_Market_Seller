export type UserRole = "buyer" | "seller" | "admin"
export type UserStatus = "active" | "suspended"

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface User {
  id: string
  firstName: string
  lastName: string
  name?: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  avatarUrl: string | null
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  ordersCount: number
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
  currentStore: string | null
}
