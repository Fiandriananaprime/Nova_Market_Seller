import { useState } from "react";
import {
  LayoutDashboard, ShoppingBag, Package, Warehouse, Users, Star,
  Store, BarChart3, Settings, Bell, Search, Menu, X, LogOut,
  ChevronDown, TrendingUp, AlertTriangle, CheckCircle2
} from "lucide-react";
import { storeInfo, metrics } from "../data/mock";

export type Page =
  | "dashboard" | "orders" | "products" | "inventory"
  | "customers" | "reviews" | "store" | "analytics" | "settings";

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "orders", label: "Commandes", icon: ShoppingBag, badge: 14 },
  { id: "products", label: "Produits", icon: Package },
  { id: "inventory", label: "Inventaire", icon: Warehouse, badge: 7 },
  { id: "customers", label: "Clients", icon: Users },
  { id: "reviews", label: "Avis", icon: Star },
  { id: "store", label: "Ma boutique", icon: Store },
  { id: "analytics", label: "Analytiques", icon: BarChart3 },
  { id: "settings", label: "Paramètres", icon: Settings },
];

interface ShellProps {
  page: Page;
  onNavigate: (p: Page) => void;
  children: React.ReactNode;
}

export default function Shell({ page, onNavigate, children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex h-full bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-700 text-sm text-foreground leading-tight truncate">Nova Market</p>
            <p className="text-xs text-muted-foreground">Portail vendeur</p>
          </div>
          <button
            className="ml-auto lg:hidden p-1 rounded-md hover:bg-muted text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Store info */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-lg bg-muted">
          <div className="flex items-center gap-2.5">
            <img
              src={storeInfo.logoUrl}
              alt={storeInfo.name}
              className="w-8 h-8 rounded-md object-cover bg-secondary flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="font-display font-600 text-xs text-foreground truncate">{storeInfo.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] inline-block" />
                <span className="text-[10px] text-muted-foreground">Boutique ouverte</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = page === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && !active && (
                  <span className="text-[10px] font-600 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-border">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm">
            <Search size={14} />
            <span className="text-xs">Rechercher...</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Quick stats pill */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-md bg-muted text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <AlertTriangle size={11} className="text-[var(--warning)]" />
                <span>{metrics.pendingOrders} en attente</span>
              </span>
              <span className="w-px h-3 bg-border" />
              <span className="flex items-center gap-1">
                <AlertTriangle size={11} className="text-[var(--destructive)]" />
                <span>{metrics.lowStockCount} stocks bas</span>
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                className="relative p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-72 bg-card border border-border rounded-lg shadow-lg z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="font-display font-600 text-sm">Notifications</span>
                    <button className="text-xs text-primary hover:underline" onClick={() => setNotifOpen(false)}>Tout lire</button>
                  </div>
                  {[
                    { icon: ShoppingBag, text: "Nouvelle commande ORD-2026-318", time: "il y a 12 min", color: "text-primary" },
                    { icon: AlertTriangle, text: "Stock bas: Café Arabica (8 unités)", time: "il y a 2h", color: "text-[var(--warning)]" },
                    { icon: Star, text: "Nouvel avis 5★ sur Vanille", time: "il y a 3h", color: "text-[var(--accent)]" },
                    { icon: CheckCircle2, text: "Paiement reçu: ORD-2026-315", time: "hier", color: "text-[var(--success)]" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-0">
                      <n.icon size={14} className={`mt-0.5 flex-shrink-0 ${n.color}`} />
                      <div>
                        <p className="text-xs text-foreground">{n.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-600">
                MN
              </div>
              <ChevronDown size={12} className="text-muted-foreground hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
