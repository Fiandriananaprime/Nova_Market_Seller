import type { PaginationMeta } from "@/type/order"

export interface ProductSpecs {
  [key: string]: string;
}
export type RatingCount = {
  all: number;
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
};

export type productStatus = 'active' | 'inactive';
export type productStatusDto = 'draft' | 'pending' | 'approved' | 'rejected';
export type productModerationStatus = productStatusDto;
export type ProductListStatus = productStatus | productModerationStatus;
export interface ProductImage {
  url: string;
  isDefault: boolean;
}
export interface CategoryAttribute {
  key: string
  label: string
  required: boolean
}
export interface Category {
  id: string
  name: string
  count?: number
  parentId?: string | null
  children?: Category[]
}
export interface CategoryDetails extends Category {
  attributes: CategoryAttribute[]
}
export interface ProductImageUploadResponse {
  url: string
}
export interface ProductVariant {
  name?: string;
  values?: string[];
}

export interface Product {
  id: string;
  name: string;
  nameF?: string;
  brand?: string | null;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  sellerId?: string;
  sellerName?: string;
  storeId?: string;
  storeName?: string;
  categoryId: string;
  categoryName:string;
  images?: ProductImage[];
  stock: number;
  sku: string;
  tags?: string[];
  specs?: ProductSpecs;
  variants?: ProductVariant[];
  weightGrams?: number;
  dimensions?: string;
  status: productStatus;
  moderationStatus?: productModerationStatus;
  lowStockThreshold?: number;
  views?: number;
  soldCount?: number;
  wishlistCount?: number;
  createdAt: string;
  updatedAt?: string;
  moderationReason?: string | null;
}



export interface GetProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}

export type ProductInput = Pick<Product, "name" | "categoryId" | "price" | "stock"> &
  Partial<Pick<Product, "sku" | "description" | "status" | "images" | "brand" | "tags" | "specs" | "variants" | "weightGrams" | "dimensions" | "lowStockThreshold">>;

export interface GetSellerProductsResponse {
  data: Product[]
  meta: PaginationMeta
  lowStock: Product[]
  outOfStock: Product[]
}

export interface GetProductsQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: ProductListStatus;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  onSale?: boolean;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export interface topProductsUnits extends Product {
  units:number
  revenue:number
  growth:number
}
