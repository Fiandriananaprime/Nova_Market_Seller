import { SellerDashboard } from "@/type/dashboard"
import { api } from "./axios"

export const getDashboardData = async ():Promise<SellerDashboard> => {
    const response = await api.get("/seller/dashboard")
    return response.data
}