import { http, HttpResponse } from "msw"
import {
  entities,
  getActiveSellerEmail,
  getActiveSellerPhone,
  isMockAuthenticated,
  setMockAuthenticated,
} from "./entities"
import type { ShippingSettings, StorePolicies } from "@/type/seller"

const API_URL = "*/v2"

let sellerShippingSettings: ShippingSettings = {
  zone1: 4000,
  zone2: 7000,
  zone3: 15000,
  freeShippingThreshold: 150000,
  handlingTimeHours: 24,
  returnWindowDays: 7,
  returnShippingPayer: "seller_if_defective",
}

let storePolicies: StorePolicies = {
  returnPolicy: "",
  refundPolicy: "",
  cancellationPolicy: "",
  privacyPolicy: "",
}

const notifications = entities.orders.slice(0, 4).map((order, index) => ({
  id: `seller-notification-${index + 1}`,
  type: (index === 0 ? "order" : index === 1 ? "payment" : index === 2 ? "review" : "seller") as
    | "order"
    | "payment"
    | "review"
    | "seller",
  title: index === 0 ? "Nouvelle commande" : index === 1 ? "Paiement reçu" : index === 2 ? "Nouvel avis" : "Mise à jour boutique",
  message: `${order.id} · ${order.buyerName}`,
  data: { orderId: order.id },
  read: index > 1,
  createdAt: order.createdAt,
}))

export const accountHandlers = [
  http.get(`${API_URL}/auth/me`, ({ request }) => {
    const cookieSession = request.headers.get("cookie")?.includes("access_token=mock-access-token") ?? false
    if (!isMockAuthenticated() && !cookieSession) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    setMockAuthenticated(true)
    const user = entities.users[0]
    return HttpResponse.json({
      userId: user.id,
      email: getActiveSellerEmail(),
      phone: getActiveSellerPhone(),
      role: user.role,
      status: user.status,
      adminRole: null,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    })
  }),
  http.get(`${API_URL}/auth/csrf`, () => HttpResponse.json({ token: "mock-csrf-token" })),
  http.post("*/auth/logout", () => {
    setMockAuthenticated(false)
    return new HttpResponse(null, {
      status: 204,
      headers: {
        "Set-Cookie": "access_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      },
    })
  }),
  http.get(`${API_URL}/seller/profile`, () =>
    HttpResponse.json({
      ...entities.users[0],
      email: getActiveSellerEmail(),
      phone: getActiveSellerPhone(),
    }),
  ),
  http.get(`${API_URL}/seller/shipping/settings`, () =>
    HttpResponse.json(sellerShippingSettings),
  ),
  http.patch(`${API_URL}/seller/shipping/settings`, async ({ request }) => {
    sellerShippingSettings = await request.json() as ShippingSettings
    return HttpResponse.json(sellerShippingSettings)
  }),
  http.get(`${API_URL}/seller/store/policies`, () =>
    HttpResponse.json(storePolicies),
  ),
  http.patch(`${API_URL}/seller/store/policies`, async ({ request }) => {
    storePolicies = {
      ...storePolicies,
      ...await request.json() as StorePolicies,
    }
    return HttpResponse.json(storePolicies)
  }),
  http.get(`${API_URL}/account/notifications`, ({ request }) => {
    const url = new URL(request.url)
    const page = Math.max(Number(url.searchParams.get("page") ?? "1"), 1)
    const limit = Math.max(Number(url.searchParams.get("limit") ?? "10"), 1)
    const start = (page - 1) * limit
    return HttpResponse.json({
      data: notifications.slice(start, start + limit),
      meta: {
        page,
        limit,
        total: notifications.length,
        totalPages: Math.ceil(notifications.length / limit),
      },
    })
  }),
  http.patch(`${API_URL}/account/notifications/:id/read`, ({ params }) => {
    const notification = notifications.find((item) => item.id === String(params.id))
    if (!notification) return HttpResponse.json({ message: "Notification not found" }, { status: 404 })
    notification.read = true
    return new HttpResponse(null, { status: 204 })
  }),
  http.post(`${API_URL}/account/notifications/read-all`, () => {
    notifications.forEach((notification) => {
      notification.read = true
    })
    return new HttpResponse(null, { status: 204 })
  }),
  http.delete(`${API_URL}/account/notifications/:id`, ({ params }) => {
    const index = notifications.findIndex((item) => item.id === String(params.id))
    if (index < 0) return HttpResponse.json({ message: "Notification not found" }, { status: 404 })
    notifications.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
