import type { PaginationMeta } from "@/type/order"

export type CustomerStatus = "active" | "inactive"
export type CustomerSegment = "vip" | "frequent" | "new"

export interface Customer {
  id: string
  name: string
  email: string
  avatarInitial?: string
  ordersCount: number
  totalSpent: number
  lastOrderDate: string | null
  status: CustomerStatus
  city?: string
  district?: string
  phone?: string
  address?: string
}

export interface CustomerListResponse {
  data: Customer[]
  meta: PaginationMeta
  summary: {
    totalCustomers: number
    activeCustomers: number
    totalSpent: number
    repeatBuyersPct: number
    avgOrderValue: number
  }
}
