export interface TrackingPoint {
  id?: string
  latitude: number
  longitude: number
  timestamp: string
  accuracy?: number | null
  speed?: number | null
  heading?: number | null
}

export interface OrderTrackingStreamEvent {
  type: "location_updated" | "status_changed" | "event_created"
  orderId: string
  status?: "pending" | "preparing" | "processing" | "delivered" | "cancelled" | "failed" | null
  location?: TrackingPoint | null
  event?: {
    id: string
    orderId: string
    type: string
    message?: string | null
    createdAt: string
  } | null
  timestamp: string
}
