import { useState } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import {
  Search,
  Truck,
  CheckCircle2,
  X,
  Clock,
  Package,
  Layers,
  ListFilter,
  Kanban,
  LayoutList,
  ChevronRight,
  MapPin,
  CreditCard,
  User,
  AlertCircle,
  ArrowRight,
  Phone,
  MessageCircle,
  Printer,
  Navigation,
} from "lucide-react"
import { orders, formatMGA, formatFullMGA, type Order, type OrderStatus } from "@/hook/mock"
import {
  PageHeader,
  Button,
  SearchInput,
  OrderStatusBadge,
  PaymentBadge,
  EmptyState,
  Pagination,
  ConfirmModal,
  Toast,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  SlideOverDrawer,
  ViewToggle,
  Badge,
} from "@/components/ui"

const PIPELINE_COLUMNS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: "pending", label: "En attente", icon: Clock },
  { status: "confirmed", label: "Confirmée", icon: CheckCircle2 },
  { status: "processing", label: "En traitement", icon: Package },
  { status: "shipped", label: "Expédiée", icon: Truck },
  { status: "delivered", label: "Livrée", icon: CheckCircle2 },
]

const TRANSITION_NEXT: Record<OrderStatus, OrderStatus | null> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  preparing: "shipped",
  shipped: "delivered",
  delivered: null,
  cancelled: null,
}

const TRANSITION_ACTION_LABELS: Record<OrderStatus, string> = {
  pending: "Confirmer la commande",
  confirmed: "Lancer le traitement",
  processing: "Marquer expédiée",
  preparing: "Marquer expédiée",
  shipped: "Marquer comme livrée",
  delivered: "Commande terminée",
  cancelled: "Commande annulée",
}

export default function Orders() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline")
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [localOrders, setLocalOrders] = useState<Order[]>(orders)
  const [toast, setToast] = useState<string | null>(null)
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)

  const PAGE_SIZE = 8

  const showNotification = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Filter logic
  const filtered = localOrders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Status transitions
  function handleAdvanceStatus(orderId: string) {
    const target = localOrders.find((o) => o.id === orderId)
    if (!target) return
    const next = TRANSITION_NEXT[target.status]
    if (!next) return

    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: next } : o))
    )

    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: next } : null))
    }

    showNotification(`Statut mis à jour → ${next}`)
  }

  function handleCancelOrder(orderId: string) {
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
    )
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: "cancelled" } : null))
    }
    setCancelTargetId(null)
    showNotification("Commande annulée avec succès")
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header and Controls */}
      <PageHeader
        title={t("orders.title")}
        subtitle={t("orders.subtitle")}
        badge={
          <Badge variant="primary" dot>
            {localOrders.length} {t("orders.all").toLowerCase()}
          </Badge>
        }
        actions={
          <div data-tour="orders-view-toggle" className="flex items-center gap-3">
            <ViewToggle
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: "pipeline", label: t("orders.viewPipeline"), icon: <Kanban size={14} /> },
                { value: "list", label: t("orders.viewList"), icon: <LayoutList size={14} /> },
              ]}
            />
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div data-tour="orders-search-filter" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-xs">
        {/* Search */}
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder={t("orders.searchPlaceholder")}
          className="max-w-md w-full"
        />

        {/* Filter status tabs */}
        <div data-tour="orders-status-tabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => { setStatusFilter("all"); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t("orders.all")} ({localOrders.length})
          </button>

          {PIPELINE_COLUMNS.map((col) => {
            const count = localOrders.filter((o) => o.status === col.status).length
            return (
              <button
                key={col.status}
                onClick={() => { setStatusFilter(col.status); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === col.status
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {col.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Orders Display */}
      <div data-tour="orders-content">
        {/* VIEW 1: Operational Pipeline (Kanban Board) */}
        {viewMode === "pipeline" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((col) => {
            const colOrders = filtered.filter((o) => o.status === col.status)
            const colTotal = colOrders.reduce((sum, o) => sum + o.total, 0)
            const Icon = col.icon

            return (
              <div
                key={col.status}
                className="flex flex-col rounded-2xl bg-muted/40 border border-border/70 p-3 min-w-[240px]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-card border border-border flex items-center justify-center text-primary shrink-0">
                      <Icon size={13} />
                    </div>
                    <span className="font-display font-bold text-xs text-foreground truncate">
                      {col.label}
                    </span>
                  </div>

                  <span className="w-5 h-5 rounded-full bg-card border border-border text-[11px] font-bold flex items-center justify-center text-muted-foreground shrink-0">
                    {colOrders.length}
                  </span>
                </div>

                {/* Subtitle with total column value */}
                <p className="text-[10px] text-muted-foreground font-medium mb-3 px-1">
                  Volume: <span className="font-bold text-foreground">{formatMGA(colTotal)}</span>
                </p>

                {/* Orders in column */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[680px] pr-0.5">
                  {colOrders.length === 0 ? (
                    <div className="h-28 rounded-xl border border-dashed border-border/80 flex items-center justify-center text-center p-3">
                      <p className="text-[11px] text-muted-foreground">
                        Aucune commande
                      </p>
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const nextStatus = TRANSITION_NEXT[order.status]
                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="group bg-card rounded-xl border border-border/80 p-3.5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-display font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                              {order.id}
                            </span>
                            <PaymentBadge status={order.paymentStatus} />
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-foreground truncate">
                              {order.buyerName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {order.items.map((it) => `${it.qty}x ${it.name}`).join(", ")}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                            <span className="font-bold text-foreground tabular-nums">
                              {formatMGA(order.total)}
                            </span>
                            <span className="text-muted-foreground">
                              {order.city}
                            </span>
                          </div>

                          {nextStatus && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAdvanceStatus(order.id)
                              }}
                              className="w-full mt-1.5 py-1.5 px-2 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>{TRANSITION_ACTION_LABELS[order.status]}</span>
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* VIEW 2: Refined Data List */
        <Card>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Search size={22} />}
              title={t("orders.noOrdersFound")}
              description="Aucune commande ne correspond aux filtres appliqués."
            />
          ) : (
            <>
              <div className="divide-y divide-border/60">
                {paginated.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-display font-bold text-xs shrink-0">
                        {order.buyerAvatar}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {order.id}
                          </p>
                          <OrderStatusBadge status={order.status} />
                          <PaymentBadge status={order.paymentStatus} />
                        </div>

                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          Client: <span className="font-medium text-foreground">{order.buyerName}</span> · {order.city} · {order.items.length} produit(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                      <div className="text-left md:text-right">
                        <p className="font-display font-bold text-sm text-foreground tabular-nums">
                          {formatMGA(order.total)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("fr-MG")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {TRANSITION_NEXT[order.status] && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleAdvanceStatus(order.id)}
                          >
                            Étape suivante
                          </Button>
                        )}
                        <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                page={page}
                total={filtered.length}
                pageSize={PAGE_SIZE}
                onChange={setPage}
              />
            </>
          )}
        </Card>
      )}
      </div>

      {/* Slide-Over Order Dossier Drawer */}
      <SlideOverDrawer
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Commande ${selectedOrder.id}` : ""}
        subtitle={
          selectedOrder
            ? `Passée le ${new Date(selectedOrder.createdAt).toLocaleString("fr-MG")}`
            : ""
        }
        footer={
          selectedOrder && (
            <div className="flex items-center justify-between w-full gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  window.print()
                }}
                className="hover:border-primary"
              >
                <Printer size={13} />
                <span>Bordereau</span>
              </Button>

              <div className="flex items-center gap-2">
                {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setCancelTargetId(selectedOrder.id)}
                  >
                    Annuler
                  </Button>
                )}

                {TRANSITION_NEXT[selectedOrder.status] && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAdvanceStatus(selectedOrder.id)}
                  >
                    {TRANSITION_ACTION_LABELS[selectedOrder.status]}
                  </Button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status & Tracking overview */}
            <div className="p-4 rounded-xl bg-muted/60 border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Statut opérationnel</p>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Règlement</p>
                  <PaymentBadge status={selectedOrder.paymentStatus} />
                </div>
              </div>

              {selectedOrder.tracking && (
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Navigation size={13} className="text-primary" />
                    <span>Suivi : <span className="font-bold text-foreground">{selectedOrder.tracking}</span></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/deliveries")}
                    className="text-primary hover:underline font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Voir sur la carte</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Buyer dossier */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Informations Acheteur & Livraison
              </h3>
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                      {selectedOrder.buyerAvatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {selectedOrder.buyerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedOrder.buyerEmail || `${selectedOrder.buyerName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Madagascar Phone & WhatsApp Actions */}
                {selectedOrder.buyerPhone && (
                  <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Phone size={13} className="text-muted-foreground" />
                      <span className="font-semibold text-foreground">{selectedOrder.buyerPhone}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${selectedOrder.buyerPhone.replace(/\s+/g, "")}`}
                        className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Appeler le client"
                      >
                        <Phone size={12} />
                        <span>Appel</span>
                      </a>
                      <a
                        href={`https://wa.me/${selectedOrder.buyerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Bonjour ${selectedOrder.buyerName}, je vous contacte concernant votre commande ${selectedOrder.id} sur Nova Market.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                        title="Contacter sur WhatsApp"
                      >
                        <MessageCircle size={12} />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Delivery address & district */}
                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex items-start gap-1.5 text-muted-foreground">
                    <MapPin size={13} className="mt-0.5 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {[selectedOrder.street, selectedOrder.district].filter(Boolean).join(", ") || "Analakely"}
                      </p>
                      <p className="text-muted-foreground">{selectedOrder.city}, Madagascar</p>
                    </div>
                  </div>

                  {selectedOrder.instructions && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                      <span className="font-bold">Instructions coursier : </span>
                      {selectedOrder.instructions}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground flex justify-between">
                  <span>Méthode de livraison:</span>
                  <span className="font-semibold text-foreground uppercase">
                    {selectedOrder.deliveryMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized receipt */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Articles Commandés ({selectedOrder.items.length})
              </h3>
              <div className="rounded-xl border border-border bg-card divide-y divide-border/60 overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-muted-foreground mt-0.5">
                        Quantité : {item.qty} × {formatFullMGA(item.price)}
                      </p>
                    </div>
                    <p className="font-bold text-foreground tabular-nums">
                      {formatFullMGA(item.price * item.qty)}
                    </p>
                  </div>
                ))}

                <div className="p-4 bg-muted/30 flex items-center justify-between text-sm font-bold">
                  <span>Total commande</span>
                  <span className="text-base text-primary tabular-nums">
                    {formatFullMGA(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>

      {/* Cancel Order Confirmation Modal */}
      {cancelTargetId && (
        <ConfirmModal
          title="Annuler cette commande ?"
          message="Êtes-vous sûr de vouloir annuler cette commande ? Le client sera immédiatement notifié et les stocks seront réintégrés."
          danger
          confirmLabel="Oui, annuler"
          onConfirm={() => handleCancelOrder(cancelTargetId)}
          onCancel={() => setCancelTargetId(null)}
        />
      )}

      {/* Toast Feedback */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
