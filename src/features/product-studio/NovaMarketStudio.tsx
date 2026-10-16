import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ArrowLeft, Check, ImagePlus, Save, X } from "lucide-react"
import { exportDesign } from "@/features/product-studio/canvas/engine/compositor"
import CanvasApp from "@/features/product-studio/canvas/App"
import { useDesignStore } from "@/features/product-studio/canvas/store/useDesignStore"
import { useRouterStore } from "@/features/product-studio/canvas/store/useRouterStore"
import type { DesignDocument } from "@/features/product-studio/canvas/types/design"
import "@/features/product-studio/canvas/canvas.css"

export interface StudioImage {
  id: string
  name: string
  image: string
}

interface NovaMarketStudioProps {
  images: string[]
  name: string
  onApply: (images: StudioImage[]) => void
  onClose: () => void
}

const readImage = (file: Blob):Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Impossible de lire cette image."))
    reader.onerror = () => reject(new Error("Impossible de lire cette image."))
    reader.readAsDataURL(file)
  })
};

const toFrame = (document: DesignDocument) => {
  return {
    name: document.name,
    width: document.format.width,
    height: document.format.height,
    format: document.format,
    layers: document.layers,
    autoLayouts: document.autoLayouts,
  }
};

const NovaMarketStudio = ({ images, name, onApply, onClose }: NovaMarketStudioProps) => {
  const [assets, setAssets] = useState<StudioImage[]>(() => images.map((image, index) => ({ id: `product-photo-${index}`, image, name: `${name || "Photo"} ${index + 1}` })))
  const [activeId, setActiveId] = useState(() => `product-photo-0`)
  const [savedImages, setSavedImages] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const documentsRef = useRef(new Map<string, DesignDocument>())
  const activeIdRef = useRef(activeId)
  const loadingRef = useRef(false)
  const savedImagesRef = useRef(savedImages)

  useEffect(() => {
    savedImagesRef.current = savedImages
  }, [savedImages])

  useEffect(() => {
    sessionStorage.setItem("novamarket-studio-image-editor", "1")
    useRouterStore.getState().navigate({ page: "editor-standalone" })
    const unsubscribe = useDesignStore.subscribe((state, previous) => {
      if (loadingRef.current || state.document === previous.document || !activeIdRef.current) return
      documentsRef.current.set(activeIdRef.current, structuredClone(state.document))
    })
    return () => {
      sessionStorage.removeItem("novamarket-studio-image-editor")
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const asset = assets.find((item) => item.id === activeId)
    if (!asset) return
    activeIdRef.current = asset.id
    const savedDocument = documentsRef.current.get(asset.id)
    if (savedDocument) {
      loadingRef.current = true
      useDesignStore.getState().loadFromFrame(toFrame(savedDocument))
      loadingRef.current = false
      return
    }
    window.dispatchEvent(new CustomEvent("novamarket-studio:open-image", { detail: { image: asset.image, name: asset.name } }))
  }, [activeId, assets])

  const saveAll = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      documentsRef.current.set(activeIdRef.current, structuredClone(useDesignStore.getState().document))
      const entries = await Promise.all(assets.map(async (asset) => {
        const document = documentsRef.current.get(asset.id)
        if (!document) return [asset.id, savedImagesRef.current[asset.id] ?? asset.image] as const
        const blob = await exportDesign(document, { format: "png", quality: 1, dpr: 2 })
        const image = await readImage(blob)
        return [asset.id, image] as const
      }))
      const next = Object.fromEntries(entries)
      savedImagesRef.current = next
      setSavedImages(next)
      return next
    } catch {
      setError("Une photo n’a pas pu être exportée. Importez son fichier original depuis votre appareil, puis réessayez.")
      return null
    } finally {
      setSaving(false)
    }
  }, [assets])

  const handleSave = async () => {
    const result = await saveAll()
    if (result) onApply(assets.map((asset) => ({ ...asset, image: result[asset.id] ?? asset.image })))
  }

  const handleBack = async () => {
    const result = await saveAll()
    if (!result) return
    onApply(assets.map((asset) => ({ ...asset, image: result[asset.id] ?? asset.image })))
    onClose()
  }

  const handleAddFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setError(null)
    try {
      const added = await Promise.all(Array.from(files).map(async (file, index) => ({
        id: `photo-${crypto.randomUUID()}-${index}`,
        name: file.name.replace(/\.[^.]+$/, "") || "Photo produit",
        image: await readImage(file),
      })))
      setAssets((current) => [...current, ...added])
      setActiveId(added[0].id)
    } catch {
      setError("Impossible de lire un des fichiers sélectionnés. Choisissez des images JPG, PNG ou WebP.")
    }
  }

  return createPortal(
    <div className="nova-market-studio fixed inset-0 z-[70] flex flex-col bg-background" role="dialog" aria-modal="true" aria-label="Studio photo NovaMarket">
      <header className="flex min-h-16 flex-wrap items-center gap-3 border-b border-border bg-card px-3 py-2 sm:px-5">
        <button type="button" onClick={handleBack} disabled={saving} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50">
          <ArrowLeft size={17} /> Retour au produit
        </button>
        <div className="hidden min-w-0 sm:block"><p className="truncate text-sm font-semibold">Studio photo</p><p className="truncate text-xs text-muted-foreground">{name || "Photos du produit"} · {assets.length} photo{assets.length > 1 ? "s" : ""}</p></div>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1" role="tablist" aria-label="Photos à modifier">
          {assets.map((asset, index) => <button key={asset.id} type="button" role="tab" aria-selected={activeId === asset.id} onClick={() => setActiveId(asset.id)} title={asset.name} className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 ${activeId === asset.id ? "border-primary" : "border-border"}`}>
            <img src={savedImages[asset.id] ?? asset.image} alt={`Photo ${index + 1} : ${asset.name}`} className="h-full w-full object-cover" />
            {savedImages[asset.id] && <span className="absolute bottom-0.5 right-0.5 rounded-full bg-emerald-600 p-0.5 text-white"><Check size={10}/></span>}
          </button>)}
        </div>
        <label className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium hover:bg-muted" title="Importer une image">
          <ImagePlus size={16}/><span className="hidden md:inline">Importer une image</span>
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => { void handleAddFiles(event.currentTarget.files); event.currentTarget.value = "" }} />
        </label>
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">
          {saving ? <span>Enregistrement…</span> : <><Save size={16}/> Enregistrer toutes les photos</>}
        </button>
        <button type="button" onClick={onClose} aria-label="Fermer le studio" title="Fermer sans enregistrer" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"><X size={18}/></button>
      </header>
      {error && <p role="alert" className="border-b border-amber-300 bg-amber-50 px-5 py-2.5 text-sm text-amber-900">{error}</p>}
      <div className="nova-market-studio__canvas min-h-0 flex-1 overflow-hidden"><CanvasApp /></div>
    </div>,
    document.body,
  )
};
export default NovaMarketStudio;
