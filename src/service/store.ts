import { api } from "./axios";
import { Store } from "@/type/store";

export const getSellerStores = async (): Promise<Store[]> => {
    const response = await api.get("/seller/stores");
    return response.data;
};