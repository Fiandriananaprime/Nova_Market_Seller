import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
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
  Globe,
  Zap,
  Bot
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { metrics } from "@/hook/mock"
import { useStore } from "@/context/storeContext"
import { TutorialProvider } from "@/features/tutorials/context/TutorialContext"
import { tutorialService } from "@/features/tutorials/services/tutorialService"

const navItems = [
  { path: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { path: "/orders", labelKey: "nav.orders", icon: ShoppingBag, badge: 14, badgeVariant: "warning" as const },
  { path: "/deliveries", labelKey: "nav.deliveries", icon: Truck, badge: 4, badgeVariant: "primary" as const },
  { path: "/products", labelKey: "nav.products", icon: Package },
  { path: "/inventory", labelKey: "nav.inventory", icon: Warehouse, badge: 2, badgeVariant: "danger" as const },
  { path: "/customers", labelKey: "nav.customers", icon: Users },
  { path: "/reviews", labelKey: "nav.reviews", icon: Star, badge: 1, badgeVariant: "primary" as const },
  { path: "/store", labelKey: "nav.store", icon: StoreIcon },
  { path: "/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { path: "/ai-automation", labelKey: "nav.aiAutomation", icon: Bot },
  { path: "/settings", labelKey: "nav.settings", icon: Settings }
]

const notifications = [
  {
    icon: ShoppingBag,
    text: "Nouvelle commande ORD-2026-318 (Café Arabica)",
    time: "il y a 12 min",
    type: "order",
  },
  {
    icon: AlertTriangle,
    text: "Stock critique: Vanille Bourbon (3 unités)",
    time: "il y a 45 min",
    type: "alert",
  },
  {
    icon: Star,
    text: "Nouvel avis 5★ sur Poivre Sauvage",
    time: "il y a 2h",
    type: "review",
  },
  {
    icon: CheckCircle2,
    text: "Paiement Mvola reçu pour ORD-2026-315",
    time: "il y a 3h",
    type: "payment",
  },
]

export default function Shell() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [storeOpen, setStoreOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
    tutorialService.resetSessionOnLogout()
    localStorage.removeItem("accessToken")
    navigate("/login")
  }

  const handleStoreChange = (storeId: string) => {
    selectStore(storeId)
    setStoreOpen(false)
  }

  const toggleLanguage = () => {
    const nextLang = i18n.language === "fr" ? "en" : "fr"
    i18n.changeLanguage(nextLang)
  }

  return (
    <TutorialProvider>
      <div className="flex h-full bg-background overflow-hidden text-foreground">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/80 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand identity */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shadow-sm shadow-primary/25">
            <TrendingUp size={18} className="text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base tracking-tight text-foreground">
                Nova Market
              </span>
              <span className="px-1.5 py-0.2 bg-primary/10 text-primary text-[10px] font-semibold rounded-md">
                PRO
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Espace Marchand
            </p>
          </div>

          <button
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Store Selector Dropdown */}
        <div className="relative mx-3.5 mt-3.5">
          <button
            type="button"
            data-tour="store-switcher"
            disabled={storesLoading || !selectedStore}
            onClick={() => setStoreOpen((open) => !open)}
            className="w-full p-2.5 rounded-xl bg-muted/60 hover:bg-muted border border-border/60 flex items-center gap-3 text-left transition-all cursor-pointer disabled:opacity-60"
          >
            {selectedStore?.logoUrl ? (
              <img
                src={selectedStore.logoUrl}
                alt={selectedStore.name}
                className="w-9 h-9 rounded-lg object-cover border border-border shrink-0 bg-background"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                <StoreIcon size={16} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold text-xs text-foreground truncate">
                {storesLoading
                  ? t("common.loading")
                  : selectedStore?.name ?? "Boutique principale"}
              </p>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedStore?.isOpen ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                  }`}
                />
                <span className="text-[11px] text-muted-foreground">
                  {selectedStore?.isOpen ? t("common.open") : t("common.closed")}
                </span>
              </div>
            </div>

            <ChevronDown
              size={14}
              className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
                storeOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Store Switcher Dropdown Menu */}
          {storeOpen && stores.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-border/90 rounded-xl shadow-xl z-50 overflow-hidden animate-slide-down">
              <div className="px-3.5 py-2 border-b border-border/60 bg-muted/40 flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Mes Boutiques ({stores.length})
                </p>
                <button
                  onClick={() => { setStoreOpen(false); navigate("/store"); }}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Gérer
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                {stores.map((store) => {
                  const isSelected = selectedStore?.id === store.id

                  return (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => handleStoreChange(store.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {store.logoUrl ? (
                        <img
                          src={store.logoUrl}
                          alt={store.name}
                          className="w-7 h-7 rounded-md object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <StoreIcon size={14} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs truncate">{store.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {store.isOpen ? "Ouverte" : "Fermée"}
                        </p>
                      </div>

                      {isSelected && (
                        <Check size={14} className="text-primary shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav data-tour="sidebar-navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, labelKey, icon: Icon, badge, badgeVariant }) => {
            const isActive = pathname === path
            return (
              <button
                key={path}
                data-tour={`nav-${path.replace("/", "")}`}
                onClick={() => go(path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-muted-foreground"}
                />

                <span className="flex-1 text-left">{t(labelKey)}</span>

                {badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : badgeVariant === "danger"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : badgeVariant === "warning"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border/60 bg-muted/20">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Header Bar */}
        <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border/80 flex items-center px-5 gap-3 sticky top-0 z-30 justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Quick search input */}
            <div className="relative max-w-sm w-full hidden sm:flex items-center">
              <Search
                size={15}
                className="absolute left-3 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                placeholder="Rechercher produit, commande, client... (⌘K)"
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-muted/60 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Urgent telemetry chips */}
            <div className="hidden xl:flex items-center gap-2 text-xs">
              <button
                onClick={() => navigate("/orders")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer font-medium"
              >
                <AlertTriangle size={13} className="text-amber-500" />
                <span>{metrics.pendingOrders} à traiter</span>
              </button>

              <button
                onClick={() => navigate("/inventory")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer font-medium"
              >
                <AlertTriangle size={13} className="text-rose-500" />
                <span>{metrics.lowStockCount} stock critique</span>
              </button>
            </div>

            {/* Language switcher */}
            <button
              onClick={toggleLanguage}
              title="Changer de langue"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/60 bg-muted/50 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Globe size={14} />
              <span>{i18n.language.toUpperCase()}</span>
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down">
                  <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                    <p className="font-display font-semibold text-sm text-foreground">
                      {t("common.notifications")}
                    </p>
                    <button
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                      onClick={() => setNotifOpen(false)}
                    >
                      {t("common.markAllRead")}
                    </button>
                  </div>

                  <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                    {notifications.map(({ icon: Icon, text, time, type }) => (
                      <div
                        key={text}
                        className="p-3.5 hover:bg-muted/50 transition-colors flex items-start gap-3 cursor-pointer"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            type === "alert"
                              ? "bg-rose-500/10 text-rose-500"
                              : type === "review"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-foreground font-medium leading-snug">
                            {text}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl border border-border/60 bg-muted/40 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  NM
                </div>
                <div className="hidden md:block text-left text-xs">
                  <p className="font-semibold text-foreground leading-none">
                    Vendeur Certifié
                  </p>
                </div>
                <ChevronDown size={12} className="text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 animate-slide-down">
                  <div className="px-3 py-2 border-b border-border/60 mb-1">
                    <p className="text-xs font-semibold text-foreground">
                      Boutique Nova
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      vendeur@novamarket.mg
                    </p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate("/store"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer text-left"
                  >
                    <StoreIcon size={14} />
                    Paramètres de la boutique
                  </button>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate("/settings"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer text-left"
                  >
                    <Settings size={14} />
                    Préférences du compte
                  </button>
                  <div className="border-t border-border/60 my-1" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-rose-500/10 text-rose-600 transition-colors cursor-pointer text-left font-medium"
                  >
                    <LogOut size={14} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  </TutorialProvider>
)
}
