import { api } from "@/service/axios"
import type { DeliveryRecord, SellerDeliveryList } from "@/type/delivery"

export const getDeliveries = async (page = 1, limit = 100): Promise<SellerDeliveryList> => {
  const response = await api.get<SellerDeliveryList>("/seller/deliveries", {
    params: { page, limit },
  })
  return response.data
};

export const getDeliveryById = async (id: string) => {
  const response = await api.get<DeliveryRecord>(`/seller/deliveries/${id}`)
  return response.data
};
