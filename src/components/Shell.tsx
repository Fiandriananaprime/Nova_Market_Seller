import { useEffect, useState } from "react"
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
  Check,
  Globe,
  Bot
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useStore } from "@/context/useStore"
import { TutorialProvider } from "@/features/tutorials/context/TutorialContext"
import { tutorialService } from "@/features/tutorials/services/tutorialService"
import {
  getSellerNotifications,
  getSellerProfile,
  markAllSellerNotificationsRead,
  markSellerNotificationRead,
} from "@/service/account"
import type { User } from "@/type/auth"
import type { SellerNotification } from "@/type/notification"
import { requestLogout } from "@/service/auth"
import { subscribeToSellerNotifications } from "@/service/realtime"

const navItems = [
  { path: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { path: "/orders", labelKey: "nav.orders", icon: ShoppingBag },
  { path: "/deliveries", labelKey: "nav.deliveries", icon: Truck },
  { path: "/products", labelKey: "nav.products", icon: Package },
  { path: "/inventory", labelKey: "nav.inventory", icon: Warehouse },
  { path: "/customers", labelKey: "nav.customers", icon: Users },
  { path: "/reviews", labelKey: "nav.reviews", icon: Star },
  { path: "/store", labelKey: "nav.store", icon: StoreIcon },
  { path: "/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { path: "/ai-automation", labelKey: "nav.aiAutomation", icon: Bot },
  { path: "/settings", labelKey: "nav.settings", icon: Settings }
]

const notificationIcon = (type: SellerNotification["type"]) => {
  if (type === "order") return ShoppingBag
  if (type === "review") return Star
  if (type === "security") return AlertTriangle
  return Bell
}

const formatNotificationTime = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date))

const Shell = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [storeOpen, setStoreOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<SellerNotification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationsMoreLoading, setNotificationsMoreLoading] = useState(false)
  const [notificationsMoreError, setNotificationsMoreError] = useState<string | null>(null)
  const [notificationPage, setNotificationPage] = useState(1)
  const [notificationTotalPages, setNotificationTotalPages] = useState(1)
  const [notificationsError, setNotificationsError] = useState<string | null>(null)
  const [notificationsRealtimeConnected, setNotificationsRealtimeConnected] = useState(false)
  const [profile, setProfile] = useState<User | null>(null)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const {
    stores,
    selectedStore,
    loading: storesLoading,
    selectStore,
  } = useStore()

  useEffect(() => {
    let active = true

    Promise.allSettled([getSellerProfile(), getSellerNotifications()]).then(([profileResult, notificationResult]) => {
      if (!active) return

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value)
      } else {
        console.error("Failed to load seller profile:", profileResult.reason)
      }

      if (notificationResult.status === "fulfilled") {
        setNotificationPage(notificationResult.value.meta.page)
        setNotificationTotalPages(notificationResult.value.meta.totalPages)
        setNotifications((current) => {
          const realtimeIds = new Set(current.map((notification) => notification.id))
          return [
            ...current,
            ...notificationResult.value.data.filter((notification) => !realtimeIds.has(notification.id)),
          ].sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        })
      } else {
        console.error("Failed to load seller notifications:", notificationResult.reason)
        setNotificationsError("Impossible de charger les notifications.")
      }
      setNotificationsLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    return subscribeToSellerNotifications((notification) => {
      setNotifications((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ].slice(0, 50))
    }, (state) => setNotificationsRealtimeConnected(state === "connected"))
  }, [])

  const markAllNotificationsRead = async () => {
    try {
      await markAllSellerNotificationsRead()
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
      setNotificationsError("Impossible de mettre à jour les notifications.")
    }
  }

  const markNotificationRead = async (notification: SellerNotification) => {
    if (notification.read) return
    try {
      await markSellerNotificationRead(notification.id)
      setNotifications((current) =>
        current.map((item) => item.id === notification.id ? { ...item, read: true } : item),
      )
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
      setNotificationsError("Impossible de mettre à jour cette notification.")
    }
  }

  const loadMoreNotifications = async () => {
    if (notificationsMoreLoading || notificationPage >= notificationTotalPages) return
    setNotificationsMoreLoading(true)
    setNotificationsMoreError(null)
    try {
      const response = await getSellerNotifications(notificationPage + 1, 10)
      setNotifications((current) => {
        const currentIds = new Set(current.map((notification) => notification.id))
        return [
          ...current,
          ...response.data.filter((notification) => !currentIds.has(notification.id)),
        ].sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      })
      setNotificationPage(response.meta.page)
      setNotificationTotalPages(response.meta.totalPages)
    } catch (error: unknown) {
      console.error("Failed to load older seller notifications:", error)
      setNotificationsMoreError("Impossible de charger les anciennes notifications.")
    } finally {
      setNotificationsMoreLoading(false)
    }
  }

  const sellerName = profile?.name ?? [profile?.firstName, profile?.lastName].filter(Boolean).join(" ")
  const unreadNotifications = notifications.filter((notification) => !notification.read).length

  const go = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const logout = async () => {
    setLogoutError(null)
    try {
      await requestLogout()
      tutorialService.resetSessionOnLogout()
      localStorage.removeItem("currentStore")
      navigate("/login")
    } catch (error) {
      console.error("Failed to log out seller:", error)
      setLogoutError("Impossible de vous déconnecter. Réessayez.")
    }
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
      
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/80 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shadow-sm shadow-primary/25">
            <TrendingUp size={18} className="text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base tracking-tight text-foreground">
                Nova Market
              </span>
              {selectedStore?.verified && (
                <span className="px-1.5 py-0.2 bg-primary/10 text-primary text-[10px] font-semibold rounded-md">
                  Vérifiée
                </span>
              )}
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
                  : selectedStore?.name ?? "—"}
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

        
        <nav data-tour="sidebar-navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, labelKey, icon: Icon }) => {
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

              </button>
            )
          })}
        </nav>

        
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

      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        
        <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border/80 flex items-center px-5 gap-3 sticky top-0 z-30 justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            
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

          
          <div className="flex items-center gap-2.5">
            
            <button
              onClick={toggleLanguage}
              title="Changer de langue"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/60 bg-muted/50 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Globe size={14} />
              <span>{i18n.language.toUpperCase()}</span>
            </button>

            
            <div className="relative">
              <button
                className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label={`${t("common.notifications")} — ${notificationsRealtimeConnected ? t("common.realtimeConnected") : t("common.reconnecting")}`}
                title={notificationsRealtimeConnected ? t("common.realtimeConnected") : t("common.reconnecting")}
              >
                <Bell size={18} />
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ring-2 ring-card ${notificationsRealtimeConnected ? "bg-emerald-500" : "bg-amber-500"}`}
                />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down">
                  <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                    <p className="font-display font-semibold text-sm text-foreground">
                      {t("common.notifications")}
                    </p>
                    <button
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                      onClick={markAllNotificationsRead}
                    >
                      {t("common.markAllRead")}
                    </button>
                  </div>

                  <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                    {notificationsError ? (
                      <p role="alert" className="p-4 text-xs text-rose-600">{notificationsError}</p>
                    ) : notificationsLoading ? (
                      <p className="p-4 text-xs text-muted-foreground">{t("common.loading")}</p>
                    ) : notifications.length === 0 ? (
                      <p className="p-4 text-xs text-muted-foreground">Aucune notification.</p>
                    ) : notifications.map((notification) => {
                      const Icon = notificationIcon(notification.type)
                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => markNotificationRead(notification)}
                          className={`w-full p-3.5 hover:bg-muted/50 transition-colors flex items-start gap-3 text-left ${notification.read ? "" : "bg-primary/5"}`}
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                            <Icon size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-foreground font-medium leading-snug">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{formatNotificationTime(notification.createdAt)}</p>
                          </div>
                        </button>
                      )
                    })}
                    {notificationsMoreError && (
                      <p role="alert" className="p-3 text-xs text-rose-600">{notificationsMoreError}</p>
                    )}
                    {!notificationsLoading && !notificationsError && notificationPage < notificationTotalPages && (
                      <button
                        type="button"
                        className="w-full p-3 text-xs font-medium text-primary hover:bg-muted/50 disabled:opacity-50"
                        disabled={notificationsMoreLoading}
                        onClick={() => void loadMoreNotifications()}
                      >
                        {notificationsMoreLoading ? "Chargement…" : "Charger les anciennes notifications"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl border border-border/60 bg-muted/40 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {sellerName ? sellerName.slice(0, 2).toUpperCase() : "…"}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <p className="font-semibold text-foreground leading-none">
                    {sellerName || t("common.loading")}
                  </p>
                </div>
                <ChevronDown size={12} className="text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 animate-slide-down">
                  <div className="px-3 py-2 border-b border-border/60 mb-1">
                    <p className="text-xs font-semibold text-foreground">
                      {selectedStore?.name ?? "—"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {profile?.email ?? "—"}
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

        
        <main className="flex-1 overflow-y-auto">
          {logoutError && (
            <div role="alert" className="mx-6 mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
              {logoutError}
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  </TutorialProvider>
)
};
export default Shell;
