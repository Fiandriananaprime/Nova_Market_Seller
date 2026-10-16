export interface AnalyticsMetrics {
  revenue: number
  revenueChange: number
  orders: number
  ordersChange: number
  storeViews: number
  storeViewsChange?: number
  conversionRate: number
  conversionRateChange?: number
}

export interface AnalyticsRevenuePoint {
  month: string
  revenue: number
  orders: number
}

export interface AnalyticsCategory {
  name: string
  percentage: number
  revenue?: number
}

export interface AnalyticsTopProduct {
  id: string
  name: string
  image?: string
  units: number
  revenue: number
  growth?: number
}

export interface SellerAnalytics {
  metrics: AnalyticsMetrics
  revenueSeries: AnalyticsRevenuePoint[]
  categoryBreakdown: AnalyticsCategory[]
  topProducts: AnalyticsTopProduct[]
}
