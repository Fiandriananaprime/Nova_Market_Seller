import { api } from "./axios";
import type { Review, StoreReviewsResponse } from "@/type/review";

export const getStoreReviews = async (storeId: string, page: number, limit: number,rating?: number,replied?: boolean) : Promise<StoreReviewsResponse> => {
    const response = await api.get("/seller/reviews", {
        params: {
            page,
            limit,
            storeId,
            rating,
            replied
        }
    });
    return response.data;
}

export const replyToReview = async (reviewId: string, reply: string): Promise<Review> => {
    const response = await api.post<Review>(`/seller/reviews/${encodeURIComponent(reviewId)}/reply`, { reply });
    return response.data;
}