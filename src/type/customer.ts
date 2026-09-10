export type CustomerStatus = "active" | "inactive"

export interface Customer {
  id: string
  name: string
  email: string
  avatarInitial: string
  ordersCount: number
  totalSpent: number
  lastOrderDate: string | null
  status: CustomerStatus
}
