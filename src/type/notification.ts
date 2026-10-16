export type SellerNotificationType =
  | "order"
  | "payment"
  | "promotion"
  | "review"
  | "seller"
  | "system"
  | "security"

export interface SellerNotification {
  id: string
  type: SellerNotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: string
}

export interface SellerNotificationsResponse {
  data: SellerNotification[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
