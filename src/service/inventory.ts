import { api } from "./axios"
import type { InventoryAdjustment, InventoryResponse } from "@/type/inventory"

export const getInventory = async (storeId?: string): Promise<InventoryResponse> => {
  const response = await api.get<InventoryResponse>("/seller/inventory", {
    params: { storeId },
  })
  return response.data
}

export const updateInventory = async (
  productId: string,
  adjustment: InventoryAdjustment,
): Promise<void> => {
  await api.patch("/seller/inventory", { productId, ...adjustment })
}
