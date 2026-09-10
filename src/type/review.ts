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