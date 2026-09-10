export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded"
export type DeliveryMethod = "standard" | "express" | "pickup"
export type PaymentMethod = "mvola" | "orange_money" | "card" | "cod"
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

export interface Order {
    id: string
    buyerId: string
    buyerName: string
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
