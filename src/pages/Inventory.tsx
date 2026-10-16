import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AlertTriangle,
  Package,
  Plus,
  Minus,
  CheckCircle2,
  SlidersHorizontal,
  TrendingDown,
  Warehouse,
} from "lucide-react"

import { getInventory, updateInventory } from "@/service/inventory"
import type { InventoryItem } from "@/type/inventory"
import { useStore } from "@/context/useStore"
import {
  PageHeader,
  Button,
  SearchInput,
  InventoryBadge,
  EmptyState,
  Card,
  Toast,
  Badge,
} from "@/components/ui"

const Inventory = () => {
  const { t } = useTranslation()
  const { selectedStore, loading: storeLoading } = useStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null)
  const [savingProductId, setSavingProductId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ stock: number; threshold: number }>({
    stock: 0,
    threshold: 10,
  })

  useEffect(() => {
    if (storeLoading) return
    let active = true
    setLoading(true)
    setError(null)
    getInventory(selectedStore?.id).then(({ data }) => {
      if (active) setItems(data)
    }).catch(() => {
      if (active) setError("L’inventaire n’a pas pu être chargé. Vérifiez votre connexion puis réessayez.")
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [selectedStore?.id, storeLoading])

  const showNotification = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

                                 
  const totalStockUnits = items.reduce((sum, i) => sum + i.stock, 0)
  const outOfStockItems = items.filter((i) => i.status === "out_of_stock")
  const lowStockItems = items.filter((i) => i.status === "low_stock")
  const normalStockItems = items.filter((i) => i.status === "in_stock")

           
  const filtered = items.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      statusFilter === "all" ||
      i.status === statusFilter ||
      (statusFilter === "critical" && (i.status === "low_stock" || i.status === "out_of_stock"))
    return matchSearch && matchStatus
  })

                                    
  async function saveAdjustment(item: InventoryItem, stock: number, threshold: number) {
    const adjustment = { stock: Math.max(0, stock), threshold: Math.max(1, threshold) }
    setSavingProductId(item.productId)
    setAdjustmentError(null)
    try {
      await updateInventory(item.productId, adjustment)
      setItems((prev) => prev.map((current) => {
        if (current.productId !== item.productId) return current
        const available = Math.max(0, adjustment.stock - current.reserved)
        const status = adjustment.stock === 0
          ? "out_of_stock"
          : adjustment.stock <= adjustment.threshold ? "low_stock" : "in_stock"
        return { ...current, ...adjustment, available, status }
      }))
      showNotification("Paramètres de stock enregistrés")
      return true
    } catch {
      setAdjustmentError("La mise à jour du stock a échoué. Réessayez.")
      return false
    } finally {
      setSavingProductId(null)
    }
  }

  async function handleQuickStep(item: InventoryItem, delta: number) {
    await saveAdjustment(item, item.stock + delta, item.threshold)
  }

  async function handleSaveAdjustment(item: InventoryItem) {
    if (await saveAdjustment(item, editValues.stock, editValues.threshold)) {
      setEditingItemId(null)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <PageHeader
        title={t("inventory.title")}
        subtitle={t("inventory.subtitle")}
        badge={
          <Badge variant="primary" dot>
            {items.length} {t("inventory.totalSku").toLowerCase()}
          </Badge>
        }
      />

      {error && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">{error}</div>}
      {adjustmentError && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">{adjustmentError}</div>}
      {loading && <div role="status" aria-live="polite" className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Chargement de l’inventaire…</div>}

      
      {!loading && !error && <div data-tour="inventory-radar" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Unités</p>
            <p className="font-display font-extrabold text-2xl text-foreground mt-1 tabular-nums">
              {totalStockUnits.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Sur {items.length} références</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Warehouse size={18} />
          </div>
        </div>

        
        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Stock Sain</p>
            <p className="font-display font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              {normalStockItems.length}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              {items.length ? Math.round((normalStockItems.length / items.length) * 100) : 0}% du catalogue
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
        </div>

        
        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Stock Faible</p>
            <p className="font-display font-extrabold text-2xl text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
              {lowStockItems.length}
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
              Sous le seuil d'alerte
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
        </div>

        
        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Ruptures</p>
            <p className="font-display font-extrabold text-2xl text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
              {outOfStockItems.length}
            </p>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 font-medium">
              Ventes bloquées
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown size={18} />
          </div>
        </div>
      </div>}

      
      {!loading && !error && <><div data-tour="inventory-filters" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-xs">
        <SearchInput
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Rechercher par nom de produit, SKU..."
          className="max-w-md w-full"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Tous ({items.length})
          </button>

          <button
            onClick={() => setStatusFilter("critical")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "critical"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-600 hover:bg-amber-500/10"
            }`}
          >
            Alertes Prioritaires ({lowStockItems.length + outOfStockItems.length})
          </button>

          <button
            onClick={() => setStatusFilter("low_stock")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "low_stock"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Stock Faible ({lowStockItems.length})
          </button>

          <button
            onClick={() => setStatusFilter("out_of_stock")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "out_of_stock"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            En Rupture ({outOfStockItems.length})
          </button>
        </div>
      </div>

      
      <div data-tour="inventory-items-grid" className="space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Package size={22} />}
              title="Aucune référence correspondante"
              description="Modifiez vos filtres ou effectuez une autre recherche."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item, index) => {
              const isEditing = editingItemId === item.productId
              const stockRatio = Math.min(100, Math.round((item.stock / Math.max(item.threshold * 2, 20)) * 100))

              return (
                <div
                  key={item.productId}
                  className={`bg-card rounded-2xl border transition-all p-5 shadow-xs space-y-4 ${
                    item.status === "out_of_stock"
                      ? "border-rose-500/40 bg-gradient-to-br from-card to-rose-500/5"
                      : item.status === "low_stock"
                      ? "border-amber-500/40 bg-gradient-to-br from-card to-amber-500/5"
                      : "border-border/80 hover:border-border"
                  }`}
                >
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          {item.sku}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-sm text-foreground mt-1 truncate">
                        {item.name}
                      </h3>
                    </div>

                    <InventoryBadge status={item.status} />
                  </div>

                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Jauge de disponibilité :</span>
                      <span className="font-bold text-foreground tabular-nums">
                        {item.available} disponibles / {item.stock} au total
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === "out_of_stock"
                            ? "w-0"
                            : item.status === "low_stock"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${item.status === "out_of_stock" ? 0 : Math.max(10, stockRatio)}%` }}
                      />
                    </div>
                  </div>

                  
                  {isEditing ? (
                    <div className="p-3.5 rounded-xl bg-muted/60 border border-border/80 space-y-3 animate-fade-in">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="font-semibold text-foreground mb-1 block">
                            Quantité en stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editValues.stock}
                            onChange={(e) =>
                              setEditValues({ ...editValues, stock: Number(e.target.value) })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-foreground mb-1 block">
                            Seuil d'alerte bas
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editValues.threshold}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                threshold: Number(e.target.value),
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingItemId(null)}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={savingProductId === item.productId}
                          onClick={() => void handleSaveAdjustment(item)}
                        >
                          Valider
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      
                      <div
                        data-tour={index === 0 ? "inventory-steppers" : undefined}
                        className="flex items-center gap-1.5"
                      >
                        <span className="text-xs text-muted-foreground mr-1">Ajuster:</span>
                        <button
                          title="Retirer 1 unité"
                          disabled={item.stock === 0 || savingProductId === item.productId}
                          onClick={() => void handleQuickStep(item, -1)}
                          className="w-7 h-7 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-foreground tabular-nums">
                          {item.stock}
                        </span>
                        <button
                          title="Ajouter 1 unité"
                          disabled={savingProductId === item.productId}
                          onClick={() => void handleQuickStep(item, 1)}
                          className="w-7 h-7 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingProductId === item.productId}
                        onClick={() => {
                          setEditingItemId(item.productId)
                          setEditValues({
                            stock: item.stock,
                            threshold: item.threshold,
                          })
                        }}
                      >
                        <SlidersHorizontal size={13} />
                        Configurer le seuil
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      </>}

      
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
};
export default Inventory
