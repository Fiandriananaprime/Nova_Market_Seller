import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  KpiCard,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  OrderStatusBadge,
} from "@/components/ui"
import SpotlightCard from "@/components/SpotlightCard"
import { formatMGA } from "@/hook/format"
import { SellerDashboard } from "@/type/dashboard"
import { getDashboardData } from "@/service/dashboard"
import { getAllOrders } from "@/service/order"
import { Order } from "@/type/order"
import { getAllProducts } from "@/service/product"
import type { GetSellerProductsResponse } from "@/type/product"
import { getStoreReviews } from "@/service/review"
import { Review } from "@/type/review"
import { useStore } from "@/context/useStore"

interface TooltipItem {
  name: string
  value: number
  color: string
}

const MONTH_MAP_FR: Record<string, string> = {
  Jan: "Jan",
  Feb: "Fév",
  Mar: "Mar",
  Apr: "Avr",
  May: "Mai",
  Jun: "Juin",
  Jul: "Juil",
  Aug: "Août",
  Sep: "Sep",
  Oct: "Oct",
  Nov: "Nov",
  Dec: "Déc",
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipItem[]
  label?: string
}) => {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            {p.name === "revenue" ? "Chiffre d'affaires" : "Commandes"}
          </span>
          <span className="font-bold text-foreground tabular-nums">
            {typeof p.value !== "number"
              ? "—"
              : p.name === "revenue"
                ? formatMGA(p.value)
                : `${p.value} commandes`}
          </span>
        </div>
      ))}
    </div>
  )
};

const Dashboard = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [data, setData] = useState<SellerDashboard>()
  const [loading, setLoading] = useState(true)
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [productsData, setProductsData] = useState<GetSellerProductsResponse>()
  const [reviews, setReviews] = useState<Review[]>([])
  const [chartPeriod, setChartPeriod] = useState<"7d" | "30d" | "12m">("12m")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const { selectedStore, loading: storeLoading } = useStore()
  const currentStoreId = selectedStore?.id

  useEffect(() => {
    if (storeLoading) return
    let mounted = true

    const fetchData = async () => {
      if (!currentStoreId) {
        setData(undefined)
        setLoadError(null)
        if (mounted) setLoading(false)
        return
      }

      setLoading(true)
      setLoadError(null)
      try {
        const [result, orders, allProducts, storeReviews] = await Promise.all([
          getDashboardData(),
          getAllOrders({
            page: 1,
            limit: 6,
            status: "pending",
          }),
          getAllProducts(1, 10),
          getStoreReviews(currentStoreId, 1, 3),
        ])

        if (mounted) {
          setData(result)
          setPendingOrders(orders.data)
          setProductsData(allProducts)
          setReviews(storeReviews.data)
        }
      } catch (error) {
        console.error("Failed to load seller dashboard:", error)
        if (mounted) {
          setData(undefined)
          setLoadError("Impossible de charger les données du tableau de bord.")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [currentStoreId, storeLoading, reloadKey])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-28 rounded-2xl bg-muted/60 skeleton" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted/60 skeleton" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-muted/60 skeleton" />
      </div>
    )
  }

  if (loadError || !data) {
    return (
      <div className="p-6 md:p-8">
        <div role="alert" className="mx-auto max-w-2xl rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center">
          <p className="font-semibold text-foreground">
            {loadError ?? "Aucune boutique n’est sélectionnée."}
          </p>
          {loadError && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Réessayer
            </Button>
          )}
        </div>
      </div>
    )
  }

  const { metrics, revenueSeries, topProducts } = data
  const lowStockCount = productsData?.lowStock?.length ?? 0
  const unrepliedCount = reviews.filter((r) => !r.replied).length
  const attentionCount = pendingOrders.length + lowStockCount + unrepliedCount

  // Filter chart series based on period
  const filteredSeries =
    chartPeriod === "7d"
      ? revenueSeries.slice(-2)
      : chartPeriod === "30d"
      ? revenueSeries.slice(-4)
      : revenueSeries

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <SpotlightCard
        theme="dark"
        spotlightColor="var(--primary)"
        intensity={0.16}
        spotlightSize={320}
        borderGlow={0.2}
        data-tour="dashboard-overview"
        className="rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-card border border-primary/20 p-6 md:p-8 shadow-xs"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
              <Sparkles size={13} />
              <span>{selectedStore?.name ?? "Nova Market"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                En ligne
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-foreground tracking-tight">
              {t("dashboard.welcome")} {selectedStore?.name ? selectedStore.name : "Partenaire"} 👋
            </h1>

            <p className="text-sm text-muted-foreground max-w-xl font-normal">
              {t("dashboard.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate("/orders")}
              className="bg-card/80 backdrop-blur-xs"
            >
              <ShoppingBag size={15} />
              {t("dashboard.viewOrders")}
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/products")}
            >
              <Plus size={15} />
              {t("dashboard.newProduct")}
            </Button>
          </div>
        </div>
      </SpotlightCard>

      
      <div data-tour="dashboard-kpis" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t("dashboard.revenue")}
          value={formatMGA(metrics.revenue)}
          change={metrics.revenueChangePct}
          icon={<TrendingUp size={18} />}
          accent
          subtitle="Ce mois"
        />

        <KpiCard
          label={t("dashboard.orders")}
          value={metrics.orders.toString()}
          change={metrics.ordersChangePct}
          icon={<ShoppingBag size={18} />}
          subtitle="30 derniers jours"
        />

        <KpiCard
          label={t("dashboard.products")}
          value={metrics.products.toString()}
          change={metrics.productsChangePct}
          icon={<Package size={18} />}
          subtitle="En catalogue"
        />

        <KpiCard
          label={t("dashboard.customers")}
          value={metrics.customer.toString()}
          change={metrics.customerChangePct}
          icon={<Users size={18} />}
          subtitle="Base active"
        />
      </div>

      
      <div
        data-tour="dashboard-urgent-actions"
        className={`bg-card border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
          attentionCount > 0
            ? "border-amber-500/20"
            : "border-emerald-500/20"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              attentionCount > 0
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {attentionCount > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          </div>
          <div>
            <p className="text-xs font-bold text-foreground flex items-center gap-2">
              {attentionCount > 0 ? t("dashboard.urgentActions") : "Tout est en ordre"}
              {attentionCount > 0 && (
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md tabular-nums">
                  {attentionCount}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {attentionCount > 0
                ? "Les priorités de votre boutique, réunies au même endroit."
                : "Aucune action urgente : votre boutique tourne bien."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {pendingOrders.length > 0 && (
            <button
              onClick={() => navigate("/orders")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Clock size={13} />
              <span>{pendingOrders.length} {t("dashboard.pendingOrdersAlert")}</span>
              <ChevronRight size={13} />
            </button>
          )}

          {lowStockCount > 0 && (
            <button
              onClick={() => navigate("/inventory")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Package size={13} />
              <span>{lowStockCount} {t("dashboard.lowStockAlert")}</span>
              <ChevronRight size={13} />
            </button>
          )}

          {unrepliedCount > 0 && (
            <button
              onClick={() => navigate("/reviews")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>{unrepliedCount} {t("dashboard.unrepliedReviews")}</span>
              <ChevronRight size={13} />
            </button>
          )}

          {pendingOrders.length === 0 && lowStockCount === 0 && unrepliedCount === 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 size={13} />
              <span>Tout est sous contrôle</span>
            </div>
          )}
        </div>
      </div>

      
      <div className="grid lg:grid-cols-3 gap-6">
        
        <Card
          data-tour="dashboard-chart"
          spotlight
          className="lg:col-span-2 flex flex-col justify-between"
        >
          <CardHeader>
            <div>
              <CardTitle>{t("dashboard.revenueEvolution")}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Comparatif du flux de revenus et volume de commandes
              </p>
            </div>

            <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
              {(["7d", "30d", "12m"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    chartPeriod === period
                      ? "bg-card text-primary shadow-xs ring-1 ring-border/70"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-pressed={chartPeriod === period}
                >
                  {period === "7d" ? "7J" : period === "30d" ? "30J" : "12M"}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardBody className="pt-2">
            <div className="h-68 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredSeries}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                    opacity={0.5}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => MONTH_MAP_FR[val] || val}
                  />

                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                    width={45}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        
        <Card className="flex flex-col">
          <CardHeader>
            <div>
              <CardTitle>{t("dashboard.topProducts")}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Produits générant le plus de volume
              </p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Voir tout
            </button>
          </CardHeader>

          <CardBody className="p-0 flex-1 divide-y divide-border/60">
            {topProducts.slice(0, 4).map((product, idx) => (
              <div
                key={idx}
                className="p-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    #{idx + 1}
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {product.units} unités écoulées
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-foreground tabular-nums">
                    {formatMGA(product.revenue)}
                  </p>
                  <span
                    className={`text-[10px] font-semibold ${
                      product.growth >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {product.growth > 0 ? `+${product.growth}` : product.growth}%
                  </span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
            <div>
              <CardTitle>{t("dashboard.recentOrders")}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Flux en temps réel de vos commandes récentes
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/orders")}
          >
            Voir toutes les commandes
            <ArrowUpRight size={13} />
          </Button>
        </CardHeader>

        <CardBody className="p-0">
          <div className="divide-y divide-border/60">
            {pendingOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-muted to-muted/50 border border-border flex items-center justify-center font-display font-bold text-xs text-foreground shrink-0">
                    {order.buyerName
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-foreground">
                        {order.id}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {[order.buyerName, `${order.items.length} article(s)`, order.city].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      {formatMGA(order.total)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("fr-MG")}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/orders")}
                    className="hover:border-primary hover:text-primary"
                  >
                    Détails
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
};
export default Dashboard;