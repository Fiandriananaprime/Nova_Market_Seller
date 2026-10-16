import type { SellerNotification } from "@/type/notification"
import type { OrderTrackingStreamEvent } from "@/type/realtime"

type ConnectionState = "connecting" | "connected" | "disconnected"

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
};

const parseJsonMessage = <T>(
  data: unknown,
  isExpectedMessage: (value: unknown) => value is T,
  path: string,
): T | null => {
  try {
    const value: unknown = JSON.parse(String(data))
    if (isExpectedMessage(value)) return value
    console.error(`Unexpected realtime message received from ${path}:`, value)
  } catch (error) {
    console.error(`Invalid realtime message received from ${path}:`, error)
  }
  return null
};

const isSellerNotification = (value: unknown): value is SellerNotification => {
  return isRecord(value)
    && typeof value.id === "string"
    && ["order", "payment", "promotion", "review", "seller", "system", "security"].includes(String(value.type))
    && typeof value.title === "string"
    && typeof value.message === "string"
    && typeof value.read === "boolean"
    && typeof value.createdAt === "string"
};

const isOrderTrackingEvent = (value: unknown): value is OrderTrackingStreamEvent => {
  if (!isRecord(value)
    || !["location_updated", "status_changed", "event_created"].includes(String(value.type))
    || typeof value.orderId !== "string"
    || typeof value.timestamp !== "string") return false

  if (value.location !== undefined && value.location !== null) {
    if (!isRecord(value.location)
      || typeof value.location.latitude !== "number"
      || typeof value.location.longitude !== "number"
      || typeof value.location.timestamp !== "string") return false
  }

  return value.status === undefined
    || value.status === null
    || ["pending", "preparing", "processing", "delivered", "cancelled", "failed"].includes(String(value.status))
};

const createReconnectableSocket = <T>(
  path: string,
  isExpectedMessage: (value: unknown) => value is T,
  onMessage: (message: T) => void,
  onStateChange?: (state: ConnectionState) => void,
): () => void => {
  const apiUrl = import.meta.env.VITE_API_URL ?? window.location.origin
  const apiOrigin = new URL(apiUrl, window.location.origin).origin
  const socketOrigin = apiOrigin.replace(/^http:/, "ws:").replace(/^https:/, "wss:")
  let socket: WebSocket | null = null
  let reconnectTimer: number | undefined
  let reconnectDelay = 1000
  let closed = false

  const connect = () => {
    if (closed) return
    onStateChange?.("connecting")
    socket = new WebSocket(`${socketOrigin}${path}`)

    socket.addEventListener("open", () => {
      reconnectDelay = 1000
      onStateChange?.("connected")
    })
    socket.addEventListener("message", (event) => {
      const message = parseJsonMessage(event.data, isExpectedMessage, path)
      if (message) onMessage(message)
    })
    socket.addEventListener("error", (error) => {
      console.error(`Realtime connection error at ${path}:`, error)
    })
    socket.addEventListener("close", () => {
      if (closed) return
      onStateChange?.("disconnected")
      reconnectTimer = window.setTimeout(connect, reconnectDelay)
      reconnectDelay = Math.min(reconnectDelay * 2, 30_000)
    })
  }

  connect()

  return () => {
    closed = true
    if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer)
    socket?.close()
  }
};

export const subscribeToOrderTracking = (
  orderId: string,
  onMessage: (event: OrderTrackingStreamEvent) => void,
  onStateChange?: (state: ConnectionState) => void,) => {
  return createReconnectableSocket(
    `/ws/orders/${encodeURIComponent(orderId)}/tracking`,
    isOrderTrackingEvent,
    onMessage,
    onStateChange,
  )
};

export const subscribeToSellerNotifications = (
  onMessage: (notification: SellerNotification) => void,
  onStateChange?: (state: ConnectionState) => void,) => {
  return createReconnectableSocket("/ws/notifications", isSellerNotification, onMessage, onStateChange)
};
