import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import {
  TrendingUp, ShoppingBag, Package, Users, Plus, ArrowRight,
  AlertTriangle, Clock, Star, Eye
} from "lucide-react";
import {
  metrics, orders, products, revenueSeries, topProducts, reviews, formatMGA, formatFullMGA
} from "../data/mock";
import {
  KpiCard, Badge, OrderStatusBadge, Stars, Card, CardHeader, CardTitle, CardBody, Button
} from "../components/ui";

const periodOptions = ["7 jours", "30 jours", "3 mois", "12 mois"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-600 text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === "revenue" ? formatMGA(p.value) : `${p.value} commandes`}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard({ onNavigate }: { onNavigate: (p: any) => void }) {
  const [period, setPeriod] = useState("12 mois");

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed");
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 10);
  const outOfStock = products.filter((p) => p.stock === 0 && p.status === "active");

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-700 text-xl text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Bonjour, Madagascar Nature Boutique</p>
        </div>
        <Button variant="primary" onClick={() => onNavigate("products")}>
          <Plus size={14} />
          Nouveau produit
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Revenus (mois)"
          value={formatMGA(metrics.revenue)}
          change={metrics.revenueChange}
          icon={<TrendingUp size={16} />}
          accent
        />
        <KpiCard
          label="Commandes"
          value={metrics.orders.toString()}
          change={metrics.ordersChange}
          icon={<ShoppingBag size={16} />}
        />
        <KpiCard
          label="Produits actifs"
          value={metrics.products.toString()}
          change={metrics.productsChange}
          icon={<Package size={16} />}
        />
        <KpiCard
          label="Clients"
          value={metrics.customers.toString()}
          change={metrics.customersChange}
          icon={<Users size={16} />}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Panier moyen", value: formatMGA(metrics.avgOrderValue), sub: "par commande" },
          { label: "Taux de conversion", value: `${metrics.conversionRate}%`, sub: "visiteurs → achat" },
          { label: "Vues boutique", value: metrics.storeViews.toLocaleString(), sub: "ce mois" },
        ].map((m) => (
          <div key={m.label} className="bg-card rounded-xl border border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="font-display font-700 text-lg text-foreground mt-1">{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
            <div className="flex gap-1">
              {periodOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${p === period ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardBody className="pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueSeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0077B6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0077B6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#0077B6" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#0077B6" }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Orders bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes / mois</CardTitle>
          </CardHeader>
          <CardBody className="pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueSeries.slice(-6)} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="orders" fill="#5ABCB9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Operations + Performance */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pending orders */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes en attente</CardTitle>
            <Badge variant="warning">{pendingOrders.length}</Badge>
          </CardHeader>
          <div className="divide-y divide-border">
            {pendingOrders.slice(0, 4).map((o) => (
              <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-600 text-foreground truncate">{o.id}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{o.buyerName}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-600 text-foreground">{formatMGA(o.total)}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-border">
            <button
              onClick={() => onNavigate("orders")}
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
            <Badge variant="danger">{lowStockProducts.length + outOfStock.length}</Badge>
          </CardHeader>
          <div className="divide-y divide-border">
            {[...outOfStock, ...lowStockProducts].slice(0, 4).map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={p.image} alt={p.name} className="w-7 h-7 rounded object-cover bg-muted flex-shrink-0" />
                  <p className="text-xs text-foreground truncate">{p.name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.stock === 0 ? (
                    <Badge variant="danger">Épuisé</Badge>
                  ) : (
                    <Badge variant="warning">{p.stock} unités</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-border">
            <button
              onClick={() => onNavigate("inventory")}
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
              <div key={p.name} className="px-5 py-3 flex items-center gap-3">
                <span className="text-xs font-700 text-muted-foreground w-4 flex-shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.units} vendus</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-600 text-foreground">{formatMGA(p.revenue)}</p>
                  <p className={`text-[10px] font-600 ${p.growth >= 0 ? "text-[var(--success)]" : "text-[var(--destructive)]"}`}>
                    {p.growth >= 0 ? "+" : ""}{p.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-border">
            <button
              onClick={() => onNavigate("analytics")}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer"
            >
              Voir l'analytique <ArrowRight size={12} />
            </button>
          </div>
        </Card>
      </div>

      {/* Recent orders table + recent reviews */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
            <button onClick={() => onNavigate("orders")} className="text-xs text-primary font-medium hover:underline cursor-pointer">Voir tout</button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium">Commande</th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">Client</th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium hidden sm:table-cell">Total</th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-600 text-foreground">{o.id}</td>
                    <td className="px-3 py-3 text-muted-foreground">{o.buyerName}</td>
                    <td className="px-3 py-3 font-600 text-foreground hidden sm:table-cell">{formatMGA(o.total)}</td>
                    <td className="px-3 py-3"><OrderStatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Avis récents</CardTitle>
            <button onClick={() => onNavigate("reviews")} className="text-xs text-primary font-medium hover:underline cursor-pointer">Voir tout</button>
          </CardHeader>
          <div className="divide-y divide-border">
            {reviews.slice(0, 4).map((r) => (
              <div key={r.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-700 flex-shrink-0">
                      {r.customerInitials}
                    </div>
                    <span className="text-xs font-medium text-foreground">{r.customerName}</span>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{r.comment}</p>
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
  );
}
