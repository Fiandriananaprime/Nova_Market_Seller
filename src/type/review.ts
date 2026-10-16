import type { PaginationMeta } from "@/type/order"

export interface Review {
  id: string;
  storeId: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  replied: boolean;
  reply: string | null;
  replyDate: string;
  status: "published" | "pending" | "hidden";
}

export interface StoreReviewsResponse {
  data: Review[]
  meta: PaginationMeta
  averageRating: number
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>
}