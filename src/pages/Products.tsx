import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Star, Package } from "lucide-react";
import { products, formatMGA, type Product, type ProductStatus } from "../data/mock";
import {
  PageHeader, Button, ProductStatusBadge, EmptyState, Pagination,
  ConfirmModal, Toast, Card, Stars, Badge
} from "../components/ui";

const CATEGORIES = ["Toutes", "Épices & Aromates", "Boissons", "Cosmétiques", "Textile", "Artisanat", "Alimentation", "Bijoux"];
const STATUS_OPTS: { label: string; value: string }[] = [
  { label: "Tous les statuts", value: "all" },
  { label: "Actif", value: "active" },
  { label: "Brouillon", value: "draft" },
  { label: "Inactif", value: "inactive" },
];

interface ProductFormProps {
  product?: Product;
  onSave: (p: Partial<Product>) => void;
  onClose: () => void;
}

function ProductForm({ product, onSave, onClose }: ProductFormProps) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    category: product?.category ?? "Épices & Aromates",
    price: product?.price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
    status: (product?.status ?? "draft") as ProductStatus,
    description: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
          <h2 className="font-display font-700 text-base text-foreground">
            {product ? "Modifier le produit" : "Nouveau produit"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
            <span className="sr-only">Fermer</span>✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Basic info */}
          <div>
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-3">Informations générales</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Nom du produit *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ex. Vanille de Madagascar 100g"
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">SKU</label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="ex. VAN-100G"
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Catégorie *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Décrivez votre produit..."
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-3">Prix & stock</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Prix (Ar) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="45000"
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Quantité en stock *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="100"
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-3">Statut</p>
            <div className="flex gap-2">
              {(["draft", "active", "inactive"] as ProductStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`flex-1 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${form.status === s ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-foreground"}`}
                >
                  {s === "draft" ? "Brouillon" : s === "active" ? "Actif" : "Inactif"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">Annuler</Button>
            <Button variant="primary" className="flex-1">
              {product ? "Enregistrer" : "Créer le produit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [localProducts, setLocalProducts] = useState(products);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const PAGE_SIZE = 8;

  const filtered = localProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "Toutes" || p.category === categoryFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleSave(data: Partial<Product>) {
    if (editProduct) {
      setLocalProducts((prev) => prev.map((p) => p.id === editProduct.id ? { ...p, ...data } : p));
      showToast("Produit mis à jour avec succès");
    } else {
      showToast("Produit créé avec succès");
    }
    setEditProduct(undefined);
  }

  function handleDelete(id: string) {
    setLocalProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
    showToast("Produit supprimé");
  }

  function handleToggleStatus(id: string) {
    setLocalProducts((prev) => prev.map((p) =>
      p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p
    ));
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Produits"
        subtitle={`${localProducts.filter((p) => p.status === "active").length} produits actifs`}
        actions={
          <Button variant="primary" onClick={() => { setEditProduct(undefined); setShowForm(true); }}>
            <Plus size={14} />
            Nouveau produit
          </Button>
        }
      />

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => { setCategoryFilter(c); setPage(1); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${categoryFilter === c ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Nom, SKU..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm rounded-md border border-border bg-card text-foreground focus:outline-none cursor-pointer"
        >
          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package size={20} />}
            title="Aucun produit trouvé"
            description="Ajoutez votre premier produit pour commencer à vendre sur Nova Market."
            action={<Button variant="primary" onClick={() => setShowForm(true)}><Plus size={13} />Ajouter un produit</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-muted-foreground font-medium">Produit</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium hidden md:table-cell">Catégorie</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium">Prix</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium">Stock</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium hidden sm:table-cell">Note</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium hidden lg:table-cell">Ventes</th>
                    <th className="text-left px-3 py-3 text-muted-foreground font-medium">Statut</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-9 h-9 rounded-md object-cover bg-muted flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-600 text-foreground truncate max-w-[160px]">{p.name}</p>
                            <p className="text-muted-foreground">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground hidden md:table-cell">{p.category}</td>
                      <td className="px-3 py-3.5 font-600 text-foreground">{formatMGA(p.price)}</td>
                      <td className="px-3 py-3.5">
                        <span className={`font-600 ${p.stock === 0 ? "text-[var(--destructive)]" : p.stock <= 10 ? "text-[var(--warning)]" : "text-foreground"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 hidden sm:table-cell">
                        {p.reviewsCount > 0 ? (
                          <div className="flex items-center gap-1">
                            <Stars rating={p.rating} />
                            <span className="text-muted-foreground">({p.reviewsCount})</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 hidden lg:table-cell">
                        <span className="font-medium text-foreground">{p.sold}</span>
                        <span className="text-muted-foreground"> vendus</span>
                      </td>
                      <td className="px-3 py-3.5"><ProductStatusBadge status={p.status} /></td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            title={p.status === "active" ? "Désactiver" : "Activer"}
                            onClick={() => handleToggleStatus(p.id)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            {p.status === "active" ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            title="Modifier"
                            onClick={() => { setEditProduct(p); setShowForm(true); }}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            title="Supprimer"
                            onClick={() => setDeleteTarget(p.id)}
                            className="p-1.5 rounded-md hover:bg-[var(--destructive)]/10 text-muted-foreground hover:text-[var(--destructive)] transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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

      {showForm && (
        <ProductForm
          product={editProduct}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditProduct(undefined); }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Supprimer ce produit"
          message="Cette action est irréversible. Le produit sera définitivement supprimé de votre boutique."
          danger
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
