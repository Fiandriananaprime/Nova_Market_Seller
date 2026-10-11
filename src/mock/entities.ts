import { AuthResponse, User } from "@/type/auth"
import { Customer } from "@/type/customer"
import { SellerDashboard } from "@/type/dashboard"
import { Order } from "@/type/order"
import { Product, topProductsUnits } from "@/type/product"
import { Review } from "@/type/review"
import { Store } from "@/type/store"

import { sellerDashboard as dashboardSeed } from "./data/dashboard"
import { orders as orderSeed } from "./data/order/order"
import { products as productSeed, topProducts as topProductSeed } from "./data/product/product"
import { reviews as reviewSeed } from "./data/review/review"
import { stores as storeSeed } from "./data/store/store"

const seller: User = {
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  firstName: "Rakoto",
  lastName: "Andry",
  name: "Rakoto Andry",
  email: "hei.fiandrianana@gmail.com",
  phone: "+261340000000",
  role: "seller",
  status: "active",
  avatarUrl: null,
  emailVerified: true,
  phoneVerified: true,
  createdAt: "2026-01-10T10:00:00.000Z",
  updatedAt: "2026-09-10T18:06:49.841Z",
  lastLoginAt: "2026-09-10T18:06:49.841Z",
  ordersCount: 128,
}

const canonicalStores: Store[] = storeSeed
const currentStore = canonicalStores[0]

const customers: Customer[] = orderSeed.map((order, index) => ({
  id: `customer-${String(index + 1).padStart(3, "0")}`,
  name: order.buyerName,
  email: `customer${String(index + 1).padStart(3, "0")}@example.com`,
  avatarInitial: order.buyerName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
  ordersCount: 1,
  totalSpent: order.total,
  lastOrderDate: order.createdAt.slice(0, 10),
  status: "active",
}))

const canonicalProducts: Product[] = productSeed.map((product) => ({
  ...product,
  sellerId: seller.id,
  sellerName: seller.name ?? `${seller.firstName} ${seller.lastName}`,
  storeId: currentStore.id,
  storeName: currentStore.name,
}))

const productById = new Map(canonicalProducts.map((product) => [product.id, product]))

const canonicalOrders: Order[] = orderSeed.map((order, orderIndex) => {
  const customer = customers[orderIndex]

  return {
    ...order,
    buyerId: customer.id,
    buyerName: customer.name,
    sellers: [{ id: seller.id, name: seller.name ?? "" }],
    items: order.items.map((item) => {
      const product = productById.get(item.productId)

      return {
        ...item,
        productName: product?.name ?? item.productName,
        image: product?.images?.find((image) => image.isDefault)?.url ?? product?.images?.[0]?.url ?? item.image,
        sellerId: seller.id,
        sellerName: seller.name ?? "",
      }
    }),
  }
})

const canonicalReviews: Review[] = reviewSeed.map((review, reviewIndex) => {
  const product = canonicalProducts[reviewIndex % canonicalProducts.length]
  const customer = customers[reviewIndex % customers.length]

  return {
    ...review,
    storeId: currentStore.id,
    productId: product.id,
    productName: product.name,
    customerId: customer.id,
    customerName: customer.name,
    replyDate: review.replyDate || "",
    status: review.status as Review["status"],
  }
})

const canonicalTopProducts: topProductsUnits[] = topProductSeed.map((product) => {
  const canonicalProduct = productById.get(product.id) ?? canonicalProducts[0]

  return {
    ...canonicalProduct,
    units: product.units,
    revenue: product.revenue,
    growth: product.growth,
  }
})

const dashboard: SellerDashboard = {
  ...dashboardSeed,
  recentOrders: canonicalOrders.slice(0, 5),
  topProducts: canonicalTopProducts,
}

export const authResponse: AuthResponse = {
  user: seller,
  tokens: {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresIn: 3600,
  },
  currentStore: currentStore.id,
}

export const entities = {
  users: [seller],
  stores: canonicalStores,
  customers,
  products: canonicalProducts,
  orders: canonicalOrders,
  reviews: canonicalReviews,
  dashboard,
} as const
