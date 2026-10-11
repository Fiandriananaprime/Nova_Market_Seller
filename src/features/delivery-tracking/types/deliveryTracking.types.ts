export type DeliveryStatus =
  | "awaiting_dispatch"
  | "in_transit"
  | "delivered"
  | "delayed"

export type VehicleType = "motorcycle" | "van" | "truck" | "bicycle"

export interface Coordinates {
  lat: number
  lng: number
}

export interface DriverInfo {
  id: string
  name: string
  phone: string
  vehicleType: VehicleType
  vehiclePlate?: string
  rating: number
  avatarUrl?: string
}

export interface DestinationInfo {
  recipientName: string
  phone: string
  street: string
  district: string
  city: string
  postalCode?: string
  instructions?: string
}

export interface PackageItem {
  id: string
  name: string
  qty: number
  price: number
  image?: string
}

export interface DeliveryTimelineEvent {
  status: DeliveryStatus | "order_created"
  timestamp: string
  label: string
  description?: string
  location?: string
}

export interface DeliveryRecord {
  id: string
  orderId: string
  orderReference: string
  status: DeliveryStatus
  coordinates: Coordinates
  initialCoordinates: Coordinates
  targetCoordinates: Coordinates
  heading?: number
  destination: DestinationInfo
  driver?: DriverInfo
  items: PackageItem[]
  totalAmount: number
  paymentMethod: "mvola" | "orange_money" | "card" | "cod"
  deliveryMethod: "express" | "standard"
  dispatchedAt?: string
  estimatedArrival?: string
  deliveredAt?: string
  lastUpdate: string
  timeline: DeliveryTimelineEvent[]
  isDelayed: boolean
  delayReason?: string
}

export interface DeliveryStats {
  totalActive: number
  awaitingDispatch: number
  inTransit: number
  deliveredToday: number
  delayed: number
}

export interface DeliveryFilterOptions {
  status: "all" | DeliveryStatus
  search: string
  sortBy: "recent" | "eta" | "orderRef"
}
