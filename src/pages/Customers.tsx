import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Users,
  TrendingUp,
  Mail,
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react"
import { formatMGA, formatFullMGA } from "@/hook/format"
import { getCustomerById, getCustomers } from "@/service/customer"
import type { Customer, CustomerListResponse, CustomerSegment } from "@/type/customer"
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

const Customers = () => {
  const { t } = useTranslation()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | "all">("all")
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [summary, setSummary] = useState<CustomerListResponse["summary"]>({
    totalCustomers: 0,
    activeCustomers: 0,
    totalSpent: 0,
    repeatBuyersPct: 0,
    avgOrderValue: 0,
  })
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const PAGE_SIZE = 8

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getCustomers(page, PAGE_SIZE, search || undefined, segmentFilter === "all" ? undefined : segmentFilter).then((response) => {
      if (!active) return
      setCustomers(response.data)
      setTotalResults(response.meta.total)
      setSummary(response.summary)
    }).catch(() => {
      if (active) setError("La liste des clients n’a pas pu être chargée. Vérifiez votre connexion puis réessayez.")
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [page, search, segmentFilter])

  const customerInitials = (customer: Customer) => customer.avatarInitial || customer.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()

  async function openCustomer(customer: Customer) {
    setSelectedCustomer(customer)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const details = await getCustomerById(customer.id)
      setSelectedCustomer(details)
    } catch {
      setDetailError("La fiche de ce client n’a pas pu être chargée.")
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <PageHeader
        title={t("customers.title")}
        subtitle={t("customers.subtitle")}
        badge={
          <Badge variant="primary" dot>
            {summary.totalCustomers} {t("customers.totalCustomers").toLowerCase()}
          </Badge>
        }
      />

      {error && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">{error}</div>}
      {loading && <div role="status" aria-live="polite" className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Chargement des clients…</div>}

      
      {!loading && !error && <><div data-tour="customers-kpis" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Portefeuille Clients</p>
            <p className="font-display font-extrabold text-2xl text-foreground mt-1 tabular-nums">
              {summary.totalCustomers}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              {summary.totalCustomers ? Math.round((summary.activeCustomers / summary.totalCustomers) * 100) : 0}% clients actifs
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
              {formatMGA(summary.avgOrderValue)}
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
              {formatMGA(summary.totalSpent)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Volume total d'achats</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
        </div>
      </div>

      
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
            Tous les clients ({summary.totalCustomers})
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

      
      {customers.length === 0 ? (
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
            {customers.map((customer) => {
              const isVip = customer.totalSpent > 1_000_000

              return (
                <div
                  key={customer.id}
                  onClick={() => void openCustomer(customer)}
                  className={`bg-card rounded-2xl border p-5 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                    isVip
                      ? "border-purple-500/40 bg-gradient-to-br from-card to-purple-500/5 hover:border-purple-500/70"
                      : "border-border/80 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/15 to-primary/5 text-primary border border-primary/20 flex items-center justify-center font-display font-extrabold text-base shrink-0 shadow-xs">
                      {customerInitials(customer)}
                    </div>

                    {isVip ? (
                      <Badge variant="purple" dot>
                        VIP
                      </Badge>
                    ) : (
                      <Badge variant={customer.status === "active" ? "success" : "neutral"}>{customer.status === "active" ? "Actif" : "Inactif"}</Badge>
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
                      {customer.city ?? "—"}
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
              total={totalResults}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        </div>
      )}

      
      <SlideOverDrawer
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name ?? ""}
        subtitle={selectedCustomer ? `Fiche Client · ${selectedCustomer.city ?? "—"}` : ""}
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
                    href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour ${selectedCustomer.name}, je vous contacte de la part de Nova Market.`)}`}
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
            {detailLoading && <p role="status" className="text-sm text-muted-foreground">Chargement de la fiche client…</p>}
            {detailError && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900">{detailError}</div>}
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border/80">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white font-display font-extrabold text-xl flex items-center justify-center shrink-0 shadow-sm">
                {customerInitials(selectedCustomer)}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-base text-foreground">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedCustomer.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedCustomer.status === "active" ? "success" : "neutral"}>{selectedCustomer.status === "active" ? "Actif" : "Inactif"}</Badge>
                  {selectedCustomer.totalSpent > 1_000_000 && (
                    <Badge variant="purple">Client Privilège</Badge>
                  )}
                </div>
              </div>
            </div>

            
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
                    href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour ${selectedCustomer.name}, je vous contacte de la part de Nova Market.`)}`}
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

            
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Habitudes d'achat
              </h4>

              <div className="text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Panier moyen estimé :</span>
                  <span className="font-semibold text-foreground">
                    {formatFullMGA(Math.round(selectedCustomer.totalSpent / Math.max(selectedCustomer.ordersCount, 1)))}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Dernière commande passée :</span>
                  <span className="font-semibold text-foreground">
                    {selectedCustomer.lastOrderDate
                      ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString("fr-MG")
                      : "Aucune commande renseignée"}
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
      </>}
    </div>
  )
};
export default Customers
