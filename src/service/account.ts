import type { User } from "@/type/auth"
import type { SellerNotificationsResponse } from "@/type/notification"
import { api } from "./axios"

export const getSellerProfile = async (): Promise<User> => {
  const response = await api.get<User>("/seller/profile")
  return response.data
}

export const getSellerNotifications = async (
  page = 1,
  limit = 10,
): Promise<SellerNotificationsResponse> => {
  const response = await api.get<SellerNotificationsResponse>("/account/notifications", {
    params: { page, limit },
  })
  return response.data
}

export const markAllSellerNotificationsRead = async (): Promise<void> => {
  await api.post("/account/notifications/read-all")
}

export const markSellerNotificationRead = async (id: string): Promise<void> => {
  await api.patch(`/account/notifications/${id}/read`)
}
