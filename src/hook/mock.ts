import { entities } from "@/mock/entities"
import { PaymentStatus as ApiPaymentStatus } from "@/type/order"
import { productStatus as ApiProductStatus } from "@/type/product"

export type OrderStatus = "pending" | "confirmed" | "processing" | "preparing" | "shipped" | "delivered" | "cancelled"
export type PaymentStatus = ApiPaymentStatus
export type ProductStatus = ApiProductStatus
export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock"

export interface Order {
  id: string
  buyerName: string
  buyerAvatar: string
  buyerPhone?: string
  buyerEmail?: string
  items: { name: string; qty: number; price: number }[]
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  deliveryMethod: string
  city: string
  district?: string
  street?: string
  instructions?: string
  tracking?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  sold: number
  rating: number
  reviewsCount: number
  status: ProductStatus
  image: string
  images?: string[]
  createdAt: string
}

export interface InventoryItem {
  productId: string
  name: string
  sku: string
  category: string
  stock: number
  reserved: number
  available: number
  threshold: number
  status: InventoryStatus
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  initials: string
  ordersCount: number
  totalSpent: number
  lastOrderDate: string
  status: "active" | "inactive"
  city: string
  district?: string
}

export interface Review {
  id: string
  productName: string
  customerName: string
  customerInitials: string
  rating: number
  comment: string
  date: string
  replied: boolean
  reply?: string
  status: "published" | "pending" | "hidden"
}

export interface RevenuePoint {
  month: string
  revenue: number
  orders: number
}

const topProductUnits = new Map(
  entities.dashboard.topProducts.map((product) => [product.id, product.units]),
)

export const orders: Order[] = entities.orders.map((order, idx) => ({
  id: order.id,
  buyerName: order.buyerName,
  buyerAvatar: order.buyerName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
  buyerPhone:
    order.address?.phone ??
    `+261 34 ${String(12 + idx * 3).padStart(2, "0")} ${String(110 + idx * 17).padStart(3, "0")} 89`,
  buyerEmail: `${order.buyerName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
  items: order.items.map((item) => ({
    name: item.productName,
    qty: item.qty,
    price: item.price,
  })),
  total: order.total,
  status: order.status,
  paymentStatus: order.paymentStatus,
  paymentMethod: order.paymentMethod,
  deliveryMethod: order.deliveryMethod,
  city: order.address?.city ?? "Antananarivo",
  district: order.address?.district ?? "Antananarivo Renivohitra",
  street: order.address?.street ?? "Analakely",
  instructions: order.address?.instructions ?? order.note ?? "Livrer à l'adresse indiquée, joignable par appel ou WhatsApp",
  tracking: order.tracking ?? `TCK-${order.id.replace("ord-", "").toUpperCase()}-MDG`,
  createdAt: order.createdAt,
}))

export const products: Product[] = entities.products.map((product) => ({
  id: product.id,
  name: product.name,
  sku: product.sku,
  category: product.categoryName,
  price: product.price,
  stock: product.stock,
  sold: topProductUnits.get(product.id) ?? 0,
  rating: product.rating,
  reviewsCount: product.reviewsCount,
  status: product.status,
  image: product.images?.find((image) => image.isDefault)?.url ?? product.images?.[0]?.url ?? "",
  createdAt: product.createdAt,
}))

export const inventoryItems: InventoryItem[] = products.map((product) => {
  const reserved = Math.min(product.stock, Math.round(product.stock * 0.1))
  const threshold = 10

  return {
    productId: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    stock: product.stock,
    reserved,
    available: product.stock - reserved,
    threshold,
    status:
      product.stock === 0
        ? "out_of_stock"
        : product.stock <= threshold
          ? "low_stock"
          : "in_stock",
  }
})

export const customers: Customer[] = entities.customers.map((customer, idx) => ({
  id: customer.id,
  name: customer.name,
  email: customer.email,
  phone: `+261 34 ${String(21 + idx * 2).padStart(2, "0")} ${String(345 + idx * 9).padStart(3, "0")} 12`,
  initials: customer.avatarInitial,
  ordersCount: customer.ordersCount,
  totalSpent: customer.totalSpent,
  lastOrderDate: customer.lastOrderDate ?? "",
  status: customer.status,
  city: "Antananarivo",
  district: idx % 2 === 0 ? "Analakely / Renivohitra" : "Ankorondrano / Ivandry",
}))

export const reviews: Review[] = entities.reviews.map((review) => ({
  id: review.id,
  productName: review.productName,
  customerName: review.customerName,
  customerInitials: review.customerName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
  rating: review.rating,
  comment: review.comment,
  date: review.date,
  replied: review.replied,
  reply: review.reply ?? undefined,
  status: review.status as Review["status"],
}))

export const metrics = {
  revenue: entities.dashboard.metrics.revenue,
  revenueChange: entities.dashboard.metrics.revenueChangePct,
  orders: entities.dashboard.metrics.orders,
  ordersChange: entities.dashboard.metrics.ordersChangePct,
  products: entities.dashboard.metrics.products,
  productsChange: entities.dashboard.metrics.productsChangePct,
  customers: entities.dashboard.metrics.customer,
  customersChange: entities.dashboard.metrics.customerChangePct,
  avgOrderValue: Math.round(
    entities.dashboard.metrics.revenue / Math.max(entities.dashboard.metrics.orders, 1),
  ),
  conversionRate: 0,
  storeViews: 0,
  pendingOrders: orders.filter((order) => order.status === "pending").length,
  lowStockCount: inventoryItems.filter((item) => item.status === "low_stock").length,
}

export const revenueSeries: RevenuePoint[] = entities.dashboard.revenueSeries

export const topProducts = entities.dashboard.topProducts.map((product) => ({
  name: product.name,
  revenue: product.revenue,
  units: product.units,
  growth: product.growth,
}))

const categoryCounts = products.reduce<Record<string, number>>((counts, product) => {
  counts[product.category] = (counts[product.category] ?? 0) + 1
  return counts
}, {})

export const categoryBreakdown = Object.entries(categoryCounts).map(([name, count]) => ({
  name,
  percentage: Math.round((count / Math.max(products.length, 1)) * 100),
}))

export const storeInfo = {
  ...entities.stores[0],
  phone: "+261 34 00 000 00",
  email: "hei.fiandrianana@gmail.com",
  vacationMode: false,
  socialLinks: {
    facebook: null,
    instagram: null,
    website: null,
  },
}

export const formatMGA = (amount: number) => `${amount.toLocaleString("fr-MG")} Ar`
export const formatFullMGA = formatMGA
