export type UserRole = "buyer" | "seller" | "admin"
export type UserStatus = "active" | "suspended"

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

export interface AuthMe {
  userId: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  adminRole: string | null
  emailVerified: boolean
  phoneVerified: boolean
}

export interface CsrfToken {
  token: string
}
