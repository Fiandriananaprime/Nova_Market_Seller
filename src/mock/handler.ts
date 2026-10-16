import { http, HttpResponse } from "msw";
import { entities, setActiveSellerIdentifier, setMockAuthenticated } from "./entities";
import type { Product, ProductInput } from "@/type/product"
import type { CustomerSegment } from "@/type/customer"
import type { DeliveryRecord } from "@/type/delivery"
import { mockDeliveryTrackingService } from "@/features/delivery-tracking/services/mockDeliveryTrackingService"

const API_URL = "*/v2";

export const handlers = [
  http.get(`${API_URL}/seller/dashboard`, () => {
    return HttpResponse.json(entities.dashboard);
  }),
];

export const authHandlers = [
  http.post("*/auth/login", async ({ request }) => {
    const body = (await request.json()) as {
      identifier: string
      password: string
      remember?: boolean
      rememberMe?: boolean
    }

    if (!body.identifier?.trim() || !body.password) {
      return HttpResponse.json(
        {
          message: "Invalid email or password",
        },
        { status: 401 }
      )
    }

    const remember = body.remember ?? body.rememberMe ?? false
    setActiveSellerIdentifier(body.identifier)
    setMockAuthenticated(true)

    return HttpResponse.json(
      {
        ...entities.users[0],
        email: body.identifier.includes("@") ? body.identifier : entities.users[0].email,
        phone: body.identifier.includes("@") ? entities.users[0].phone : body.identifier,
      },
      {
        headers: {
          "Set-Cookie": `access_token=mock-access-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=${remember ? 2592000 : 3600}`,
        },
      },
    )
  }),
]

export const orderHandlers = [
  http.get(`${API_URL}/seller/orders`, ({ request }) => {
    const url = new URL(request.url)

    const page = Number(url.searchParams.get("page") ?? "1")
    const limit = Number(url.searchParams.get("limit") ?? "10")
    const status = url.searchParams.get("status")
    const search = url.searchParams.get("search")?.trim().toLowerCase()

    const filteredOrders = entities.orders.filter((order) => {
      if (status && order.status !== status) return false
      if (search && !order.id.toLowerCase().includes(search)
        && !order.buyerName.toLowerCase().includes(search)) return false
      return true
    })

    const total = filteredOrders.length
    const totalPages = Math.ceil(total / limit)

    const start = (page - 1) * limit
    const end = start + limit

    return HttpResponse.json({
      data: filteredOrders.slice(start, end),

      meta: {
        page,
        limit,
        total,
        totalPages,
      },

      count: {
        pending: 12,
        confirmed: 8,
        processing: 5,
        shipped: 15,
        delivered: 42,
        cancelled: 3,
        refunded: 2,
      },
    })
  }),
]

export const customerHandlers = [
  http.get(`${API_URL}/seller/customers/:id`, ({ params }) => {
    const customer = entities.customers.find((item) => item.id === String(params.id))
    if (!customer) return HttpResponse.json({ message: "Customer not found" }, { status: 404 })
    return HttpResponse.json(customer)
  }),
  http.get(`${API_URL}/seller/customers`, ({ request }) => {
    const url = new URL(request.url)
    const page = Math.max(Number(url.searchParams.get("page") ?? "1"), 1)
    const limit = Math.max(Number(url.searchParams.get("limit") ?? "8"), 1)
    const search = url.searchParams.get("search")?.trim().toLowerCase()
    const segment = url.searchParams.get("segment") as CustomerSegment | null

    let filtered = [...entities.customers]
    if (search) {
      filtered = filtered.filter((customer) =>
        customer.name.toLowerCase().includes(search)
        || customer.email.toLowerCase().includes(search),
      )
    }
    if (segment === "vip") filtered = filtered.filter((customer) => customer.totalSpent > 1_000_000)
    if (segment === "frequent") filtered = filtered.filter((customer) => customer.ordersCount >= 5)
    if (segment === "new") filtered = filtered.filter((customer) => customer.ordersCount <= 2)

    filtered.sort((left, right) => right.totalSpent - left.totalSpent)
    const totalOrders = entities.customers.reduce((sum, customer) => sum + customer.ordersCount, 0)
    const totalSpent = entities.customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
    const total = filtered.length
    const start = (page - 1) * limit
    const allCustomers = entities.customers

    return HttpResponse.json({
      data: filtered.slice(start, start + limit),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalCustomers: allCustomers.length,
        activeCustomers: allCustomers.filter((customer) => customer.status === "active").length,
        totalSpent,
        repeatBuyersPct: allCustomers.length
          ? Math.round((allCustomers.filter((customer) => customer.ordersCount > 1).length / allCustomers.length) * 100)
          : 0,
        avgOrderValue: Math.round(totalSpent / Math.max(totalOrders, 1)),
      },
    })
  }),
]

const productStateStorageKey = "novamarket.seller.mock.products"
const isProduct = (value: unknown):value is Product => {
  return typeof value === "object" && value !== null
    && "id" in value && typeof value.id === "string"
    && "name" in value && typeof value.name === "string"
    && "price" in value && typeof value.price === "number"
    && "rating" in value && typeof value.rating === "number"
    && "reviewsCount" in value && typeof value.reviewsCount === "number"
    && "categoryId" in value && typeof value.categoryId === "string"
    && "categoryName" in value && typeof value.categoryName === "string"
    && "stock" in value && typeof value.stock === "number"
    && "sku" in value && typeof value.sku === "string"
    && "status" in value && (value.status === "active" || value.status === "inactive")
    && "createdAt" in value && typeof value.createdAt === "string"
};

const isProductInput = (value: unknown):value is ProductInput => {
  if (typeof value !== "object" || value === null
    || !("name" in value) || typeof value.name !== "string"
    || !("categoryId" in value) || typeof value.categoryId !== "string"
    || !("price" in value) || typeof value.price !== "number"
    || !("stock" in value) || typeof value.stock !== "number"
    || value.stock < 0 || !Number.isInteger(value.stock)
    || value.price < 0) return false

  if ("status" in value && value.status !== undefined && value.status !== "active" && value.status !== "inactive") return false
  if ("images" in value && value.images !== undefined) {
    if (!Array.isArray(value.images) || !value.images.every((image) =>
      typeof image === "object" && image !== null
      && "url" in image && typeof image.url === "string"
      && (!("isDefault" in image) || typeof image.isDefault === "boolean"))) return false
  }
  return true
};

const storedProductState = (() => {
  const serialized = localStorage.getItem(productStateStorageKey)
  if (!serialized) return { products: [], deletedIds: [] }

  const value: unknown = JSON.parse(serialized)
  if (
    typeof value !== "object" || value === null
    || !("products" in value) || !Array.isArray(value.products)
    || !("deletedIds" in value) || !Array.isArray(value.deletedIds)
    || !value.deletedIds.every((id) => typeof id === "string")
    || !value.products.every(isProduct)
  ) {
    throw new Error("Stored mock seller product state is invalid")
  }
  return { products: value.products.filter(isProduct), deletedIds: value.deletedIds }
})()
const productOverrides = new Map(storedProductState.products.map((product) => [product.id, product]))
const deletedProductIds = new Set(storedProductState.deletedIds)

const persistMockProductState = () => {
  localStorage.setItem(productStateStorageKey, JSON.stringify({
    products: Array.from(productOverrides.values()),
    deletedIds: Array.from(deletedProductIds),
  }))
};

const getSellerProducts = (): Product[] => {
  const products = entities.products
    .filter((product) => !deletedProductIds.has(product.id))
    .map((product) => productOverrides.get(product.id) ?? product)
  const seededIds = new Set(entities.products.map((product) => product.id))
  return [
    ...products,
    ...Array.from(productOverrides.values()).filter((product) => !seededIds.has(product.id)),
  ]
};

export const productHandlers = [
  http.get(`${API_URL}/categories`, () => HttpResponse.json(entities.categories)),
  http.post(`${API_URL}/seller/products`, async ({ request }) => {
    const body: unknown = await request.json()
    if (!isProductInput(body)) return HttpResponse.json({ message: "Invalid product input" }, { status: 422 })
    const input = body
    const category = entities.categories.find((item) => item.id === input.categoryId)
    if (!input.name.trim() || !category || !Number.isFinite(input.price)) {
      return HttpResponse.json({ message: "Invalid product input" }, { status: 422 })
    }
    const now = new Date().toISOString()
    const product: Product = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      description: input.description,
      brand: input.brand,
      price: input.price,
      rating: 0,
      reviewsCount: 0,
      sellerId: entities.users[0].id,
      sellerName: entities.users[0].name ?? "",
      storeId: entities.stores[0].id,
      storeName: entities.stores[0].name,
      categoryId: input.categoryId,
      categoryName: category.name,
      images: input.images ?? [],
      stock: input.stock,
      sku: input.sku ?? "",
      tags: input.tags,
      specs: input.specs,
      variants: input.variants,
      weightGrams: input.weightGrams,
      dimensions: input.dimensions,
      status: input.status ?? "inactive",
      moderationStatus: "draft",
      lowStockThreshold: input.lowStockThreshold ?? 10,
      createdAt: now,
      updatedAt: now,
    }
    productOverrides.set(product.id, product)
    persistMockProductState()
    return HttpResponse.json(product, { status: 201 })
  }),
  http.get(`${API_URL}/seller/products/:id`, ({ params }) => {
    if (deletedProductIds.has(String(params.id))) {
      return HttpResponse.json({ message: "Product not found" }, { status: 404 })
    }
    const product = productOverrides.get(String(params.id)) ?? entities.products.find((item) => item.id === String(params.id))
    if (!product) return HttpResponse.json({ message: "Product not found" }, { status: 404 })
    return HttpResponse.json(product)
  }),
  http.put(`${API_URL}/seller/products/:id`, async ({ params, request }) => {
    const id = String(params.id)
    if (deletedProductIds.has(id)) return HttpResponse.json({ message: "Product not found" }, { status: 404 })
    const current = productOverrides.get(id) ?? entities.products.find((item) => item.id === id)
    if (!current) return HttpResponse.json({ message: "Product not found" }, { status: 404 })
    if (current.moderationStatus === "pending") {
      return HttpResponse.json({ message: "A product pending review cannot be edited" }, { status: 409 })
    }
    const body: unknown = await request.json()
    if (!isProductInput(body)) return HttpResponse.json({ message: "Invalid product input" }, { status: 422 })
    const input = body
    const category = entities.categories.find((item) => item.id === input.categoryId)
    if (!input.name.trim() || !category || !Number.isFinite(input.price)) {
      return HttpResponse.json({ message: "Invalid product input" }, { status: 422 })
    }
    const updated: Product = {
      ...current,
      ...input,
      name: input.name.trim(),
      categoryName: category.name,
      status: input.status ?? current.status,
      moderationStatus: current.moderationStatus ?? "approved",
      updatedAt: new Date().toISOString(),
    }
    productOverrides.set(id, updated)
    persistMockProductState()
    return HttpResponse.json(updated)
  }),
  http.post(`${API_URL}/seller/products/:id/submit-review`, ({ params }) => {
    const id = String(params.id)
    const current = productOverrides.get(id) ?? entities.products.find((item) => item.id === id)
    if (!current || deletedProductIds.has(id)) {
      return HttpResponse.json({ message: "Product not found" }, { status: 404 })
    }
    if (current.moderationStatus !== "draft" && current.moderationStatus !== "rejected") {
      return HttpResponse.json({ message: "Product is not a draft" }, { status: 409 })
    }
    const updated: Product = { ...current, moderationStatus: "pending", updatedAt: new Date().toISOString() }
    productOverrides.set(id, updated)
    persistMockProductState()
    return HttpResponse.json(updated)
  }),
  http.delete(`${API_URL}/seller/products/:id`, ({ params }) => {
    const id = String(params.id)
    const current = productOverrides.get(id) ?? entities.products.find((item) => item.id === id)
    if (!current || deletedProductIds.has(id)) {
      return HttpResponse.json({ message: "Product not found" }, { status: 404 })
    }
    deletedProductIds.add(id)
    productOverrides.delete(id)
    persistMockProductState()
    return new HttpResponse(null, { status: 204 })
  }),
  http.get(`${API_URL}/seller/products`, ({ request }) => {
    const url = new URL(request.url)

    const search = url.searchParams.get("search")?.toLowerCase()
    const page = Number(url.searchParams.get("page") ?? "1")
    const limit = Number(url.searchParams.get("limit") ?? "10")
    const categoryId = url.searchParams.get("categoryId")
    const sellerId = url.searchParams.get("sellerId")
    const status = url.searchParams.get("status")
    const minPrice = Number(url.searchParams.get("minPrice"))
    const maxPrice = Number(url.searchParams.get("maxPrice"))
    const minRating = Number(url.searchParams.get("minRating"))
    const onSale = url.searchParams.get("onSale")
    const sort = url.searchParams.get("sort") ?? "relevance"

    let filtered = getSellerProducts()

    // Search
    if (search) {
      filtered = filtered.filter((product) =>
        [
          product.name,
          product.nameF,
          product.brand,
          product.description,
          product.categoryName,
          ...(product.tags ?? []),
        ]
          .filter(Boolean)
          .some((value) =>
            value?.toLowerCase().includes(search)
          )
      )
    }

    // Category
    if (categoryId) {
      filtered = filtered.filter((product) => product.categoryId === categoryId)
    }

    if (status) {
      filtered = filtered.filter((product) => product.status === status || product.moderationStatus === status)
    }

    // Seller
    if (sellerId) {
      filtered = filtered.filter(
        (product) => product.sellerId === sellerId
      )
    }

    // Price
    if (!Number.isNaN(minPrice)) {
      filtered = filtered.filter(
        (product) => product.price >= minPrice
      )
    }

    if (!Number.isNaN(maxPrice)) {
      filtered = filtered.filter(
        (product) => product.price <= maxPrice
      )
    }

    // Rating
    if (!Number.isNaN(minRating)) {
      filtered = filtered.filter(
        (product) => product.rating >= minRating
      )
    }

    // Sale
    if (onSale === "true") {
      filtered = filtered.filter(
        (product) =>
          product.discount !== undefined &&
          product.discount > 0
      )
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price)
        break

      case "price_desc":
        filtered.sort((a, b) => b.price - a.price)
        break

      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break

      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        break

      case "relevance":
      default:
        break
    }

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)

    const start = (page - 1) * limit
    const end = start + limit

    // Stock alerts
    const lowStock = entities.products.filter(
      (product) => product.stock > 0 && product.stock < 10
    )

    const outOfStock = entities.products.filter(
      (product) => product.stock === 0
    )

    return HttpResponse.json({
      data: filtered.slice(start, end),

      meta: {
        page,
        limit,
        total,
        totalPages,
      },

      lowStock,
      outOfStock,
    })
  }),
]

export const storeHandlers = [
  http.get(`${API_URL}/seller/stores`, () => {
    return HttpResponse.json(entities.stores)
  }),]

export const reviewHandlers = [
  http.get(`${API_URL}/seller/reviews`, ({ request }) => {
    const url = new URL(request.url)
    const storeId = url.searchParams.get("storeId")
    const page = Math.max(Number(url.searchParams.get("page") ?? "1"), 1)
    const limit = Math.max(Number(url.searchParams.get("limit") ?? "10"), 1)
    const rating = url.searchParams.get("rating")
    const replied = url.searchParams.get("replied")
    const filteredReviews = (storeId
      ? entities.reviews.filter((review) => review.storeId === storeId)
      : entities.reviews
    ).filter((review) => {
      if (rating && review.rating !== Number(rating)) return false
      if (replied && review.replied !== (replied === "true")) return false
      return true
    })
    const start = (page - 1) * limit
    const data = filteredReviews.slice(start, start + limit)

    return HttpResponse.json({
      data,
      meta: {
        page,
        limit,
        total: filteredReviews.length,
        totalPages: Math.ceil(filteredReviews.length / limit),
      },
      averageRating: filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length || 0,
      ratingBreakdown: {
        1: filteredReviews.filter((r) => r.rating === 1).length,
        2: filteredReviews.filter((r) => r.rating === 2).length,
        3: filteredReviews.filter((r) => r.rating === 3).length,
        4: filteredReviews.filter((r) => r.rating === 4).length,
        5: filteredReviews.filter((r) => r.rating === 5).length,
      },
    })
  }),
]

const normalizeMockDelivery = (record: DeliveryRecord):DeliveryRecord => {
  const now = Date.now()
  return {
    ...record,
    lastUpdate: new Date(now).toISOString(),
    timeline: record.timeline.map((event, index) => ({
      ...event,
      timestamp: Number.isNaN(Date.parse(event.timestamp))
        ? new Date(now - (record.timeline.length - index) * 60_000).toISOString()
        : event.timestamp,
    })),
  }
};

export const deliveryHandlers = [
  http.get(`${API_URL}/seller/deliveries/:id`, async ({ params }) => {
    const record = await mockDeliveryTrackingService.getDeliveryById(String(params.id))
    if (!record) return HttpResponse.json({ message: "Delivery not found" }, { status: 404 })
    return HttpResponse.json(normalizeMockDelivery(record))
  }),
  http.get(`${API_URL}/seller/deliveries`, async ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") ?? "1")
    const limit = Number(url.searchParams.get("limit") ?? "20")
    const status = url.searchParams.get("status")
    const search = url.searchParams.get("search")?.trim().toLowerCase()
    const sortBy = url.searchParams.get("sortBy") ?? "updatedAt"
    const records = await mockDeliveryTrackingService.getDeliveries()
    let filtered = records

    if (status) filtered = filtered.filter((record) => record.status === status)
    if (search) {
      filtered = filtered.filter((record) =>
        record.orderReference.toLowerCase().includes(search)
        || record.destination.recipientName.toLowerCase().includes(search)
        || record.destination.district.toLowerCase().includes(search)
        || record.driver?.name.toLowerCase().includes(search),
      )
    }

    if (sortBy === "eta") {
      filtered.sort((left, right) =>
        new Date(left.estimatedArrival ?? Number.MAX_SAFE_INTEGER).getTime()
        - new Date(right.estimatedArrival ?? Number.MAX_SAFE_INTEGER).getTime(),
      )
    } else if (sortBy === "status") {
      filtered.sort((left, right) => left.status.localeCompare(right.status))
    } else {
      filtered.sort((left, right) =>
        new Date(right.lastUpdate).getTime() - new Date(left.lastUpdate).getTime(),
      )
    }

    const summary = await mockDeliveryTrackingService.getDeliveryStats()
    const start = (page - 1) * limit
    return HttpResponse.json({
      data: filtered.slice(start, start + limit).map(normalizeMockDelivery),
      meta: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
      summary,
    })
  }),
]
