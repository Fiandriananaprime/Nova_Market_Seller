

export type TourId =
  | "onboarding"
  | "orders"
  | "products"
  | "inventory"
  | "analytics"
  | "deliveries"
  | "customers"
  | "reviews"
  | "store"
  | "settings"

export interface TourStepDefinition {
  element: string
  titleKey: string
  descriptionKey: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  icon?: string                                      
  badgeKey?: string
}

export interface TourDefinition {
  id: TourId
  route: string
  titleKey: string
  descriptionKey: string
  steps: TourStepDefinition[]
}
