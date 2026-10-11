import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Search,
  Users,
  TrendingUp,
  ShoppingBag,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  UserCheck,
  Star,
  ExternalLink,
  Phone,
  MessageCircle,
} from "lucide-react"
import { customers, formatMGA, formatFullMGA, type Customer } from "@/hook/mock"
import {
  PageHeader,
  Button,
  SearchInput,
  Badge,
  EmptyState,
  Pagination,
  Card,
  SlideOverDrawer,
} from "@/components/ui"

export default function Customers() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [segmentFilter, setSegmentFilter] = useState<"all" | "vip" | "frequent" | "new">("all")
  const [page, setPage] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const PAGE_SIZE = 8

  // Segment logic
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgBasket = Math.round(
    totalRevenue / Math.max(customers.reduce((sum, c) => sum + c.ordersCount, 0), 1)
  )

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())

    let matchSegment = true
    if (segmentFilter === "vip") {
      matchSegment = c.totalSpent > 1_000_000
    } else if (segmentFilter === "frequent") {
      matchSegment = c.ordersCount >= 5
    } else if (segmentFilter === "new") {
      matchSegment = c.ordersCount <= 2
    }

    return matchSearch && matchSegment
  })

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={t("customers.title")}
        subtitle={t("customers.subtitle")}
        badge={
          <Badge variant="primary" dot>
            {customers.length} {t("customers.totalCustomers").toLowerCase()}
          </Badge>
        }
      />

      {/* Cohort & Telemetry Summary Cards */}
      <div data-tour="customers-kpis" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Portefeuille Clients</p>
            <p className="font-display font-extrabold text-2xl text-foreground mt-1 tabular-nums">
              {customers.length}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              100% clients actifs
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Panier Moyen Global</p>
            <p className="font-display font-extrabold text-2xl text-foreground mt-1 tabular-nums">
              {formatMGA(avgBasket)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Par commande passée</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Valeur Cumulée LTV</p>
            <p className="font-display font-extrabold text-2xl text-foreground mt-1 tabular-nums">
              {formatMGA(totalRevenue)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Volume total d'achats</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div data-tour="customers-search" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-xs">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Rechercher par nom, email client..."
          className="max-w-md w-full"
        />

        <div data-tour="customers-segments" className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => { setSegmentFilter("all"); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              segmentFilter === "all"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Tous les clients ({customers.length})
          </button>

          <button
            onClick={() => { setSegmentFilter("vip"); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              segmentFilter === "vip"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-purple-600 hover:bg-purple-500/10"
            }`}
          >
            VIP & Top Acheteurs
          </button>

          <button
            onClick={() => { setSegmentFilter("frequent"); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              segmentFilter === "frequent"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Clients Réguliers (5+ cdtes)
          </button>

          <button
            onClick={() => { setSegmentFilter("new"); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              segmentFilter === "new"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Nouveaux Clients
          </button>
        </div>
      </div>

      {/* Customer Tiles Grid */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={22} />}
            title="Aucun client trouvé"
            description="Modifiez vos critères de recherche ou de segmentation."
          />
        </Card>
      ) : (
        <div data-tour="customers-list">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginated.map((customer) => {
              const isVip = customer.totalSpent > 1_000_000
              const aov = Math.round(customer.totalSpent / Math.max(customer.ordersCount, 1))

              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`bg-card rounded-2xl border p-5 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                    isVip
                      ? "border-purple-500/40 bg-gradient-to-br from-card to-purple-500/5 hover:border-purple-500/70"
                      : "border-border/80 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/15 to-primary/5 text-primary border border-primary/20 flex items-center justify-center font-display font-extrabold text-base shrink-0 shadow-xs">
                      {customer.initials}
                    </div>

                    {isVip ? (
                      <Badge variant="purple" dot>
                        VIP
                      </Badge>
                    ) : (
                      <Badge variant="success">Actif</Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-sm text-foreground truncate">
                      {customer.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {customer.email}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin size={11} />
                      {customer.city}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Dépenses
                      </p>
                      <p className="font-display font-extrabold text-sm text-foreground tabular-nums">
                        {formatMGA(customer.totalSpent)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Commandes
                      </p>
                      <p className="font-bold text-foreground tabular-nums">
                        {customer.ordersCount}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6">
            <Pagination
              page={page}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Slide-Over Customer Dossier Drawer */}
      <SlideOverDrawer
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name ?? ""}
        subtitle={selectedCustomer ? `Fiche Client · ${selectedCustomer.city}` : ""}
        footer={
          selectedCustomer && (
            <div className="flex items-center justify-between gap-2.5 w-full">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedCustomer(null)}
              >
                Fermer
              </Button>

              <div className="flex items-center gap-2">
                {selectedCustomer.phone && (
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Bonjour ${selectedCustomer.name}, je vous contacte de la part de Nova Market.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    window.location.href = `mailto:${selectedCustomer.email}`
                  }}
                >
                  <Mail size={13} />
                  Email
                </Button>
              </div>
            </div>
          )
        }
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer identity card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border/80">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white font-display font-extrabold text-xl flex items-center justify-center shrink-0 shadow-sm">
                {selectedCustomer.initials}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-base text-foreground">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedCustomer.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="success">Compte Vérifié</Badge>
                  {selectedCustomer.totalSpent > 1_000_000 && (
                    <Badge variant="purple">Client Privilège</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Communication Bar */}
            {selectedCustomer.phone && (
              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Phone size={13} className="text-muted-foreground" />
                  <span className="font-semibold text-foreground">{selectedCustomer.phone}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${selectedCustomer.phone.replace(/\s+/g, "")}`}
                    className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Phone size={12} />
                    <span>Appel</span>
                  </a>
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Bonjour ${selectedCustomer.name}, je vous contacte de la part de Nova Market.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <MessageCircle size={12} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* Performance telemetry */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-[11px] text-muted-foreground font-medium">Total Dépensé (LTV)</p>
                <p className="font-display font-extrabold text-lg text-foreground mt-1 tabular-nums">
                  {formatFullMGA(selectedCustomer.totalSpent)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-[11px] text-muted-foreground font-medium">Nombre de Commandes</p>
                <p className="font-display font-extrabold text-lg text-foreground mt-1 tabular-nums">
                  {selectedCustomer.ordersCount} commandes
                </p>
              </div>
            </div>

            {/* Order habits */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Habitudes d'achat
              </h4>

              <div className="text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Panier moyen estimé :</span>
                  <span className="font-semibold text-foreground">
                    {formatFullMGA(Math.round(selectedCustomer.totalSpent / selectedCustomer.ordersCount))}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Dernière commande passée :</span>
                  <span className="font-semibold text-foreground">
                    {selectedCustomer.lastOrderDate
                      ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString("fr-MG")
                      : "Récemment"}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Zone & Quartier :</span>
                  <span className="font-semibold text-foreground">
                    {[selectedCustomer.district, selectedCustomer.city].filter(Boolean).join(", ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  )
}
