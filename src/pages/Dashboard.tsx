import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, ShoppingBag, Package, Users, Plus, ArrowRight, AlertTriangle, Clock, Star } from "lucide-react"

import { KpiCard, Badge, OrderStatusBadge, Stars, Card, CardHeader, CardTitle, CardBody, Button } from "../components/ui"
import { formatMGA } from "@/hook/format"
import { useTranslation } from "react-i18next"
import { SellerDashboard } from "@/type/dashboard"
import { getDashboardData } from "@/service/dashboard"
import { getAllOrders } from "@/service/order"
import { Order } from "@/type/order"
import { getAllProducts, getAllProductsResponse } from "@/service/product"
import { getStoreReviews } from "@/service/review";
import { Review } from "@/type/review"
import { useStore } from "@/context/storeContext"

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-600 text-foreground mb-1">{label}</p>

      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === "revenue"
            ? formatMGA(p.value)
            : `${p.value} commandes`}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [data, setData] = useState<SellerDashboard>();
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [ productsData, setProductsData] = useState<getAllProductsResponse>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const { selectedStore } = useStore();
  const currentStoreId = selectedStore.id;
  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      const [result, orders, allProducts, storeReviews] = await Promise.all([
        getDashboardData(),
        getAllOrders({
          page: 1,
          limit: 5,
          status: "pending",
        }),
        getAllProducts(1,10),
        getStoreReviews(currentStoreId, 1, 3)
      ]);

      setData(result);
      setPendingOrders(orders.data);
      setProductsData(allProducts);
      setReviews(storeReviews.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  if (loading) {
    return <div>Loading...</div>;
  }
  if(!data || !pendingOrders) {
    return (
    <div>
      <p>Enable to fetch</p>
    </div>
    )
  }

  const { metrics, revenueSeries, recentOrders, topProducts } = data;


  const lowStockProducts = productsData?.lowStock || [];

  const outOfStock = productsData?.outOfStock || [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-700 text-xl text-foreground">
            {t("Dashboard")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("Welcome back")}
          </p>
        </div>

        <Button variant="primary" onClick={() => navigate("/products")}>
          <Plus size={14} />
          {t("New Product")}
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t("Revenus (mois)")}
          value={formatMGA(metrics.revenue)}
          change={metrics.revenueChangePct}
          icon={<TrendingUp size={16} />}
          accent
        />

        <KpiCard
          label={t("Commandes")}
          value={metrics.orders.toString()}
          change={metrics.ordersChangePct}
          icon={<ShoppingBag size={16} />}
        />

        <KpiCard
          label={t("Produits actifs")}
          value={metrics.products.toString()}
          change={metrics.productsChangePct}
          icon={<Package size={16} />}
        />

         <KpiCard
          label={t("Customer")}
          value={metrics.customer.toString()}
          change={metrics.customerChangePct}
          icon={<ShoppingBag size={16} />}
        />
      </div>
      

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("Revenue Growth")}</CardTitle>
          </CardHeader>

          <CardBody className="pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={revenueSeries}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0077B6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0077B6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                  width={36}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="revenue"
                  stroke="#0077B6"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#0077B6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Orders / Month")}</CardTitle>
          </CardHeader>

          <CardBody className="pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={revenueSeries.slice(-6)}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="orders"
                  name="orders"
                  fill="#5ABCB9"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Operations */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pending orders */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Pending Order")}</CardTitle>
            <Badge variant="warning">{pendingOrders.length}</Badge>
          </CardHeader>

          <div className="divide-y divide-border">
            {pendingOrders.slice(0, 4).map((o) => (
              <div
                key={o.id}
                className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-600 text-foreground truncate">
                    {o.id}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {o.buyerName}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-600 text-foreground">
                    {formatMGA(o.total)}
                  </span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-border">
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer"
            >
              Voir toutes les commandes <ArrowRight size={12} />
            </button>
          </div>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader>
            <CardTitle>Stocks à surveiller</CardTitle>
            <Badge variant="danger">
              {lowStockProducts.length + outOfStock.length}
            </Badge>
          </CardHeader>

          <div className="divide-y divide-border">
            {[...outOfStock, ...lowStockProducts].slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="px-5 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-7 h-7 rounded object-cover bg-muted flex-shrink-0"
                  />
                  <p className="text-xs text-foreground truncate">{p.name}</p>
                </div>

                {p.stock === 0 ? (
                  <Badge variant="danger">Épuisé</Badge>
                ) : (
                  <Badge variant="warning">{p.stock} unités</Badge>
                )}
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-border">
            <button
              onClick={() => navigate("/inventory")}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer"
            >
              Gérer l'inventaire <ArrowRight size={12} />
            </button>
          </div>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle>Meilleurs produits</CardTitle>
          </CardHeader>

          <div className="divide-y divide-border">
            {topProducts.slice(0, 4).map((p, i) => (
              <div
                key={p.name}
                className="px-5 py-3 flex items-center gap-3"
              >
                <span className="text-xs font-700 text-muted-foreground w-4">
                  #{i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.units} vendus
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-600 text-foreground">
                    {formatMGA(p.revenue)}
                  </p>
                  <p
                    className={`text-[10px] font-600 ${
                      p.growth >= 0
                        ? "text-[var(--success)]"
                        : "text-[var(--destructive)]"
                    }`}
                  >
                    {p.growth >= 0 ? "+" : ""}
                    {p.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-border">
            <button
              onClick={() => navigate("/analytics")}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer"
            >
              Voir l'analytique <ArrowRight size={12} />
            </button>
          </div>
        </Card>
      </div>

      {/* Recent orders + reviews */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
            <button
              onClick={() => navigate("/orders")}
              className="text-xs text-primary font-medium hover:underline cursor-pointer"
            >
              Voir tout
            </button>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">
                    Commande
                  </th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">
                    Client
                  </th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium hidden sm:table-cell">
                    Total
                  </th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">
                    Statut
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-600 text-foreground">
                      {o.id}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {o.buyerName}
                    </td>
                    <td className="px-3 py-3 font-600 text-foreground hidden sm:table-cell">
                      {formatMGA(o.total)}
                    </td>
                    <td className="px-3 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avis récents</CardTitle>
            <button
              onClick={() => navigate("/reviews")}
              className="text-xs text-primary font-medium hover:underline cursor-pointer"
            >
              Voir tout
            </button>
          </CardHeader>

          <div className="divide-y divide-border">
            {reviews.map((r) => (
              <div key={r.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-700">
                      {r.customerName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {r.customerName}
                    </span>
                  </div>

                  <Stars rating={r.rating} />
                </div>

                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  {r.comment}
                </p>

                {!r.replied && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-600 text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                    <Clock size={9} /> Sans réponse
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}