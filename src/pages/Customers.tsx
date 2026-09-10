import { useState } from "react";
import { Search, Users, TrendingUp, ShoppingBag } from "lucide-react";
import { customers, formatMGA, type Customer } from "../data/mock";
import { PageHeader, Badge, EmptyState, Pagination, Card } from "../components/ui";

function CustomerDetail({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-md bg-card border-l border-border flex flex-col h-full shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display font-700 text-base text-foreground">Détails client</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-700 text-xl flex-shrink-0">
              {customer.initials}
            </div>
            <div>
              <h3 className="font-display font-700 text-lg text-foreground">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
              <p className="text-sm text-muted-foreground">{customer.city}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag size={14} className="text-primary" />
                <span className="text-xs text-muted-foreground">Commandes</span>
              </div>
              <p className="font-display font-700 text-2xl text-foreground">{customer.ordersCount}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-primary" />
                <span className="text-xs text-muted-foreground">Total dépensé</span>
              </div>
              <p className="font-display font-700 text-lg text-foreground">{formatMGA(customer.totalSpent)}</p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs font-600 text-muted-foreground mb-2">DERNIÈRE COMMANDE</p>
            <p className="text-sm text-foreground">{new Date(customer.lastOrderDate).toLocaleDateString("fr-MG", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs font-600 text-muted-foreground mb-2">PANIER MOYEN</p>
            <p className="text-sm font-600 text-foreground">{formatMGA(Math.round(customer.totalSpent / customer.ordersCount))}</p>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs font-600 text-muted-foreground mb-2">STATUT</p>
            <Badge variant={customer.status === "active" ? "success" : "muted"}>
              {customer.status === "active" ? "Client actif" : "Inactif"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Customer | null>(null);

  const PAGE_SIZE = 8;

  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrders = Math.round(customers.reduce((sum, c) => sum + c.ordersCount, 0) / customers.length);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Clients"
        subtitle={`${customers.length} clients au total`}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total clients</p>
          <p className="font-display font-700 text-2xl text-foreground mt-1">{customers.length}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{customers.filter((c) => c.status === "active").length} actifs</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Revenu total clients</p>
          <p className="font-display font-700 text-lg text-foreground mt-1">{formatMGA(totalRevenue)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">sur toute la période</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Commandes moy.</p>
          <p className="font-display font-700 text-2xl text-foreground mt-1">{avgOrders}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">par client</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Nom, email..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex gap-1">
          {[{ label: "Tous", value: "all" }, { label: "Actifs", value: "active" }, { label: "Inactifs", value: "inactive" }].map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${statusFilter === f.value ? "bg-primary border-primary text-white" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={<Users size={20} />} title="Aucun client trouvé" description="Vos clients apparaîtront ici après leurs premières commandes." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-muted-foreground font-medium">Client</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium hidden md:table-cell">Ville</th>
                    <th className="text-right px-3 py-3 text-muted-foreground font-medium">Commandes</th>
                    <th className="text-right px-3 py-3 text-muted-foreground font-medium">Total dépensé</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium hidden lg:table-cell">Dernière commande</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium">Statut</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-700 text-xs flex-shrink-0">
                            {c.initials}
                          </div>
                          <div>
                            <p className="font-600 text-foreground">{c.name}</p>
                            <p className="text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground hidden md:table-cell">{c.city}</td>
                      <td className="px-3 py-3.5 text-right font-600 text-foreground">{c.ordersCount}</td>
                      <td className="px-3 py-3.5 text-right font-600 text-foreground">{formatMGA(c.totalSpent)}</td>
                      <td className="px-3 py-3.5 text-muted-foreground hidden lg:table-cell">
                        {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString("fr-MG") : "—"}
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge variant={c.status === "active" ? "success" : "muted"}>
                          {c.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          onClick={() => setSelected(c)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        >
                          Voir
                        </button>
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

      {selected && <CustomerDetail customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
