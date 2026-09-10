import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, ShoppingBag, Eye, Percent } from "lucide-react";
import { revenueSeries, topProducts, categoryBreakdown, metrics, formatMGA } from "../data/mock";
import { PageHeader, KpiCard, Card, CardHeader, CardTitle, CardBody } from "../components/ui";

const PERIOD_OPTIONS = [
  { label: "Aujourd'hui", value: "today" },
  { label: "7 jours", value: "7d" },
  { label: "30 jours", value: "30d" },
  { label: "3 mois", value: "3m" },
  { label: "12 mois", value: "12m" },
];

const PIE_COLORS = ["#0077B6", "#5ABCB9", "#16262E", "#D0CCD0", "#EBE8F0"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-600 text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center justify-between gap-4">
          <span>{p.name === "revenue" ? "Revenus" : p.name === "orders" ? "Commandes" : p.name}</span>
          <span className="font-600">{p.name === "revenue" ? formatMGA(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [period, setPeriod] = useState("12m");

  const slicedData = period === "7d" ? revenueSeries.slice(-2) :
    period === "30d" ? revenueSeries.slice(-3) :
    period === "3m" ? revenueSeries.slice(-3) :
    revenueSeries;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header with period selector */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Analytiques"
          subtitle="Performance de votre boutique"
        />
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${period === p.value ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Revenus totaux" value={formatMGA(metrics.revenue)} change={metrics.revenueChange} icon={<TrendingUp size={16} />} accent />
        <KpiCard label="Commandes" value={metrics.orders.toString()} change={metrics.ordersChange} icon={<ShoppingBag size={16} />} />
        <KpiCard label="Vues boutique" value={metrics.storeViews.toLocaleString()} change={8.3} icon={<Eye size={16} />} />
        <KpiCard label="Conversion" value={`${metrics.conversionRate}%`} change={0.4} icon={<Percent size={16} />} />
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des revenus et commandes</CardTitle>
        </CardHeader>
        <CardBody className="pb-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={slicedData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0077B6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0077B6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="rev"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                width={36}
              />
              <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="rev" type="monotone" dataKey="revenue" name="revenue" stroke="#0077B6" strokeWidth={2} fill="url(#revGrad2)" dot={false} activeDot={{ r: 4, fill: "#0077B6" }} />
              <Bar yAxisId="orders" dataKey="orders" name="orders" fill="#5ABCB9" opacity={0.5} radius={[2, 2, 0, 0]} />
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Top products + Category breakdown */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top products */}
        <Card>
          <CardHeader><CardTitle>Produits les plus vendus</CardTitle></CardHeader>
          <CardBody className="pb-2">
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-700 text-muted-foreground w-5">#{i + 1}</span>
                      <span className="text-xs font-medium text-foreground truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-600 text-foreground">{formatMGA(p.revenue)}</span>
                      <span className={`text-[10px] font-600 ${p.growth >= 0 ? "text-[var(--success)]" : "text-[var(--destructive)]"}`}>
                        {p.growth >= 0 ? "+" : ""}{p.growth}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%`, opacity: 0.5 + (i === 0 ? 0.5 : (4 - i) * 0.1) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Category pie */}
        <Card>
          <CardHeader><CardTitle>Ventes par catégorie</CardTitle></CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="percentage"
                    strokeWidth={2}
                    stroke="var(--card)"
                  >
                    {categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="flex-1 space-y-2">
                {categoryBreakdown.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-muted-foreground">{c.name}</span>
                    </div>
                    <span className="text-xs font-600 text-foreground">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Monthly comparison bar */}
      <Card>
        <CardHeader><CardTitle>Comparaison mensuelle des commandes</CardTitle></CardHeader>
        <CardBody className="pb-2">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueSeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="orders" fill="#0077B6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
}
