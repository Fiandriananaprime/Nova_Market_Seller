import type { GetSellerOrdersQuery, GetSellerOrdersResponse, Order } from "@/type/order"
import { api } from "./axios"

export const getAllOrders = async ({
  page,
  limit,
  status,
  search,
}: GetSellerOrdersQuery): Promise<GetSellerOrdersResponse> => {
  const response = await api.get("/seller/orders", {
    params: {
      page,
      limit,
      status,
      search,
    },
  })

  return response.data
}

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await api.get<Order>(`/seller/orders/${encodeURIComponent(id)}`)
  return response.data
}

export const updateOrder = async (id: string, status: Order["status"]): Promise<Order> => {
  const response = await api.patch<Order>(`/seller/orders/${encodeURIComponent(id)}`, { status })
  return response.data
}