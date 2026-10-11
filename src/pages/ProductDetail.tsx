import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { AlertTriangle, ArrowLeft, Box, Check, ChevronRight, Eye, Heart, MoreHorizontal, Package, ShoppingBag, Star, Store as StoreIcon, Tag } from "lucide-react"
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, ProductImage, Stars } from "@/components/ui"
import { getProductById, updateProductStatus } from "@/service/product"
import { formatFullMGA } from "@/hook/format"
import type { Product, productModerationStatus, productStatus } from "@/type/product"

const statusLabels: Record<productStatus, string> = { active: "Actif", inactive: "Inactif" }
const moderationLabels: Record<productModerationStatus, string> = {
  draft: "Brouillon", pending: "En attente", approved: "Approuvé", rejected: "Refusé",
}

function dateLabel(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("fr-MG", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Eye }) {
  return <div className="rounded-xl border border-border/70 bg-background p-4">
    <div className="flex items-center gap-2 text-muted-foreground"><Icon size={15} /><span className="text-xs font-medium">{label}</span></div>
    <p className="mt-2 text-xl font-bold tabular-nums text-foreground">{value}</p>
  </div>
}

function DetailRow({ label, value, mono = false }: { label: string; value?: string | null; mono?: boolean }) {
  return <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className={`min-w-0 break-words text-sm font-medium text-foreground sm:max-w-[65%] sm:text-right ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</dd>
  </div>
}

export default function ProductDetail() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setNotFound(false)
    getProductById(id).then((result) => {
      if (!active) return
      setProduct(result)
      setSelectedImage(result.images?.find((image) => image.isDefault)?.url ?? result.images?.[0]?.url ?? null)
    }).catch((requestError: unknown) => {
      if (!active) return
      if (typeof requestError === "object" && requestError !== null && "response" in requestError && (requestError as { response?: { status?: number } }).response?.status === 404) {
        setNotFound(true)
      } else {
        setError("Le produit n’a pas pu être chargé. Vérifiez votre connexion puis réessayez.")
      }
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  const lowStockThreshold = product?.lowStockThreshold ?? 10
  const stockState = useMemo(() => {
    if (!product) return null
    if (product.stock === 0) return { label: "Rupture de stock", className: "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" }
    if (product.stock <= lowStockThreshold) return { label: "Stock faible", className: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200" }
    return null
  }, [product, lowStockThreshold])

  async function changeOperationalStatus() {
    if (!product || product.moderationStatus !== "approved") return
    const nextStatus = product.status === "active" ? "inactive" : "active"
    setUpdating(true)
    setError(null)
    try {
      const updated = await updateProductStatus(product, nextStatus)
      setProduct((current) => current ? { ...current, ...updated, moderationStatus: current.moderationStatus } : updated)
      setMenuOpen(false)
    } catch {
      setError("Le statut du produit n’a pas pu être modifié.")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <main className="mx-auto max-w-7xl p-5 md:p-8" aria-live="polite" aria-busy="true">
    <div className="mb-6 h-4 w-40 animate-pulse rounded bg-muted" />
    <div className="h-12 max-w-lg animate-pulse rounded-xl bg-muted" />
    <div className="mt-8 grid gap-5 lg:grid-cols-2"><div className="h-[28rem] animate-pulse rounded-2xl bg-muted"/><div className="h-[28rem] animate-pulse rounded-2xl bg-muted"/></div>
  </main>

  if (notFound) return <main className="mx-auto max-w-7xl p-5 md:p-8">
    <Button variant="outline" onClick={() => navigate("/products")}><ArrowLeft size={16}/> Retour aux produits</Button>
    <Card className="mt-6"><CardBody className="py-16 text-center"><Package size={30} className="mx-auto text-muted-foreground"/><h1 className="mt-4 text-xl font-bold text-foreground">Produit introuvable</h1><p className="mt-2 text-sm text-muted-foreground">Ce produit n’existe pas ou n’est pas accessible depuis votre compte.</p></CardBody></Card>
  </main>

  if (error && !product) return <main className="mx-auto max-w-7xl p-5 md:p-8">
    <Button variant="outline" onClick={() => navigate("/products")}><ArrowLeft size={16}/> Retour aux produits</Button>
    <div role="alert" className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 p-5 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">{error}</div>
  </main>

  if (!product) return null

  const images = product.images ?? []
  const operationalCanChange = product.moderationStatus === "approved"

  return <main className="mx-auto max-w-7xl space-y-6 p-5 md:p-8">
    <nav aria-label="Fil d’Ariane" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link to="/products" className="rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Produits</Link>
      <ChevronRight size={14}/><span className="max-w-[60vw] truncate font-medium text-foreground" aria-current="page">{product.name}</span>
    </nav>

    <header className="flex flex-col justify-between gap-5 border-b border-border/60 pb-5 lg:flex-row lg:items-start">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant={product.status === "active" ? "success" : "neutral"} dot>{statusLabels[product.status]}</Badge>
          {product.moderationStatus
            ? <Badge variant={product.moderationStatus === "approved" ? "success" : product.moderationStatus === "rejected" ? "danger" : product.moderationStatus === "pending" ? "warning" : "neutral"}>Modération · {moderationLabels[product.moderationStatus]}</Badge>
            : <Badge variant="neutral">Modération · Non renseignée</Badge>}
        </div>
        <h1 className="break-words font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">{product.name}</h1>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"><span>SKU <strong className="font-mono text-foreground">{product.sku || "—"}</strong></span><span>ID <strong className="font-mono text-foreground">{product.id}</strong></span></p>
        <p className="mt-2 text-xs text-muted-foreground">Créé le {dateLabel(product.createdAt)} <span className="mx-1.5">·</span> Modifié le {dateLabel(product.updatedAt)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => navigate("/products")}><ArrowLeft size={15}/> Retour aux produits</Button>
        <Button variant="primary" onClick={() => navigate(`/products?edit=${encodeURIComponent(product.id)}`)}>Modifier le produit</Button>
        {operationalCanChange && <div className="relative">
          <Button variant="outline" aria-label="Autres actions produit" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreHorizontal size={18}/></Button>
          {menuOpen && <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-border bg-card p-1.5 shadow-xl">
            <button type="button" disabled={updating} onClick={() => void changeOperationalStatus()} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50">{updating ? "Mise à jour…" : product.status === "active" ? "Désactiver le produit" : "Activer le produit"}</button>
          </div>}
        </div>}
      </div>
    </header>

    {error && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">{error}</div>}

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col gap-3">
        <Card>
          <CardHeader><CardTitle>Galerie produit</CardTitle><span className="text-xs text-muted-foreground">{images.length} image{images.length > 1 ? "s" : ""}</span></CardHeader>
          <CardBody>
            <div className="aspect-square overflow-hidden rounded-xl border border-border/70 bg-muted/50">
              <ProductImage src={selectedImage ?? undefined} alt={product.name} className="h-full w-full object-contain" fallbackIcon={<Package size={36}/>}/>
            </div>
            {images.length > 0 && <div className="mt-3 grid grid-cols-4 gap-1 ">
              {images.filter((image) => image.url !== selectedImage).map((image, index) => <button key={`${image.url}-${index}`} type="button" onClick={() => setSelectedImage(image.url)} aria-label={`Afficher l’image ${index + 1}${image.isDefault ? ", image par défaut" : ""}`} aria-pressed={selectedImage === image.url} className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedImage === image.url ? "border-primary" : "border-border/70"}`}>
                <ProductImage src={image.url} alt={`${product.name} — image ${index + 1}`} className="h-full w-full object-cover"/>
                {image.isDefault && <span className="absolute inset-x-0 bottom-0 bg-foreground/80 px-1 py-1 text-center text-[10px] font-semibold text-background">Par défaut</span>}
              </button>)}
            </div>}
          </CardBody>
        </Card>
        <Card><CardHeader><CardTitle>Caractéristiques</CardTitle></CardHeader><CardBody>
              {Object.entries(product.specs ?? {}).length ? <dl className="divide-y divide-border/60">{Object.entries(product.specs ?? {}).map(([key, value]) => <DetailRow key={key} label={key} value={value}/>)}</dl> : <p className="text-sm text-muted-foreground">Aucune caractéristique renseignée.</p>}
          </CardBody>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informations principales</CardTitle></CardHeader>
          <CardBody>
            <dl className="divide-y divide-border/60">
              <DetailRow label="Nom" value={product.name}/>
              <DetailRow label="Marque" value={product.brand}/>
              <DetailRow label="Catégorie" value={product.categoryName}/>
              <DetailRow label="Identifiant de catégorie" value={product.categoryId} mono/>
              <DetailRow label="Prix" value={formatFullMGA(product.price)}/>
              <DetailRow label="SKU" value={product.sku} mono/>
              <DetailRow label="Stock disponible" value={String(product.stock)}/>
              <DetailRow label="Seuil de stock faible" value={String(lowStockThreshold)}/>
            </dl>
            {stockState && <div role="status" className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3 text-sm ${stockState.className}`}><AlertTriangle size={17} className="mt-0.5 shrink-0"/><div><p className="font-semibold">{stockState.label}</p><p className="mt-0.5 text-xs opacity-90">{product.stock === 0 ? "Aucune unité disponible." : `${product.stock} unité${product.stock > 1 ? "s" : ""} disponible${product.stock > 1 ? "s" : ""}, au seuil ou en dessous (${lowStockThreshold}).`}</p></div></div>}
            <div className="mt-4 border-t border-border/60 pt-4"><h3 className="text-sm font-semibold text-foreground">Description</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{product.description || "Aucune description renseignée."}</p></div>
            <div className="mt-4"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><Tag size={15}/> Tags</h3>{product.tags?.length ? <div className="flex flex-wrap gap-2">{product.tags.map((tag, index) => <Badge key={`${tag}-${index}`} variant="neutral">{tag}</Badge>)}</div> : <p className="text-sm text-muted-foreground">Aucun tag renseigné.</p>}</div>
          </CardBody>
        </Card>
          <Card><CardHeader><CardTitle>Variantes</CardTitle></CardHeader><CardBody>
            {product.variants?.length ? <dl className="space-y-4">{product.variants.map((variant, index) => <div key={`${variant.name ?? "variante"}-${index}`}><dt className="text-sm font-semibold text-foreground">{variant.name || "Variante"}</dt><dd className="mt-2 flex flex-wrap gap-2">{variant.values?.length ? variant.values.map((value, valueIndex) => <Badge key={`${value}-${valueIndex}`} variant="neutral">{value}</Badge>) : <span className="text-sm text-muted-foreground">Aucune valeur renseignée.</span>}</dd></div>)}</dl> : <p className="text-sm text-muted-foreground">Aucune variante renseignée.</p>}
          </CardBody></Card>
        
      </div>
    </div>
    {product.moderationReason && <Card><CardHeader><CardTitle>Information de modération</CardTitle><Badge variant="warning"><Check size={12}/> Détail disponible</Badge></CardHeader><CardBody><p className="text-sm leading-6 text-muted-foreground">{product.moderationReason}</p></CardBody></Card>}
  </main>
}
