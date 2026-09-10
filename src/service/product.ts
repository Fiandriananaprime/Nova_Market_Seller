import { Product, productStatus } from "@/type/product";
import { api } from "./axios";
import { PaginationMeta } from "./order";

export type getAllProductsResponse = {
    data: Product[],
    meta: PaginationMeta,
    lowStock: Product[],
    outOfStock: Product[]
};

export const getAllProducts = async (page: number, limit: number, storeId?: string, status?: productStatus): Promise<getAllProductsResponse> => {
  const response = await api.get("/seller/products", {
    params: {
        page,
        limit,
        storeId,
        status
    },
    
  });
  return response.data;
};