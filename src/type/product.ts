import { PaginationMeta } from "@/service/order";

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

export type productStatus = 'draft' | 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
export type productStatusDto = 'pending' | 'approved' | 'rejected';
export interface ProductVariant {
  name?: string;
  values?: string[];
}

export interface Product {
  id: string;
  name: string;
  nameF?: string;
  brand: string;
  description: string;
  price: number;
  originalPrice: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  sellerId: string;
  sellerName: string;
  storeId?: string;
  storeName?: string;
  categoryId: string;
  categoryName:string;
  image: string;
  images: string[];
  stock: number;
  sku: string;
  tags: string[];
  specs: ProductSpecs;
  variants: ProductVariant[];
  weightGrams?: number;
  dimensions?: string;
  status: productStatus;
  createdAt: string;
  updatedAt?: string;
  moderationReason?: string | null;
}



export interface GetProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}

export interface GetProductsQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  category?: string;
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