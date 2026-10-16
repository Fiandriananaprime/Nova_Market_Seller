import type { Category, CategoryDetails, Product, ProductImageUploadResponse, ProductInput, GetSellerProductsResponse, ProductListStatus, productStatus } from "@/type/product";
import { api } from "./axios";

export const getAllProducts = async (
  page: number,
  limit: number,
  storeId?: string,
  status?: ProductListStatus,
  search?: string,
  categoryId?: string,
): Promise<GetSellerProductsResponse> => {
  const response = await api.get("/seller/products", {
    params: {
        page,
        limit,
        storeId,
        status,
        search,
        categoryId,
    },
  });
  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>("/categories")
  return response.data
}

export const getCategoryById = async (id: string): Promise<CategoryDetails> => {
  const response = await api.get<CategoryDetails>(`/categories/${encodeURIComponent(id)}`)
  return response.data
}

export const uploadProductImage = async (file: File): Promise<ProductImageUploadResponse> => {
  const formData = new FormData()
  formData.append("file", file)
  const response = await api.post<ProductImageUploadResponse>("/seller/products/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get<Product>(`/seller/products/${encodeURIComponent(id)}`);
  return response.data;
};

export const createProduct = async (product: ProductInput): Promise<Product> => {
  const response = await api.post<Product>("/seller/products", product);
  return response.data
};

export const updateProduct = async (id: string, product: ProductInput): Promise<Product> => {
  const response = await api.put<Product>(`/seller/products/${encodeURIComponent(id)}`, product);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/seller/products/${encodeURIComponent(id)}`);
};

export const submitProductForReview = async (id: string): Promise<Product> => {
  const response = await api.post<Product>(`/seller/products/${encodeURIComponent(id)}/submit-review`)
  return response.data
}

export const updateProductStatus = async (product: Product, status: Extract<productStatus, "active" | "inactive">): Promise<Product> => {
  return updateProduct(product.id, {
    name: product.name,
    categoryId: product.categoryId,
    price: product.price,
    stock: product.stock,
    sku: product.sku,
    description: product.description,
    status,
    images: product.images,
    brand: product.brand,
    tags: product.tags,
    specs: product.specs,
    variants: product.variants,
    weightGrams: product.weightGrams,
    dimensions: product.dimensions,
    lowStockThreshold: product.lowStockThreshold,
  })
};
