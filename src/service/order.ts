import { Order } from "@/type/order"
import { OrderStatus } from "@/type/order"
import { api } from "./axios"

type GetAllQuery = {
  page: number
  limit: number
  status?: OrderStatus
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type OrderCounts = {
  pending: number
  confirmed: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  refunded: number
}

export interface GetAllResponse {
  data: Order[]
  meta: PaginationMeta
  count: OrderCounts
}

export const getAllOrders = async ({
  page,
  limit,
  status,
}: GetAllQuery): Promise<GetAllResponse> => {
  const response = await api.get("/seller/orders", {
    params: {
      page,
      limit,
      status,
    },
  })

  return response.data
}