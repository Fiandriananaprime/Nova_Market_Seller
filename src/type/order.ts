export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded"
export type DeliveryMethod = "standard" | "express" | "pickup"
export type PaymentMethod = "mvola" | "orange_money" | "card" | "cod"
export type OrderStatus = "pending" | "confirmed" | "processing" | "preparing" | "shipped" | "delivered" | "cancelled" | "refunded"

export interface PaginationMeta {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface OrderCounts {
    pending: number
    confirmed: number
    processing: number
    preparing?: number
    shipped: number
    delivered: number
    cancelled: number
    refunded: number
}

export interface GetSellerOrdersQuery {
    page: number
    limit: number
    storeId?: string
    status?: OrderStatus
    search?: string
}

export interface GetSellerOrdersResponse {
    data: Order[]
    meta: PaginationMeta
    counts: OrderCounts
}

export interface Order {
    id: string
    buyerId: string
    buyerName: string
    buyerEmail?: string
    buyerPhone?: string
    items: OrderItem[]
    sellers: [{ id: string; name: string }]
    subtotal: number
    shippingFee: number
    total: number
    status: OrderStatus
    deliveryMethod: DeliveryMethod
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    tracking?: string
    estimatedDelivery?: string
    note: string | null
    createdAt: string
    updatedAt: string
    address?: Address
    city?: string
    street?: string
    district?: string
    instructions?: string
    buyerAvatar?: string
}

export interface OrderItem {
    productId: string
    productName: string
    image: string
    price: number
    qty: number
    sellerId: string
    sellerName: string
}

export interface Address {
    id: string
    label: string
    recipientName: string
    phone: string
    street: string
    district: string
    city: string
    region: string
    postalCode: string
    country: string
    latitude: number | null 
    longitude: number | null
    instructions: string | null
    isDefault: boolean
}
