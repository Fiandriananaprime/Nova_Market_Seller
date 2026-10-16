import type { Customer, CustomerListResponse, CustomerSegment } from "@/type/customer"
import { api } from "./axios"

export const getCustomers = async (
  page = 1,
  limit = 8,
  search?: string,
  segment?: CustomerSegment,
): Promise<CustomerListResponse> => {
  const response = await api.get<CustomerListResponse>("/seller/customers", {
    params: { page, limit, search, segment },
  })
  return response.data
}

export const getCustomerById = async (id: string): Promise<Customer> => {
  const response = await api.get<Customer>(`/seller/customers/${encodeURIComponent(id)}`)
  return response.data
}
