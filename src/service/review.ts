import { api } from "./axios";
import { PaginationMeta } from "./order";
import { Review } from "@/type/review";

type getStoreReviewsResponse = {
  data: Review[];
  meta: PaginationMeta;
  averageRating: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
};
}

export const getStoreReviews = async (storeId: string, page: number, limit: number,rating?: number,replied?: boolean) : Promise<getStoreReviewsResponse> => {
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