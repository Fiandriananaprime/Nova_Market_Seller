import { api } from "./axios"
import type { SellerAnalytics } from "@/type/analytics"

export const getSellerAnalytics = async (period: string): Promise<SellerAnalytics> => {
  const response = await api.get<SellerAnalytics>("/seller/analytics", {
    params: { period },
  })
  return response.data
}
