import { SellerDashboard } from "@/type/dashboard";

import { orders } from "./order/order";
import { topProducts } from "./product/product";

export const sellerDashboard:SellerDashboard  = {
  metrics: {
    customer: 354,
    revenue: 8450000,
    orders: 184,
    products: 47,
    lowStock: 6,
    customerChangePct: 13.5,
    revenueChangePct: 12.8,
    ordersChangePct: 8.4,
    productsChangePct: 4.2,
    lowStockChangePct: -14.3,
  },

  revenueSeries: [
    {
      month: "Jan",
      revenue: 5200000,
      orders: 96,
    },
    {
      month: "Feb",
      revenue: 6100000,
      orders: 108,
    },
    {
      month: "Mar",
      revenue: 5700000,
      orders: 102,
    },
    {
      month: "Apr",
      revenue: 6900000,
      orders: 121,
    },
    {
      month: "May",
      revenue: 7350000,
      orders: 143,
    },
    {
      month: "Jun",
      revenue: 8100000,
      orders: 167,
    },
    {
      month: "Jul",
      revenue: 8450000,
      orders: 184,
    },
  ],

  recentOrders: [
    orders[0],
    orders[1],
    orders[2],
    orders[3],
    orders[5],
  ],

  topProducts: topProducts
};