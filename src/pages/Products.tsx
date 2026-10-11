import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useSearchParams } from "react-router"
import { useTranslation } from "react-i18next"
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Package,
  LayoutGrid,
  Table as TableIcon,
  Star,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  X,
  ExternalLink,
} from "lucide-react"
import { products, formatMGA, type Product, type ProductStatus } from "@/hook/mock"
import {
  PageHeader,
  Button,
  SearchInput,
  ProductStatusBadge,
  EmptyState,
  Pagination,
  ConfirmModal,
  Toast,
  Card,
  Stars,
  Badge,
  ViewToggle,
  ProductImage,
} from "@/components/ui"
import NovaMarketStudio from "@/features/product-studio/NovaMarketStudio"

const DEFAULT_CATEGORIES = [
  "Électronique",
  "Informatique",
  "Audio",
  "Mode & Chaussures",
  "Maison & Déco",
  "Artisanat Malagasy",
]

interface ProductFormModalProps {
  product?: Product
  onSave: (p: Partial<Product>) => void
  onClose: () => void
  categories?: string[]
}

function ProductFormModal({ product, onSave, onClose, categories = DEFAULT_CATEGORIES }: ProductFormModalProps) {
  const [editorOpen, setEditorOpen] = useState(false)
  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    category: product?.category ?? categories[0] ?? "Électronique",
    price: product?.price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
    status: (product?.status ?? "active") as ProductStatus,
    image:
      product?.image ??
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400",
    images: product?.images?.length ? product.images : [product?.image ?? "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400"],
  })
  const applyEditedImages = useCallback((items: { image: string }[]) => setForm((current) => {
    const images = items.map((item) => item.image)
    return { ...current, image: images[0] ?? current.image, images }
  }), [])
  const closeEditor = useCallback(() => setEditorOpen(false), [])

  const addImages = (files: FileList | null) => {
    if (!files?.length) return
    const readers = Array.from(files).map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Image illisible"))
      reader.onerror = () => reject(new Error("Image illisible"))
      reader.readAsDataURL(file)
    }))
    void Promise.all(readers).then((added) => setForm((current) => {
      const images = [...current.images, ...added]
      return { ...current, images, image: current.image || images[0] }
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      ...form,
      images: form.images.length ? form.images : [form.image],
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
    })
    onClose()
  }

  return createPortal((
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-3xl border border-border w-full max-w-xl shadow-2xl z-10 overflow-hidden animate-slide-down max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">
              {product ? "Modifier le produit" : "Ajouter un produit"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Renseignez les détails pour votre catalogue Nova Market
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Image preview & upload */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/40 p-4 sm:flex-row sm:items-center">
            <ProductImage
              src={form.image}
              alt="Preview"
              className="w-16 h-16 rounded-xl object-cover border border-border shrink-0 bg-card"
            />
            <div className="space-y-1 flex-1">
              <label className="text-xs font-semibold text-foreground block">
                Photo du produit
              </label>
              <input
                type="text"
                value={form.image}
                  onChange={(e) => setForm((current) => ({ ...current, image: e.target.value, images: [e.target.value, ...current.images.slice(1)] }))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground"
                placeholder="https://images.unsplash.com/..."
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <label className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:border-primary/40">
                  Importer des photos
                  <input type="file" accept="image/*" className="sr-only" onChange={(event) => {
                    addImages(event.currentTarget.files)
                    event.currentTarget.value = ""
                  }} multiple />
                </label>
                <Button type="button" size="sm" variant="primary" onClick={() => setEditorOpen(true)}>Ouvrir le studio photo</Button>
              </div>
              {form.images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {form.images.map((src, index) => <button key={`${index}-${src.slice(0, 24)}`} type="button" onClick={() => setForm((current) => ({ ...current, image: src, images: [src, ...current.images.filter((_, itemIndex) => itemIndex !== index)] }))} className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${form.image === src ? "border-primary" : "border-border"}`} aria-label={`Choisir la photo ${index + 1}`}>
                  <ProductImage src={src} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                </button>)}
              </div>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Nom du produit *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ex. Vanille Bourbon de Madagascar 100g"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Code SKU
                </label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="ex. VAN-100G"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Catégorie *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Prix unitaire (Ar) *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="35000"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Stock initial *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="25"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Statut de visibilité
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ProductStatus })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none cursor-pointer"
              >
                <option value="active">Actif (En ligne)</option>
                <option value="inactive">Inactif (Masqué)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" size="md" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="primary" size="md" type="submit">
              {product ? "Enregistrer" : "Créer le produit"}
            </Button>
          </div>
        </form>
      </div>
      {editorOpen && <NovaMarketStudio images={form.images.length ? form.images : [form.image]} name={form.name || "Photo produit"} onClose={closeEditor} onApply={applyEditedImages} />}
    </div>
  ), document.body)
}

export default function Products() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Toutes")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [page, setPage] = useState(1)
  const [localProducts, setLocalProducts] = useState<Product[]>(products)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | undefined>()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const productId = searchParams.get("edit")
    if (!productId) return
    const product = localProducts.find((item) => item.id === productId)
    if (product) {
      setEditProduct(product)
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [localProducts, searchParams, setSearchParams])

  const PAGE_SIZE = 8

  const availableCategories = [
    "Toutes",
    ...Array.from(new Set(localProducts.map((p) => p.category))).filter(Boolean),
  ]

  const showNotification = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Filter
  const filtered = localProducts.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === "Toutes" || p.category === categoryFilter
    return matchSearch && matchCat
  })

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSaveProduct(data: Partial<Product>) {
    if (editProduct) {
      setLocalProducts((prev) =>
        prev.map((p) => (p.id === editProduct.id ? ({ ...p, ...data } as Product) : p))
      )
      showNotification("Produit mis à jour avec succès")
    } else {
      const newProd: Product = {
        id: `PRD-${Date.now()}`,
        name: data.name ?? "Nouveau produit",
        sku: data.sku ?? "SKU-AUTO",
        category: data.category ?? "Épices & Aromates",
        price: data.price ?? 10000,
        stock: data.stock ?? 10,
        sold: 0,
        rating: 5.0,
        reviewsCount: 0,
        status: data.status ?? "active",
        image:
          data.image ??
          "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400",
        images: data.images ?? [data.image ?? "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400"],
        createdAt: new Date().toISOString(),
      }
      setLocalProducts([newProd, ...localProducts])
      showNotification("Nouveau produit ajouté au catalogue")
    }
  }

  function handleDeleteProduct(id: string) {
    setLocalProducts((prev) => prev.filter((p) => p.id !== id))
    setDeleteTargetId(null)
    showNotification("Produit retiré du catalogue")
  }

  function handleToggleStatus(id: string) {
    setLocalProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p
      )
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header and Controls */}
      <PageHeader
        title={t("products.title")}
        subtitle={t("products.subtitle")}
        badge={
          <Badge variant="primary" dot>
            {localProducts.filter((p) => p.status === "active").length} {t("products.active").toLowerCase()}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3">
            <ViewToggle
              data-tour="products-view-toggle"
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: "grid", label: t("products.viewGrid"), icon: <LayoutGrid size={14} /> },
                { value: "table", label: t("products.viewTable"), icon: <TableIcon size={14} /> },
              ]}
            />

            <Button
              data-tour="products-add-btn"
              variant="primary"
              size="md"
              onClick={() => {
                setEditProduct(undefined)
                setShowForm(true)
              }}
            >
              <Plus size={15} />
              {t("products.newProduct")}
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div data-tour="products-search" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-xs">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder={t("products.searchPlaceholder")}
          className="max-w-md w-full"
        />

        {/* Category tabs */}
        <div data-tour="products-categories" className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(cat); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: Visual Product Cards Showcase */}
      {viewMode === "grid" ? (
        filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Package size={22} />}
              title={t("products.noProductsFound")}
              description="Aucun produit ne correspond à vos filtres de recherche."
              action={
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditProduct(undefined)
                    setShowForm(true)
                  }}
                >
                  <Plus size={14} />
                  {t("products.newProduct")}
                </Button>
              }
            />
          </Card>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {paginated.map((product) => (
                <div
                  key={product.id}
                  className="group bg-card rounded-2xl border border-border/80 overflow-hidden shadow-xs hover:border-primary/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Image container */}
                  <div className="relative aspect-4/3 overflow-hidden bg-muted">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-card/90 backdrop-blur-xs text-foreground shadow-xs">
                        {product.category}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <ProductStatusBadge status={product.status} />
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>SKU: {product.sku}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star size={12} className="fill-current" />
                          <span>{product.rating}</span>
                        </div>
                      </div>

                      <button type="button" onClick={() => navigate(`/products/${encodeURIComponent(product.id)}`)} className="text-left font-display font-bold text-sm text-foreground line-clamp-2 leading-snug hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        {product.name}
                      </button>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Prix</p>
                        <p className="font-display font-extrabold text-base text-foreground tabular-nums">
                          {formatMGA(product.price)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground">En stock</p>
                        <span
                          className={`text-xs font-bold ${
                            product.stock === 0
                              ? "text-rose-600"
                              : product.stock < 10
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {product.stock} unités
                        </span>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setEditProduct(product)
                          setShowForm(true)
                        }}
                      >
                        <Edit2 size={13} />
                        Modifier
                      </Button>

                      <Button size="sm" variant="ghost" aria-label={`Voir ${product.name}`} onClick={() => navigate(`/products/${encodeURIComponent(product.id)}`)}>
                        <Eye size={13} />
                      </Button>

                      <button
                        title={product.status === "active" ? "Désactiver" : "Activer"}
                        onClick={() => handleToggleStatus(product.id)}
                        className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {product.status === "active" ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>

                      <button
                        title="Supprimer"
                        onClick={() => setDeleteTargetId(product.id)}
                        className="p-2 rounded-lg border border-border hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
        )
      ) : (
        /* VIEW 2: Data Matrix Table */
        <Card>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Package size={22} />}
              title={t("products.noProductsFound")}
              description="Aucun produit ne correspond aux filtres appliqués."
            />
          ) : (
            <>
              <div className="divide-y divide-border/60">
                {paginated.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-border shrink-0 bg-muted"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-display font-bold text-sm text-foreground truncate">
                            {product.name}
                          </p>
                          <ProductStatusBadge status={product.status} />
                        </div>

                        <p className="text-xs text-muted-foreground mt-0.5">
                          SKU: {product.sku} · Catégorie: {product.category} · Note: ★ {product.rating} ({product.reviewsCount})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                      <div className="text-left md:text-right">
                        <p className="font-display font-bold text-sm text-foreground tabular-nums">
                          {formatMGA(product.price)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {product.stock} en stock · {product.sold} vendus
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditProduct(product)
                            setShowForm(true)
                          }}
                        >
                          <Edit2 size={13} />
                          Modifier
                        </Button>

                        <Button size="sm" variant="ghost" aria-label={`Voir ${product.name}`} onClick={() => navigate(`/products/${encodeURIComponent(product.id)}`)}>
                          <Eye size={13} />
                        </Button>

                        <button
                          onClick={() => setDeleteTargetId(product.id)}
                          className="p-2 rounded-lg border border-border hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
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

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          product={editProduct}
          categories={availableCategories.filter((c) => c !== "Toutes")}
          onSave={handleSaveProduct}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <ConfirmModal
          title="Supprimer ce produit ?"
          message="Cette action retirera le produit de votre vitrine. Cette opération est irréversible."
          danger
          confirmLabel="Oui, supprimer"
          onConfirm={() => handleDeleteProduct(deleteTargetId)}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}

      {/* Toast alert */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
