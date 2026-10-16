import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useSearchParams } from "react-router"
import { useTranslation } from "react-i18next"
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Package,
  LayoutGrid,
  Table as TableIcon,
  Star,
  X,
} from "lucide-react"
import { formatMGA } from "@/hook/format"
import { createProduct, deleteProduct, getAllProducts, getCategories, getCategoryById, getProductById, submitProductForReview, updateProduct, updateProductStatus, uploadProductImage } from "@/service/product"
import type { Category, CategoryDetails, Product as ApiProduct, ProductInput, ProductSpecs, productModerationStatus, productStatus } from "@/type/product"
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
  Badge,
  ViewToggle,
  ProductImage,
} from "@/components/ui"
import type { StudioImage } from "@/features/product-studio/NovaMarketStudio"

const NovaMarketStudio = lazy(() => import("@/features/product-studio/NovaMarketStudio"))

interface ProductRow {
  id: string
  name: string
  sku: string
  category: string
  categoryId: string
  price: number
  stock: number
  sold: number
  rating: number
  reviewsCount: number
  status: productStatus
  moderationStatus?: productModerationStatus
  image: string
  images: string[]
  specs?: ProductSpecs
  createdAt: string
}

const toProductRow = (product: ApiProduct):ProductRow => {
  const images = product.images?.map((image) => image.url) ?? []
  return {
    id: product.id,
    name: product.name,
    sku: product.sku ?? "",
    category: product.categoryName ?? product.categoryId,
    categoryId: product.categoryId,
    price: product.price,
    stock: product.stock,
    sold: product.soldCount ?? 0,
    rating: product.rating ?? 0,
    reviewsCount: product.reviewsCount ?? 0,
    status: product.status,
    moderationStatus: product.moderationStatus,
    image: images.find((_, index) => product.images?.[index]?.isDefault) ?? images[0] ?? "",
    images,
    specs: product.specs,
    createdAt: product.createdAt,
  }
};

const studioDataUrlToFile = (image: StudioImage):File => {
  const [metadata, content] = image.image.split(",", 2)
  const mimeType = metadata?.match(/^data:(image\/[^;]+);base64$/)?.[1]
  if (!mimeType || !content) throw new Error("The edited image is not a valid data URL")
  const bytes = Uint8Array.from(atob(content), (character) => character.charCodeAt(0))
  const extension = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "png"
  return new File([bytes], `${image.name}.${extension}`, { type: mimeType })
};

const isValidDraftInput = (input: ProductInput, price: string, stock: string):boolean => {
  const validImageUrls = (input.images ?? []).every(({ url }) => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === "https:" || parsed.protocol === "http:"
    } catch {
      return false
    }
  })
  return input.name.trim().length > 0
    && input.categoryId.length > 0
    && price.trim().length > 0
    && Number.isFinite(input.price)
    && input.price >= 0
    && stock.trim().length > 0
    && Number.isInteger(input.stock)
    && input.stock >= 0
    && validImageUrls
};

interface ProductFormModalProps {
  product?: ProductRow
  onSave: (p: ProductInput) => Promise<void>
  onAutoSave: (input: ProductInput, id?: string) => Promise<ApiProduct>
  onSubmitReview: (id: string) => Promise<void>
  onClose: () => void
  categories: Category[]
}

const ProductFormModal = ({ product, onSave, onAutoSave, onSubmitReview, onClose, categories }: ProductFormModalProps) => {
  const isDraft = !product || product.moderationStatus === "draft" || product.moderationStatus === "rejected"
  const [draftId, setDraftId] = useState(isDraft ? product?.id : undefined)
  const [saving, setSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"waiting" | "saving" | "saved" | "error">("waiting")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [showImageStudio, setShowImageStudio] = useState(false)
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetails | null>(null)
  const [categoryDetailsLoading, setCategoryDetailsLoading] = useState(false)
  const [categoryDetailsError, setCategoryDetailsError] = useState<string | null>(null)
  const [categoryRetry, setCategoryRetry] = useState(0)
  const studioUploadCacheRef = useRef(new Map<string, string>())
  const draftIdRef = useRef(draftId)
  const revisionRef = useRef(0)
  const firstRenderRef = useRef(true)
  const initialIsDraftRef = useRef(
    product?.moderationStatus === "draft" || product?.moderationStatus === "rejected",
  )
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const lastSavedPayloadRef = useRef<string | null>(null)
  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    price: product?.price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
    status: (product?.status ?? "inactive") as productStatus,
    image: product?.image ?? "",
    images: product?.images ?? [],
    specs: product?.specs ?? {},
  })

  useEffect(() => {
    if (!form.categoryId && categories[0]) {
      setForm((current) => ({ ...current, categoryId: categories[0].id }))
    }
  }, [categories, form.categoryId])

  useEffect(() => {
    if (!form.categoryId) return
    let active = true
    setCategoryDetails(null)
    setCategoryDetailsLoading(true)
    setCategoryDetailsError(null)
    getCategoryById(form.categoryId)
      .then((details) => {
        if (active) setCategoryDetails(details)
      })
      .catch((error: unknown) => {
        console.error("[ProductFormModal] Error loading category attributes:", error)
        if (active) setCategoryDetailsError("Les caractéristiques de cette catégorie n’ont pas pu être chargées.")
      })
      .finally(() => {
        if (active) setCategoryDetailsLoading(false)
      })
    return () => { active = false }
  }, [form.categoryId, categoryRetry])

  const categoryAttributes = useMemo(
    () => categoryDetails?.id === form.categoryId ? categoryDetails.attributes : [],
    [categoryDetails, form.categoryId],
  )
  const requiredAttributes = categoryAttributes.filter((attribute) => attribute.required)
  const requiredAttributesComplete = requiredAttributes.every(
    (attribute) => Boolean(form.specs[attribute.key]?.trim()),
  )

  const buildInput = useCallback((): ProductInput => {
    const specs = categoryAttributes.reduce<ProductSpecs>((values, { key }) => {
      const value = form.specs[key]?.trim()
      if (value) values[key] = value
      return values
    }, {})
    return {
      name: form.name,
      sku: form.sku || undefined,
      categoryId: form.categoryId,
      price: Number(form.price),
      stock: Number(form.stock),
      status: form.status,
      images: (form.image ? [form.image, ...form.images.filter((url) => url !== form.image)] : form.images)
        .filter(Boolean)
        .map((url, index) => ({ url, isDefault: index === 0 })),
      ...(Object.keys(specs).length > 0 ? { specs } : {}),
    }
  }, [categoryAttributes, form])

  const initialBuildInputRef = useRef(buildInput)

  useEffect(() => {
    if (initialIsDraftRef.current) {
      lastSavedPayloadRef.current = JSON.stringify(initialBuildInputRef.current())
    }
  }, [])

  useEffect(() => {
    if (!isDraft) return
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    if (categoryDetailsLoading || categoryDetailsError || !categoryDetails || categoryDetails.id !== form.categoryId) {
      setAutoSaveStatus("waiting")
      return
    }

    const input = buildInput()
    if (!isValidDraftInput(input, form.price, form.stock)) {
      setAutoSaveStatus("waiting")
      return
    }

    const revision = ++revisionRef.current
    setAutoSaveStatus("waiting")
    setSaveError(null)
    const timeoutId = window.setTimeout(() => {
      saveQueueRef.current = saveQueueRef.current.then(async () => {
        if (revision !== revisionRef.current) return
        setAutoSaveStatus("saving")
        try {
          const savedProduct = await onAutoSave(input, draftIdRef.current)
          draftIdRef.current = savedProduct.id
          lastSavedPayloadRef.current = JSON.stringify(input)
          setDraftId(savedProduct.id)
          if (revision === revisionRef.current) setAutoSaveStatus("saved")
        } catch {
          if (revision === revisionRef.current) {
            setAutoSaveStatus("error")
            setSaveError("Le brouillon n’a pas pu être sauvegardé automatiquement.")
          }
        }
      })
    }, 700)

    return () => window.clearTimeout(timeoutId)
  }, [buildInput, categoryDetails, categoryDetailsError, categoryDetailsLoading, isDraft, onAutoSave, form])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isDraft) return
    if (categoryDetailsLoading || categoryDetailsError || categoryDetails?.id !== form.categoryId || !requiredAttributesComplete) {
      setSaveError("Chargez la catégorie et renseignez toutes ses caractéristiques obligatoires avant l’enregistrement.")
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await onSave(buildInput())
    } catch {
      setSaveError("Le produit n’a pas pu être enregistré. Vérifiez les informations et réessayez.")
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmitReview() {
    if (!draftId || autoSaveStatus !== "saved") return
    if (categoryDetailsLoading || categoryDetailsError || categoryDetails?.id !== form.categoryId || !requiredAttributesComplete) {
      setSaveError("Chargez la catégorie et renseignez toutes ses caractéristiques obligatoires avant la soumission.")
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await saveQueueRef.current
      const input = buildInput()
      if (lastSavedPayloadRef.current !== JSON.stringify(input)) {
        const savedProduct = await onAutoSave(input, draftIdRef.current)
        draftIdRef.current = savedProduct.id
        lastSavedPayloadRef.current = JSON.stringify(input)
      }
      await onSubmitReview(draftId)
      onClose()
    } catch {
      setSaveError("Le brouillon n’a pas pu être soumis à la revue.")
    } finally {
      setSaving(false)
    }
  }

  async function handleImageFiles(files: FileList | null) {
    if (!files?.length) return
    setUploadingImages(true)
    setSaveError(null)
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadProductImage))
      setForm((current) => {
        const images = [...current.images, ...uploaded.map(({ url }) => url)]
        return { ...current, images, image: current.image || images[0] || "" }
      })
    } catch (error: unknown) {
      console.error("[ProductFormModal] Error uploading product image:", error)
      setSaveError("Une ou plusieurs photos n’ont pas pu être envoyées. Vérifiez le format et réessayez.")
    } finally {
      setUploadingImages(false)
    }
  }

  async function handleStudioApply(images: StudioImage[]) {
    setUploadingImages(true)
    setSaveError(null)
    try {
      const urls = await Promise.all(images.map(async (image) => {
        if (!image.image.startsWith("data:")) return image.image
        const cachedUrl = studioUploadCacheRef.current.get(image.image)
        if (cachedUrl) return cachedUrl
        const { url } = await uploadProductImage(studioDataUrlToFile(image))
        studioUploadCacheRef.current.set(image.image, url)
        return url
      }))
      setForm((current) => ({
        ...current,
        images: urls,
        image: urls[0] ?? "",
      }))
    } catch (error: unknown) {
      console.error("[ProductFormModal] Error uploading edited product image:", error)
      setSaveError("Les photos modifiées n’ont pas pu être envoyées. Réessayez depuis le Studio photo.")
    } finally {
      setUploadingImages(false)
    }
  }

  async function handleClose() {
    if (uploadingImages) {
      setSaveError("Attendez la fin de l’envoi des photos avant de fermer.")
      return
    }
    if (!isDraft) {
      onClose()
      return
    }

    const input = buildInput()
    if (!isValidDraftInput(input, form.price, form.stock)) {
      onClose()
      return
    }
    if (categoryDetailsLoading || categoryDetailsError || categoryDetails?.id !== form.categoryId) {
      setSaveError("Attendez le chargement des caractéristiques de la catégorie avant de fermer le brouillon.")
      return
    }

    setSaving(true)
    setSaveError(null)
    try {
      await saveQueueRef.current
      if (lastSavedPayloadRef.current !== JSON.stringify(input)) {
        const savedProduct = await onAutoSave(input, draftIdRef.current)
        draftIdRef.current = savedProduct.id
        lastSavedPayloadRef.current = JSON.stringify(input)
      }
    } catch {
      setSaveError("Le brouillon n’a pas pu être sauvegardé. Vous pouvez réessayer avant de fermer.")
      return
    } finally {
      setSaving(false)
    }
    onClose()
  }

  return createPortal((
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-xs animate-fade-in"
        onClick={() => void handleClose()}
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
            onClick={() => void handleClose()}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/40 p-4 sm:flex-row sm:items-center">
            <ProductImage
              src={form.image}
              alt="Aperçu de la photo principale"
              className="w-16 h-16 rounded-xl object-cover border border-border shrink-0 bg-card"
            />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Photos du produit</p>
                <p className="text-xs text-muted-foreground">Les fichiers sont envoyés au stockage avant d’être associés au produit.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className={`inline-flex min-h-9 cursor-pointer items-center rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted ${uploadingImages ? "pointer-events-none opacity-50" : ""}`}>
                  {uploadingImages ? "Envoi…" : "Importer des photos"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingImages}
                    className="sr-only"
                    onChange={(event) => {
                      void handleImageFiles(event.currentTarget.files)
                      event.currentTarget.value = ""
                    }}
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImages || form.images.length === 0}
                  onClick={() => setShowImageStudio(true)}
                >
                  Ouvrir le Studio photo
                </Button>
              </div>
              {form.images.length > 0 && <div className="flex gap-2 overflow-x-auto pb-1">
                {form.images.map((src, index) => <div key={`${index}-${src.slice(0, 24)}`} className="relative h-14 w-14 shrink-0">
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, image: src }))}
                    className={`h-full w-full overflow-hidden rounded-lg border-2 ${form.image === src ? "border-primary" : "border-border"}`}
                    aria-label={`Choisir la photo ${index + 1} comme photo principale`}
                  >
                    <ProductImage src={src} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((current) => {
                      const images = current.images.filter((_, itemIndex) => itemIndex !== index)
                      return { ...current, images, image: current.image === src ? images[0] ?? "" : current.image }
                    })}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"
                    aria-label={`Supprimer la photo ${index + 1}`}
                  >
                    <X size={12} />
                  </button>
                </div>)}
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
                  value={form.categoryId}
                  onChange={(e) => setForm((current) => ({ ...current, categoryId: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Caractéristiques de la catégorie</p>
                <p className="text-xs text-muted-foreground">Les champs requis sont fournis par la catégorie sélectionnée.</p>
              </div>
              {categoryDetailsLoading && <p role="status" className="text-xs text-muted-foreground">Chargement des caractéristiques…</p>}
              {categoryDetailsError && (
                <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-900">
                  <span>{categoryDetailsError}</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => setCategoryRetry((retry) => retry + 1)}>
                    Réessayer
                  </Button>
                </div>
              )}
              {categoryAttributes.map((attribute) => (
                <div key={attribute.key}>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    {attribute.label}{attribute.required ? " *" : ""}
                  </label>
                  <input
                    required={attribute.required}
                    value={form.specs[attribute.key] ?? ""}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      specs: { ...current.specs, [attribute.key]: event.target.value },
                    }))}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
              {!categoryDetailsLoading && !categoryDetailsError && categoryDetails && categoryAttributes.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucune caractéristique supplémentaire pour cette catégorie.</p>
              )}
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
                  setForm({ ...form, status: e.target.value as productStatus })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none cursor-pointer"
              >
                <option value="active">Actif (En ligne)</option>
                <option value="inactive">Inactif (Masqué)</option>
              </select>
            </div>
          </div>

          {saveError && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900">{saveError}</div>}
          {isDraft && <p role="status" className="text-xs text-muted-foreground">
            {autoSaveStatus === "saving" ? "Sauvegarde du brouillon…" : autoSaveStatus === "saved" ? "Brouillon sauvegardé automatiquement" : autoSaveStatus === "error" ? "Échec de la sauvegarde automatique. Modifiez un champ pour réessayer." : "Le brouillon sera sauvegardé dès que les champs requis seront remplis."}
          </p>}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="md" disabled={saving || uploadingImages} onClick={() => void handleClose()}>
              {isDraft ? "Fermer" : "Annuler"}
            </Button>
            {isDraft ? (
            <Button variant="primary" size="md" type="button" disabled={saving || uploadingImages || categoryDetailsLoading || Boolean(categoryDetailsError) || categoryDetails?.id !== form.categoryId || !requiredAttributesComplete || !draftId || autoSaveStatus !== "saved"} onClick={() => void handleSubmitReview()}>
                {saving ? "Soumission…" : "Soumettre à la revue"}
              </Button>
            ) : (
            <Button variant="primary" size="md" type="submit" disabled={saving || uploadingImages || categoryDetailsLoading || Boolean(categoryDetailsError) || categoryDetails?.id !== form.categoryId || !requiredAttributesComplete}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            )}
          </div>
        </form>
      </div>
      {showImageStudio && (
        <Suspense fallback={<div role="status" className="fixed inset-0 z-[70] flex items-center justify-center bg-background text-sm text-muted-foreground">Chargement du Studio photo…</div>}>
          <NovaMarketStudio
            images={form.images}
            name={form.name}
            onApply={(images) => void handleStudioApply(images)}
            onClose={() => setShowImageStudio(false)}
          />
        </Suspense>
      )}
    </div>
  ), document.body)
}

const Products = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Toutes")
  const [showDrafts, setShowDrafts] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [page, setPage] = useState(1)
  const [localProducts, setLocalProducts] = useState<ProductRow[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<ProductRow | undefined>()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const PAGE_SIZE = 8
  const productQueryKey = `${search}\u0000${categoryFilter}\u0000${showDrafts}`
  const productQueryKeyRef = useRef(productQueryKey)

  useEffect(() => {
    productQueryKeyRef.current = productQueryKey
  }, [productQueryKey])

  const availableCategories = [{ id: "Toutes", name: "Toutes" }, ...categories]

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAllProducts(
        page,
        PAGE_SIZE,
        undefined,
        showDrafts ? "draft" : undefined,
        search || undefined,
        categoryFilter === "Toutes" ? undefined : categoryFilter,
      )
      setLocalProducts(result.data.map(toProductRow))
      setTotalProducts(result.meta.total)
      return true
    } catch {
      setError("Les produits n’ont pas pu être chargés. Vérifiez votre connexion puis réessayez.")
      return false
    } finally {
      setLoading(false)
    }
  }, [page, search, categoryFilter, showDrafts])

  useEffect(() => { void loadProducts() }, [loadProducts])

  const loadMoreProducts = async () => {
    if (loadingMore || localProducts.length >= totalProducts) return
    const queryKey = productQueryKey
    const nextPage = page + 1
    setLoadingMore(true)
    setError(null)
    try {
      const result = await getAllProducts(
        nextPage,
        PAGE_SIZE,
        undefined,
        showDrafts ? "draft" : undefined,
        search || undefined,
        categoryFilter === "Toutes" ? undefined : categoryFilter,
      )
      if (productQueryKeyRef.current !== queryKey) return
      setLocalProducts((current) => [...current, ...result.data.map(toProductRow)])
      setTotalProducts(result.meta.total)
      setPage(nextPage)
    } catch {
      if (productQueryKeyRef.current === queryKey) {
        setError("Les produits suivants n’ont pas pu être chargés. Réessayez.")
      }
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategoryError("Les catégories n’ont pas pu être chargées."))
  }, [])

  useEffect(() => {
    if (showDrafts) setViewMode("table")
  }, [showDrafts])

  useEffect(() => {
    const productId = searchParams.get("edit")
    if (!productId) return
    let active = true
    getProductById(productId).then((product) => {
      if (!active) return
      setEditProduct(toProductRow(product))
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }).catch(() => {
      if (active) setError("Le produit à modifier n’a pas pu être chargé.")
    })
    return () => { active = false }
  }, [searchParams, setSearchParams])

  const showNotification = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = localProducts
  const paginated = localProducts

  const handleAutoSaveProduct = useCallback(async (data: ProductInput, id?: string) => {
    const saved = id ? await updateProduct(id, data) : await createProduct(data)
    const savedRow = toProductRow(saved)
    setLocalProducts((current) => {
      const index = current.findIndex((product) => product.id === saved.id)
      if (index >= 0) {
        return current.map((product) => product.id === saved.id ? savedRow : product)
      }
      if (page !== 1 || (showDrafts && saved.moderationStatus !== "draft")) return current
      if (categoryFilter !== "Toutes" && saved.categoryId !== categoryFilter) return current
      if (search && !saved.name.toLowerCase().includes(search.toLowerCase())) return current
      return [savedRow, ...current].slice(0, PAGE_SIZE)
    })
    if (!id) setTotalProducts((total) => total + 1)
    return saved
  }, [page, showDrafts, categoryFilter, search])

  async function handleSaveProduct(data: ProductInput) {
    if (editProduct) await updateProduct(editProduct.id, data)
    setShowForm(false)
    setEditProduct(undefined)
    showNotification("Produit mis à jour avec succès")
    await loadProducts()
  }

  async function handleSubmitReview(id: string) {
    await submitProductForReview(id)
    showNotification("Produit soumis à la revue")
    await loadProducts()
  }

  async function handleDeleteProduct(id: string) {
    setDeleteLoading(true)
    setError(null)
    try {
      await deleteProduct(id)
      setDeleteTargetId(null)
      await loadProducts()
      showNotification("Produit retiré du catalogue")
    } catch {
      setError("Le produit n’a pas pu être supprimé. Réessayez.")
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleToggleStatus(product: ProductRow) {
    setError(null)
    try {
      const currentProduct = await getProductById(product.id)
      await updateProductStatus(currentProduct, product.status === "active" ? "inactive" : "active")
      await loadProducts()
    } catch {
      setError("Le statut du produit n’a pas pu être modifié.")
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      
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
              onChange={(mode) => { setViewMode(mode); setPage(1) }}
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
      {error && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">{error}</div>}
      {categoryError && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">{categoryError}</div>}
      {loading && <div role="status" aria-live="polite" className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Chargement des produits…</div>}

      
      <div data-tour="products-search" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-xs">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder={t("products.searchPlaceholder")}
          className="max-w-md w-full"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={!showDrafts}
            onClick={() => { setShowDrafts(false); setCategoryFilter("Toutes"); setPage(1) }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${!showDrafts ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
          >
            Tous
          </button>
          <button
            type="button"
            aria-pressed={showDrafts}
            onClick={() => { setShowDrafts(true); setCategoryFilter("Toutes"); setPage(1) }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${showDrafts ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
          >
            Brouillons
          </button>
        </div>

        <div data-tour="products-categories" className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {availableCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => { setCategoryFilter(category.id); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === category.id
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      
      {loading ? null : viewMode === "grid" ? (
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

                      {product.moderationStatus === "approved" && (
                        <button
                          title={product.status === "active" ? "Désactiver" : "Activer"}
                          onClick={() => void handleToggleStatus(product)}
                          className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {product.status === "active" ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}

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

            {localProducts.length < totalProducts && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  size="md"
                  loading={loadingMore}
                  disabled={loadingMore}
                  onClick={() => void loadMoreProducts()}
                >
                  Charger plus de produits
                </Button>
              </div>
            )}
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
                          {product.moderationStatus === "draft" && <Badge variant="neutral">Brouillon</Badge>}
                          {product.moderationStatus === "pending" && <Badge variant="warning">En revue</Badge>}
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
                        {product.moderationStatus === "draft" && (
                          <Button size="sm" variant="primary" onClick={() => void handleSubmitReview(product.id)}>
                            Soumettre à la revue
                          </Button>
                        )}
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
                total={totalProducts}
                pageSize={PAGE_SIZE}
                onChange={setPage}
              />
            </>
          )}
        </Card>
      )}

      
      {showForm && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
          onAutoSave={handleAutoSaveProduct}
          onSubmitReview={handleSubmitReview}
          onSave={handleSaveProduct}
          onClose={() => { setShowForm(false); setEditProduct(undefined) }}
        />
      )}

      
      {deleteTargetId && (
        <ConfirmModal
          title="Supprimer ce produit ?"
          message="Cette action retirera le produit de votre vitrine. Cette opération est irréversible."
          danger
          confirmLabel={deleteLoading ? "Suppression…" : "Oui, supprimer"}
          onConfirm={() => void handleDeleteProduct(deleteTargetId)}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}

      
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
};
export default Products
