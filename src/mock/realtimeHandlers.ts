import { ws } from "msw"

const apiOrigin = new URL(import.meta.env.VITE_API_URL ?? window.location.origin, window.location.origin).origin
const socketOrigin = apiOrigin.replace(/^http:/, "ws:").replace(/^https:/, "wss:")

const notificationStream = ws.link(`${socketOrigin}/ws/notifications`)
const orderTrackingStream = ws.link(`${socketOrigin}/ws/orders/:orderId/tracking`)

export const realtimeHandlers = [
  notificationStream.addEventListener("connection", () => undefined),
  orderTrackingStream.addEventListener("connection", () => undefined),
]
