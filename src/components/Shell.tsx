import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Warehouse,
  Users,
  Star,
  Store as StoreIcon,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Check,
} from "lucide-react"
import { metrics } from "@/hook/mock"
import { useStore } from "@/context/storeContext"

const navItems = [
  { path: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { path: "/orders", label: "Commandes", icon: ShoppingBag, badge: 14 },
  { path: "/products", label: "Produits", icon: Package },
  { path: "/inventory", label: "Inventaire", icon: Warehouse, badge: 7 },
  { path: "/customers", label: "Clients", icon: Users },
  { path: "/reviews", label: "Avis", icon: Star },
  { path: "/store", label: "Ma boutique", icon: StoreIcon },
  { path: "/analytics", label: "Analytiques", icon: BarChart3 },
  { path: "/settings", label: "Paramètres", icon: Settings },
]

const notifications = [
  {
    icon: ShoppingBag,
    text: "Nouvelle commande ORD-2026-318",
    time: "il y a 12 min",
  },
  {
    icon: AlertTriangle,
    text: "Stock bas: Café Arabica (8 unités)",
    time: "il y a 2h",
  },
  {
    icon: Star,
    text: "Nouvel avis 5★ sur Vanille",
    time: "il y a 3h",
  },
  {
    icon: CheckCircle2,
    text: "Paiement reçu: ORD-2026-315",
    time: "hier",
  },
]

export default function Shell() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [storeOpen, setStoreOpen] = useState(false)

  const {
    stores,
    selectedStore,
    loading: storesLoading,
    selectStore,
  } = useStore()

  const go = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    navigate("/login")
  }

  const handleStoreChange = (storeId: string) => {
    selectStore(storeId)
    setStoreOpen(false)
  }

  return (
    <div className="flex h-full bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>

          <div className="min-w-0">
            <p className="font-display font-700 text-sm truncate">
              Nova Market
            </p>
            <p className="text-xs text-muted-foreground">
              Portail vendeur
            </p>
          </div>

          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Store selector */}
        <div className="relative mx-3 mt-3">
          <button
            type="button"
            disabled={storesLoading || !selectedStore}
            onClick={() => setStoreOpen((open) => !open)}
            className="w-full px-3 py-2.5 rounded-lg bg-muted flex items-center gap-2.5 text-left hover:bg-muted/80 transition-colors disabled:opacity-60"
          >
            {selectedStore?.logoUrl ? (
              <img
                src={selectedStore.logoUrl}
                alt={selectedStore.name}
                className="w-8 h-8 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <StoreIcon size={15} className="text-primary" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-display font-600 text-xs truncate">
                {storesLoading
                  ? "Chargement..."
                  : selectedStore?.name ?? "Aucune boutique"}
              </p>

              {selectedStore && (
                <p
                  className={`text-[10px] ${
                    selectedStore.isOpen
                      ? "text-[var(--success)]"
                      : "text-muted-foreground"
                  }`}
                >
                  ●{" "}
                  {selectedStore.isOpen
                    ? "Boutique ouverte"
                    : "Boutique fermée"}
                </p>
              )}
            </div>

            <ChevronDown
              size={14}
              className={`shrink-0 transition-transform ${
                storeOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {storeOpen && stores.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-[60] overflow-hidden">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-[10px] font-600 text-muted-foreground uppercase tracking-wide">
                  Mes boutiques
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                {stores.map((store) => {
                  const isSelected = selectedStore?.id === store.id

                  return (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => handleStoreChange(store.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? "bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      {store.logoUrl ? (
                        <img
                          src={store.logoUrl}
                          alt={store.name}
                          className="w-8 h-8 rounded-md object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <StoreIcon
                            size={15}
                            className="text-primary"
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-600 truncate">
                          {store.name}
                        </p>

                        <p
                          className={`text-[10px] ${
                            store.isOpen
                              ? "text-[var(--success)]"
                              : "text-muted-foreground"
                          }`}
                        >
                          {store.isOpen ? "Ouverte" : "Fermée"}
                        </p>
                      </div>

                      {isSelected && (
                        <Check
                          size={14}
                          className="text-primary shrink-0"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon, badge }) => (
            <button
              key={path}
              onClick={() => go(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                pathname === path
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={16} />

              <span className="flex-1 text-left">
                {label}
              </span>

              {badge && pathname !== path && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-md"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3">
          <button
            className="lg:hidden p-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>

          <div className="flex-1 max-w-xs hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs">
            <Search size={14} />
            Rechercher...
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex gap-3 px-3 py-1.5 rounded-md bg-muted text-xs text-muted-foreground">
              <span>
                <AlertTriangle
                  size={11}
                  className="inline text-[var(--warning)]"
                />{" "}
                {metrics.pendingOrders} en attente
              </span>

              <span>
                <AlertTriangle
                  size={11}
                  className="inline text-[var(--destructive)]"
                />{" "}
                {metrics.lowStockCount} stocks bas
              </span>
            </div>

            <div className="relative">
              <button
                className="p-2"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={18} />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full w-72 bg-card border border-border rounded-lg shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-border flex justify-between text-sm font-600">
                    Notifications

                    <button
                      className="text-xs text-primary"
                      onClick={() => setNotifOpen(false)}
                    >
                      Tout lire
                    </button>
                  </div>

                  {notifications.map(({ icon: Icon, text, time }) => (
                    <div
                      key={text}
                      className="flex gap-3 px-4 py-3 border-b border-border text-xs"
                    >
                      <Icon size={14} />

                      <div>
                        {text}
                        <p className="text-[10px] text-muted-foreground">
                          {time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                MN
              </div>

              <ChevronDown size={12} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}