import { useState } from "react";
import { Search, AlertTriangle, Package, Edit2, RefreshCw } from "lucide-react";
import { inventoryItems, formatFullMGA, type InventoryItem } from "../data/mock";
import { PageHeader, InventoryBadge, EmptyState, Card, Toast, Badge } from "../components/ui";

function AdjustModal({ item, onSave, onClose }: {
  item: InventoryItem;
  onSave: (id: string, stock: number, threshold: number) => void;
  onClose: () => void;
}) {
  const [stock, setStock] = useState(item.stock.toString());
  const [threshold, setThreshold] = useState(item.threshold.toString());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border w-full max-w-sm shadow-2xl animate-fade-in p-6">
        <h3 className="font-display font-700 text-base text-foreground mb-1">Ajuster le stock</h3>
        <p className="text-xs text-muted-foreground mb-5">{item.name}</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Quantité en stock</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Seuil d'alerte stock bas</label>
            <input
              type="number"
              min="0"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Vous recevrez une alerte quand le stock passe sous ce seuil</p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors cursor-pointer">
            Annuler
          </button>
          <button
            onClick={() => { onSave(item.productId, Number(stock), Number(threshold)); onClose(); }}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState(inventoryItems);
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const outOfStock = items.filter((i) => i.status === "out_of_stock").length;
  const lowStock = items.filter((i) => i.status === "low_stock").length;

  const filtered = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || i.status === filter;
    return matchSearch && matchFilter;
  });

  function handleAdjust(id: string, stock: number, threshold: number) {
    setItems((prev) => prev.map((i) => {
      if (i.productId !== id) return i;
      const available = Math.max(0, stock - i.reserved);
      const status = stock === 0 ? "out_of_stock" : stock <= threshold ? "low_stock" : "in_stock";
      return { ...i, stock, threshold, available, status };
    }));
    setToast("Stock mis à jour");
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Inventaire"
        subtitle="Gérez vos niveaux de stock et alertes"
      />

      {/* Alert cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Total produits</p>
          <p className="font-display font-700 text-2xl text-foreground">{items.length}</p>
        </div>
        <div className={`rounded-xl border p-4 ${outOfStock > 0 ? "bg-[var(--destructive)]/5 border-[var(--destructive)]/20" : "bg-card border-border"}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={12} className={outOfStock > 0 ? "text-[var(--destructive)]" : "text-muted-foreground"} />
            <p className="text-xs text-muted-foreground">Épuisés</p>
          </div>
          <p className={`font-display font-700 text-2xl ${outOfStock > 0 ? "text-[var(--destructive)]" : "text-foreground"}`}>{outOfStock}</p>
        </div>
        <div className={`rounded-xl border p-4 ${lowStock > 0 ? "bg-[var(--warning)]/5 border-[var(--warning)]/20" : "bg-card border-border"}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={12} className={lowStock > 0 ? "text-[var(--warning)]" : "text-muted-foreground"} />
            <p className="text-xs text-muted-foreground">Stock bas</p>
          </div>
          <p className={`font-display font-700 text-2xl ${lowStock > 0 ? "text-[var(--warning)]" : "text-foreground"}`}>{lowStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, SKU..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex gap-1">
          {[
            { label: "Tous", value: "all" },
            { label: "En stock", value: "in_stock" },
            { label: "Stock bas", value: "low_stock" },
            { label: "Épuisés", value: "out_of_stock" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${filter === f.value ? "bg-primary border-primary text-white" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={<Package size={20} />} title="Aucun produit trouvé" description="Modifiez vos filtres." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Produit</th>
                  <th className="text-left px-3 py-3 text-muted-foreground font-medium hidden md:table-cell">Catégorie</th>
                  <th className="text-right px-3 py-3 text-muted-foreground font-medium">Total</th>
                  <th className="text-right px-3 py-3 text-muted-foreground font-medium hidden sm:table-cell">Réservé</th>
                  <th className="text-right px-3 py-3 text-muted-foreground font-medium">Disponible</th>
                  <th className="text-right px-3 py-3 text-muted-foreground font-medium hidden lg:table-cell">Seuil</th>
                  <th className="text-left px-3 py-3 text-muted-foreground font-medium">Statut</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.productId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-600 text-foreground">{item.name}</p>
                      <p className="text-muted-foreground">{item.sku}</p>
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground hidden md:table-cell">{item.category}</td>
                    <td className="px-3 py-3.5 text-right">
                      <span className="font-700 text-foreground">{item.stock}</span>
                    </td>
                    <td className="px-3 py-3.5 text-right text-muted-foreground hidden sm:table-cell">{item.reserved}</td>
                    <td className="px-3 py-3.5 text-right">
                      <span className={`font-700 ${item.available === 0 ? "text-[var(--destructive)]" : item.available <= item.threshold ? "text-[var(--warning)]" : "text-foreground"}`}>
                        {item.available}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right text-muted-foreground hidden lg:table-cell">{item.threshold}</td>
                    <td className="px-3 py-3.5"><InventoryBadge status={item.status} /></td>
                    <td className="px-3 py-3.5">
                      <button
                        title="Ajuster le stock"
                        onClick={() => setAdjustTarget(item)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw size={13} />
                        <span className="hidden sm:inline text-xs">Ajuster</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {adjustTarget && (
        <AdjustModal item={adjustTarget} onSave={handleAdjust} onClose={() => setAdjustTarget(null)} />
      )}

      {toast && <Toast message={toast} type="success" onDismiss={() => setToast(null)} />}
    </div>
  );
}
