import type { DeliveryRecord, DeliveryStats } from "./delivery"

export type { DeliveryRecord, DeliveryStats }

export interface SellerProfile {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
}

export interface SellerBusiness {
  id?: string
  name?: string
  slug?: string
  description?: string | null
  location?: string | null
  logoUrl?: string | null
  coverUrl?: string | null
  verified?: boolean
  rating?: number
  reviewsCount?: number
  productsCount?: number
  followersCount?: number
  isOpen?: boolean
  contact?: {
    phone?: string | null
    email?: string | null
    website?: string | null
  }
}

export interface StorePolicies {
  returnPolicy?: string
  refundPolicy?: string
  cancellationPolicy?: string
  privacyPolicy?: string
}

export interface SellerSettings {
  theme?: "light" | "dark" | string
  lang?: string
  notifications?: SellerNotificationPreferences
  [key: string]: unknown
}

export interface SellerNotificationPreferences {
  newOrder?: boolean
  orderCancelled?: boolean
  lowStock?: boolean
  productApproved?: boolean
  productRejected?: boolean
  newReview?: boolean
  payout?: boolean
  sellerAnnouncements?: boolean
  email?: boolean
  push?: boolean
  sms?: boolean
}

export interface PayoutMethod {
  id: string
  type: "mvola" | "orange_money" | "bank_account"
  label?: string | null
  accountName: string
  maskedAccount: string
  isDefault: boolean
  verified: boolean
}

export interface PayoutMethodInput {
  type: PayoutMethod["type"]
  accountName: string
  account: string
  isDefault?: boolean
}

export interface ShippingSettings {
  zone1: number
  zone2: number
  zone3: number
  freeShippingThreshold: number
  handlingTimeHours: number
  returnWindowDays: number
  returnShippingPayer: "seller_if_defective" | "always_seller" | "always_buyer"
}

export interface Subscription {
  plan?: string
  status?: string
  currentPeriodEnd?: string | null
  renewalDate?: string | null
  [key: string]: unknown
}

export interface SubscriptionPlan {
  id: string
  name?: string
  price?: number
  [key: string]: unknown
}

export interface SubscriptionPlanRequest {
  plan: string
}

export interface SubscriptionCheckoutResponse {
  checkoutUrl?: string
}

export interface SellerAiChatRequest {
  message: string
}

export interface SellerAiChatResponse {
  message?: string
  content?: string
}

export interface SellerWebhookTestResponse {
  status?: string
  message?: string
}

export interface Automation {
  id: string
  name: string
  description?: string
  trigger?: string
  action?: string
  enabled?: boolean
  status?: string
  [key: string]: unknown
}

export interface TeamMember {
  id: string
  name?: string
  email: string
  role: string
  status?: string
}

export interface TeamMemberInviteRequest {
  email: string
  role: string
}

export interface ApiKey {
  id?: string
  publicKey?: string
  secretKey?: string
  createdAt?: string
  [key: string]: unknown
}

export interface SellerWebhook {
  id: string
  url: string
  events?: string[]
  active?: boolean
  enabled?: boolean
  lastTrigger?: string | null
}

export interface SellerIntegrations {
  [key: string]: boolean | string | null | undefined
}

export interface SellerPromotion {
  id: string
  name: string
  code?: string | null
  type: "percentage" | "fixed"
  discount: number
  status: "active" | "scheduled" | "inactive" | "expired"
  startDate: string
  endDate: string
  minimumOrderAmount?: number | null
  usedCount?: number
}

export interface SellerPromotionInput {
  name: string
  type: "percentage" | "fixed"
  discount: number
  startDate: string
  endDate: string
}
