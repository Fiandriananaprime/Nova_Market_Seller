import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  ShoppingBag,
  Eye,
  Percent,
  Download,
} from "lucide-react"
import { formatMGA } from "@/hook/format"
import { getSellerAnalytics } from "@/service/analytics"
import type { SellerAnalytics } from "@/type/analytics"
import {
  PageHeader,
  KpiCard,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Toast,
} from "@/components/ui"

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

const PERIOD_OPTIONS = [
  { label: "7 jours", value: "7d" },
  { label: "30 jours", value: "30d" },
  { label: "12 mois", value: "12m" },
]

const DONUT_COLORS = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#06B6D4", "#EC4899"]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name?: string; color?: string; value?: number }>
  label?: string | number
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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
            {p.name === "revenue" ? "Revenus" : "Commandes"}
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

const Analytics = () => {
  const { t } = useTranslation()
  const [period, setPeriod] = useState("12m")
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getSellerAnalytics(period).then((result) => {
      if (active) setAnalytics(result)
    }).catch(() => {
      if (active) setError("Les analyses n’ont pas pu être chargées. Vérifiez votre connexion puis réessayez.")
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [period])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const slicedData = analytics?.revenueSeries ?? []

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Mois,Revenu (Ar),Commandes", ...slicedData.map((d) => `${d.month},${d.revenue},${d.orders}`)].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `rapport_ventes_${period}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast("Rapport de ventes exporté au format CSV")
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <PageHeader
        title={t("nav.analytics")}
        subtitle="Analyses financières, comportementales et indicateurs de croissance"
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <div data-tour="analytics-period-toggle" className="flex items-center gap-1 bg-muted p-1 rounded-xl">
              {PERIOD_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    period === p.value
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={loading || !analytics || Boolean(error)}
              className="gap-1.5"
            >
              <Download size={13} />
              <span>Exporter CSV</span>
            </Button>
          </div>
        }
      />
      {error && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">{error}</div>}
      {loading && <div role="status" aria-live="polite" className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Chargement des analyses…</div>}

      
      {!loading && !error && analytics && <><div data-tour="analytics-kpis" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Chiffre d'affaires"
          value={formatMGA(analytics.metrics.revenue)}
          change={analytics.metrics.revenueChange}
          icon={<TrendingUp size={18} />}
          accent
          subtitle="Cumul période"
        />

        <KpiCard
          label="Commandes validées"
          value={analytics.metrics.orders.toString()}
          change={analytics.metrics.ordersChange}
          icon={<ShoppingBag size={18} />}
          subtitle="Volume traité"
        />

        <KpiCard
          label="Visites boutique"
          value={analytics.metrics.storeViews.toLocaleString()}
          change={analytics.metrics.storeViewsChange}
          icon={<Eye size={18} />}
          subtitle="Trafic entrant"
        />

        <KpiCard
          label="Taux de conversion"
          value={`${analytics.metrics.conversionRate}%`}
          change={analytics.metrics.conversionRateChange}
          icon={<Percent size={18} />}
          subtitle="Visites → Achats"
        />
      </div>

      
      <div data-tour="analytics-charts" className="grid lg:grid-cols-3 gap-6">
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Trajectoire des Ventes et Volume</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chiffre d'affaires en Ariary et nombre de commandes mensuelles
              </p>
            </div>
          </CardHeader>

          <CardBody className="pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={slicedData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
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
                    tickFormatter={(v) => MONTH_MAP_FR[v] || v}
                  />

                  <YAxis
                    yAxisId="rev"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                    width={45}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    yAxisId="rev"
                    type="monotone"
                    dataKey="revenue"
                    name="revenue"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#analyticsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        
        <Card className="flex flex-col">
          <CardHeader>
            <div>
              <CardTitle>Part de Marché par Catégorie</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ventilation de vos ventes par segment
              </p>
            </div>
          </CardHeader>

          <CardBody className="flex-1 flex flex-col justify-between">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    dataKey="percentage"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {analytics.categoryBreakdown.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            
            <div className="space-y-2 pt-2 border-t border-border/60">
              {analytics.categoryBreakdown.map((cat, idx) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                    />
                    <span className="text-foreground font-medium">{cat.name}</span>
                  </div>
                  <span className="font-bold text-foreground tabular-nums">
                    {cat.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
      </>}

      
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
};
export default Analytics;
