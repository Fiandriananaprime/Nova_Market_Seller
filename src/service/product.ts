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

export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get<Product>(`/seller/products/${id}`);
  return response.data;
};

export const updateProductStatus = async (product: Product, status: Extract<productStatus, "active" | "inactive">): Promise<Product> => {
  const response = await api.put<Product>(`/seller/products/${product.id}`, {
    name: product.name,
    price: product.price,
    categoryId: product.categoryId,
    stock: product.stock,
    status,
  });
  return response.data;
};
