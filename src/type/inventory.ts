import type { PaginationMeta } from "@/type/order"

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock"

export interface InventoryItem {
  productId: string
  name: string
  sku: string
  category: string
  stock: number
  reserved: number
  available: number
  threshold: number
  status: InventoryStatus
}

export interface InventoryAdjustment {
  stock: number
  threshold: number
}

export interface InventoryResponse {
  data: InventoryItem[]
  meta: PaginationMeta
}
