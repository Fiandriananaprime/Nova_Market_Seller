
import { Order } from "./order"
import { topProductsUnits } from "./product"

export interface SellerDashboard {
    metrics: SellerMetrics
    revenueSeries: RevenuePoint[]
    recentOrders: Order[]
    topProducts: topProductsUnits[]
}

export interface SellerMetrics {
    customer: number
    revenue: number
    orders: number
    products: number
    lowStock: number
    revenueChangePct: number
    ordersChangePct: number
    customerChangePct: number
    productsChangePct: number
    lowStockChangePct: number
}

export interface RevenuePoint {
    month: string
    revenue: number
    orders: number
}