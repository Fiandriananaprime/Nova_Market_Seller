import { http, HttpResponse } from "msw";
import { authResponse, entities } from "./entities";

const API_URL = "*/v2";

export const handlers = [
  http.get(`${API_URL}/seller/dashboard`, () => {
    return HttpResponse.json(entities.dashboard);
  }),
];

export const authHandlers = [
  http.post("*/auth/login", async ({ request }) => {
    const body = (await request.json()) as {
      email: string
      password: string
      remember?: boolean
      rememberMe?: boolean
    }

    if (
      body.email !== "hei.fiandrianana@gmail.com" ||
      body.password !== "Fiandrianana1357"
    ) {
      return HttpResponse.json(
        {
          message: "Invalid email or password",
        },
        { status: 401 }
      )
    }

    const remember = body.remember ?? body.rememberMe ?? false

    return HttpResponse.json({
      ...authResponse,
      user: { ...authResponse.user, email: body.email },
      tokens: {
        ...authResponse.tokens,
        expiresIn: remember ? 2592000 : 3600,
      },
    })
  }),
]

export const orderHandlers = [
  http.get(`${API_URL}/seller/orders`, ({ request }) => {
    const url = new URL(request.url)

    const page = Number(url.searchParams.get("page") ?? "1")
    const limit = Number(url.searchParams.get("limit") ?? "10")
    const storeId = url.searchParams.get("storeId")
    const status = url.searchParams.get("status")

    const filteredOrders = status
      ? entities.orders.filter((order) => order.status === status)
      : entities.orders

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

const productOverrides = new Map<string, (typeof entities.products)[number]>()

export const productHandlers = [
  http.get(`${API_URL}/seller/products/:id`, ({ params }) => {
    const product = productOverrides.get(String(params.id)) ?? entities.products.find((item) => item.id === String(params.id))
    if (!product) return HttpResponse.json({ message: "Product not found" }, { status: 404 })
    return HttpResponse.json(product)
  }),
  http.put(`${API_URL}/seller/products/:id`, async ({ params, request }) => {
    const id = String(params.id)
    const current = productOverrides.get(id) ?? entities.products.find((item) => item.id === id)
    if (!current) return HttpResponse.json({ message: "Product not found" }, { status: 404 })
    const input = await request.json() as { status?: "active" | "inactive" }
    if (current.moderationStatus !== "approved" || !input.status) {
      return HttpResponse.json({ message: "Product status cannot be changed" }, { status: 403 })
    }
    const updated = { ...current, status: input.status, updatedAt: new Date().toISOString() }
    productOverrides.set(id, updated)
    return HttpResponse.json(updated)
  }),
  http.get(`${API_URL}/seller/products`, ({ request }) => {
    const url = new URL(request.url)

    const search = url.searchParams.get("search")?.toLowerCase()
    const page = Number(url.searchParams.get("page") ?? "1")
    const limit = Number(url.searchParams.get("limit") ?? "10")
    const category = url.searchParams.get("category")
    const sellerId = url.searchParams.get("sellerId")
    const minPrice = Number(url.searchParams.get("minPrice"))
    const maxPrice = Number(url.searchParams.get("maxPrice"))
    const minRating = Number(url.searchParams.get("minRating"))
    const onSale = url.searchParams.get("onSale")
    const sort = url.searchParams.get("sort") ?? "relevance"

    let filtered = [...entities.products]

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
    if (category) {
      filtered = filtered.filter(
        (product) =>
          product.categoryId === category ||
          product.categoryName.toLowerCase() === category.toLowerCase()
      )
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
