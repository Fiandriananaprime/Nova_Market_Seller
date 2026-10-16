import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Compass,
  Building2,
  Truck,
  Tag,
  Users,
  Webhook,
  HelpCircle,
  LayoutDashboard,
  ShoppingBag,
  Warehouse,
  Star,
  BarChart3,
  Store,
  Package,
  ArrowRight,
  ChevronRight,
} from "lucide-react"
import {
  PageHeader,
  Toast,
} from "@/components/ui"
import { TutorialSettingsSection } from "@/features/tutorials/components/TutorialSettingsSection"

                 
import { AccountTab } from "./settings/tabs/AccountTab"
import { BusinessTab } from "./settings/tabs/BusinessTab"
import { SecurityTab } from "./settings/tabs/SecurityTab"
import { ShippingReturnsTab } from "./settings/tabs/ShippingReturnsTab"
import { PaymentsTab } from "./settings/tabs/PaymentsTab"
import { PromotionsTab } from "./settings/tabs/PromotionsTab"
import { TeamTab } from "./settings/tabs/TeamTab"
import { NotificationsTab } from "./settings/tabs/NotificationsTab"
import { IntegrationsTab } from "./settings/tabs/IntegrationsTab"
import { HelpPoliciesTab } from "./settings/tabs/HelpPoliciesTab"

                                                                               

type TabGroup = {
  label: string
  tabs: TabDef[]
}

type TabId =
  | "account"
  | "business"
  | "security"
  | "notifications"
  | "payments"
  | "shipping"
  | "promotions"
  | "team"
  | "integrations"
  | "tours"
  | "help"

type TabDef = {
  id: TabId
  label: string
  icon: React.ElementType
  badge?: string
}

const TAB_GROUPS: TabGroup[] = [
  {
    label: "Général & Identité",
    tabs: [
      { id: "account", label: "Compte & Préférences", icon: User },
      { id: "business", label: "Informations Pro & KYC", icon: Building2 },
      { id: "security", label: "Sécurité & Confidentialité", icon: Shield },
    ],
  },
  {
    label: "Commerce & Finance",
    tabs: [
      { id: "payments", label: "Paiements & Versements", icon: CreditCard },
      { id: "shipping", label: "Livraison & Retours", icon: Truck },
      { id: "promotions", label: "Promotions & Marketing", icon: Tag },
    ],
  },
  {
    label: "Opérations & Système",
    tabs: [
      { id: "notifications", label: "Notifications & Alertes", icon: Bell },
      { id: "team", label: "Équipe & Permissions", icon: Users },
      { id: "integrations", label: "Intégrations & API", icon: Webhook, badge: "Dev" },
      { id: "tours", label: "Tutoriels & Visites", icon: Compass },
    ],
  },
  {
    label: "Ressources & Légal",
    tabs: [
      { id: "help", label: "Aide, Support & Conditions", icon: HelpCircle },
    ],
  },
]

                                                                               

const QUICK_PAGES = [
  { label: "Boutique", icon: Store, path: "/store", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
  { label: "Produits", icon: ShoppingBag, path: "/products", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { label: "Inventaire", icon: Warehouse, path: "/inventory", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { label: "Commandes", icon: Package, path: "/orders", color: "bg-primary/10 text-primary" },
  { label: "Livraisons", icon: Truck, path: "/deliveries", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { label: "Clients", icon: Users, path: "/customers", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { label: "Avis", icon: Star, path: "/reviews", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  { label: "Analytiques", icon: BarChart3, path: "/analytics", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
]

                                                                               

const Settings = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>("account")
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }

  const currentTabLabel =
    TAB_GROUPS.flatMap((g) => g.tabs).find((t) => t.id === activeTab)?.label ?? ""

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in max-w-screen-xl mx-auto">
      
      <PageHeader
        title={t("nav.settings")}
        subtitle="Gérez l'ensemble de vos paramètres marchand, finances, équipe et conformité"
      />

      
      <div data-tour="settings-quickhub" className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <LayoutDashboard size={14} className="text-primary" />
            Accès Rapide aux Pages Dédiées
          </p>
          <span className="text-[10px] text-muted-foreground">
            Ces sections disposent d'une page complète indépendante
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {QUICK_PAGES.map(({ label, icon: Icon, path, color }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-muted/70 transition-colors cursor-pointer group"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} group-hover:scale-105 transition-transform`}>
                <Icon size={17} />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      
      <div className="flex flex-col md:flex-row gap-6">
        
        <nav data-tour="settings-sidebar" className="w-full md:w-60 shrink-0 space-y-4">
          {TAB_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.tabs.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon size={14} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight size={12} className="shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        
        <div className="flex-1 min-w-0">
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
            <span>Paramètres</span>
            <ArrowRight size={12} />
            <span className="text-foreground font-semibold">{currentTabLabel}</span>
          </div>

          
          {activeTab === "account" && (
            <div data-tour="settings-account">
              <AccountTab showToast={showToast} />
            </div>
          )}

          
          {activeTab === "business" && (
            <BusinessTab showToast={showToast} />
          )}

          
          {activeTab === "security" && (
            <SecurityTab showToast={showToast} />
          )}

          
          {activeTab === "notifications" && (
            <NotificationsTab showToast={showToast} />
          )}

          
          {activeTab === "payments" && (
            <div data-tour="settings-payments">
              <PaymentsTab showToast={showToast} />
            </div>
          )}

          
          {activeTab === "shipping" && (
            <ShippingReturnsTab showToast={showToast} />
          )}

          
          {activeTab === "promotions" && (
            <PromotionsTab showToast={showToast} />
          )}

          
          {activeTab === "team" && (
            <TeamTab showToast={showToast} />
          )}

          
          {activeTab === "integrations" && (
            <IntegrationsTab showToast={showToast} />
          )}

          
          {activeTab === "tours" && (
            <div className="space-y-6">
              <TutorialSettingsSection />
            </div>
          )}

          
          {activeTab === "help" && (
            <HelpPoliciesTab showToast={showToast} />
          )}
        </div>
      </div>

      
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
};
export default Settings
