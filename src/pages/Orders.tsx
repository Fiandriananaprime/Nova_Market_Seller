import { useState } from "react";
import { Search, Filter, ChevronDown, Eye, MoreHorizontal, Truck, CheckCircle2, X } from "lucide-react";
import { orders, formatMGA, formatFullMGA, type Order, type OrderStatus } from "../data/mock";
import {
  PageHeader, Button, Input, Select, OrderStatusBadge, PaymentBadge,
  EmptyState, Pagination, ConfirmModal, Toast, Card
} from "../components/ui";

const STATUS_OPTIONS = [
  { label: "Tous les statuts", value: "all" },
  { label: "En attente", value: "pending" },
  { label: "Confirmée", value: "confirmed" },
  { label: "En traitement", value: "processing" },
  { label: "Préparation", value: "preparing" },
  { label: "Expédiée", value: "shipped" },
  { label: "Livrée", value: "delivered" },
  { label: "Annulée", value: "cancelled" },
];

const TRANSITION_MAP: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["preparing", "cancelled"],
  preparing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const TRANSITION_LABELS: Record<OrderStatus, string> = {
  confirmed: "Confirmer",
  processing: "Traitement",
  preparing: "Préparer",
  shipped: "Expédier",
  delivered: "Marquer livré",
  cancelled: "Annuler",
  pending: "",
};

function OrderDetailPanel({ order, onClose, onStatusChange }: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const transitions = TRANSITION_MAP[order.status];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-md bg-card border-l border-border flex flex-col h-full shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-700 text-base text-foreground">{order.id}</h2>
            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("fr-MG")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
          </div>

          {/* Customer */}
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs font-600 text-muted-foreground mb-2">CLIENT</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-700 text-sm">
                {order.buyerAvatar}
              </div>
              <div>
                <p className="text-sm font-600 text-foreground">{order.buyerName}</p>
                <p className="text-xs text-muted-foreground">{order.city} · {order.deliveryMethod === "express" ? "Livraison express" : order.deliveryMethod === "pickup" ? "Retrait" : "Livraison standard"}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-600 text-muted-foreground mb-2">ARTICLES</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-foreground font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">× {item.qty}</p>
                  </div>
                  <p className="font-600 text-foreground">{formatFullMGA(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="border-t border-border pt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-medium text-foreground">{formatFullMGA(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Livraison</span>
              <span className="text-foreground">Incluse</span>
            </div>
            <div className="flex justify-between text-sm font-700 text-foreground pt-2 border-t border-border mt-2">
              <span>Total</span>
              <span>{formatFullMGA(order.total)}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Paiement:</span>
              <PaymentBadge status={order.paymentStatus} />
              <span className="text-xs text-muted-foreground">via {order.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {transitions.length > 0 && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-border flex gap-2">
            {transitions.map((t) => (
              <Button
                key={t}
                variant={t === "cancelled" ? "danger" : "primary"}
                onClick={() => { onStatusChange(order.id, t); onClose(); }}
                size="sm"
                className="flex-1"
              >
                {t === "shipped" && <Truck size={13} />}
                {t === "delivered" && <CheckCircle2 size={13} />}
                {TRANSITION_LABELS[t]}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Orders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [localOrders, setLocalOrders] = useState(orders);
  const [toast, setToast] = useState<string | null>(null);

  const PAGE_SIZE = 8;

  const filtered = localOrders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleStatusChange(id: string, status: OrderStatus) {
    setLocalOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    setToast(`Statut mis à jour → ${STATUS_OPTIONS.find((s) => s.value === status)?.label}`);
    setTimeout(() => setToast(null), 3000);
  }

  const statusCounts = STATUS_OPTIONS.slice(1).map((s) => ({
    ...s,
    count: localOrders.filter((o) => o.status === s.value).length,
  }));

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Commandes"
        subtitle={`${localOrders.length} commandes au total`}
      />

      {/* Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => { setStatusFilter("all"); setPage(1); }}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${statusFilter === "all" ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
        >
          Toutes
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === "all" ? "bg-white/20 text-white" : "bg-muted"}`}>
            {localOrders.length}
          </span>
        </button>
        {statusCounts.filter((s) => s.count > 0).map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${statusFilter === s.value ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
          >
            {s.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === s.value ? "bg-white/20 text-white" : "bg-muted"}`}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher une commande, un client..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={20} />}
            title="Aucune commande trouvée"
            description="Modifiez vos filtres ou votre recherche pour trouver des commandes."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-muted-foreground font-medium">Commande</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium">Client</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium hidden md:table-cell">Articles</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium">Total</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium">Statut</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium hidden sm:table-cell">Paiement</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-700 text-foreground">{o.id}</p>
                        <p className="text-muted-foreground mt-0.5">{o.deliveryMethod === "express" ? "Express" : "Standard"}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-700 flex-shrink-0">
                            {o.buyerAvatar}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{o.buyerName}</p>
                            <p className="text-muted-foreground">{o.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground hidden md:table-cell">
                        {o.items.length} article{o.items.length > 1 ? "s" : ""}
                      </td>
                      <td className="px-3 py-3.5 font-700 text-foreground">{formatMGA(o.total)}</td>
                      <td className="px-3 py-3.5"><OrderStatusBadge status={o.status} /></td>
                      <td className="px-3 py-3.5 hidden sm:table-cell"><PaymentBadge status={o.paymentStatus} /></td>
                      <td className="px-3 py-3.5 text-muted-foreground hidden lg:table-cell">
                        {new Date(o.createdAt).toLocaleDateString("fr-MG")}
                      </td>
                      <td className="px-3 py-3.5">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(o)}>
                          <Eye size={13} />
                          <span className="hidden sm:inline">Détails</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </Card>

      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {toast && <Toast message={toast} type="success" onDismiss={() => setToast(null)} />}
    </div>
  );
}
