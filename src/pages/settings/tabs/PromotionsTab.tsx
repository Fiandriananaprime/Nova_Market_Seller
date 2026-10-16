import { useEffect, useState } from "react"
import {
  Tag,
  Percent,
  Plus,
  Trash2,
  Copy,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Badge,
} from "@/components/ui"
import { formatMGA } from "@/hook/format"
import {
  createSellerPromotion,
  deleteSellerPromotion,
  getSellerPromotions,
} from "@/service/seller"
import type { SellerPromotion } from "@/type/seller"

interface PromoCode {
  id: string
  code: string
  discountType: "percent" | "fixed"
  value: number
  minSpend: number
  expiresAt: string
  usageCount: number
  active: boolean
}

const mapPromotion = (promotion: SellerPromotion):PromoCode => {
  return {
    id: promotion.id,
    code: promotion.code ?? promotion.name,
    discountType: promotion.type === "percentage" ? "percent" : "fixed",
    value: promotion.discount,
    minSpend: promotion.minimumOrderAmount ?? 0,
    expiresAt: promotion.endDate,
    usageCount: promotion.usedCount ?? 0,
    active: promotion.status === "active",
  }
};

export const PromotionsTab = ({
  showToast,
}: {
  showToast: (msg: string) => void
}) => {
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newPromo, setNewPromo] = useState({
    code: "",
    discountType: "percent" as "percent" | "fixed",
    value: 10,
    minSpend: 40000,
    expiresAt: "2026-12-31",
  })

  useEffect(() => {
    getSellerPromotions()
      .then((items) => setPromos(items.map(mapPromotion)))
      .catch(() => setError("Impossible de charger les codes promotionnels."))
      .finally(() => setLoading(false))
  }, [])

  async function handleAddPromo(e: React.FormEvent) {
    e.preventDefault()
    if (!newPromo.code || saving) return
    setSaving(true)
    setError(null)
    try {
      const created = await createSellerPromotion({
        name: newPromo.code.toUpperCase().trim(),
        type: newPromo.discountType === "percent" ? "percentage" : "fixed",
        discount: Number(newPromo.value),
        startDate: new Date().toISOString().slice(0, 10),
        endDate: newPromo.expiresAt,
      })
      setPromos((current) => [mapPromotion(created), ...current])
      setShowAddForm(false)
      setNewPromo({
        code: "",
        discountType: "percent",
        value: 10,
        minSpend: 40000,
        expiresAt: "2026-12-31",
      })
      showToast(`Promotion ${created.code ?? created.name} créée.`)
    } catch {
      setError("Impossible de créer cette promotion.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeletePromo(id: string) {
    try {
      await deleteSellerPromotion(id)
      setPromos((prev) => prev.filter((promo) => promo.id !== id))
      showToast("Code promo supprimé.")
    } catch {
      setError("Impossible de supprimer ce code promotionnel.")
    }
  }

  return (
    <div className="space-y-6">
      {loading && <p role="status" className="text-xs text-muted-foreground">Chargement des promotions…</p>}
      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-primary" />
            <div>
              <CardTitle>16 · Promotions, Codes Réduction & Ventes Flash</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Stimulez vos ventes en créant des coupons personnalisés pour vos clients
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={13} />
            Créer un code promo
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          {showAddForm && (
            <form
              onSubmit={handleAddPromo}
              className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-4 animate-fade-in"
            >
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Nouveau Code Promotionnel
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Code (ex: NOEL20) *
                  </label>
                  <input
                    required
                    value={newPromo.code}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })
                    }
                    placeholder="NOEL20"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Type de remise
                  </label>
                  <select
                    value={newPromo.discountType}
                    onChange={(e) =>
                      setNewPromo({
                        ...newPromo,
                        discountType: e.target.value as "percent" | "fixed",
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground cursor-pointer"
                  >
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (Ariary)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Valeur de la réduction *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newPromo.value}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, value: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Panier minimum (Ar)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPromo.minSpend}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, minSpend: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Annuler
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={saving} disabled={saving}>
                  Activer le code promo
                </Button>
              </div>
            </form>
          )}

          
          <div className="divide-y divide-border/60 rounded-xl border border-border bg-card overflow-hidden">
            {!loading && promos.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">Aucune promotion enregistrée.</p>}
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-mono font-extrabold text-xs shrink-0">
                    {promo.discountType === "percent" ? (
                      `-${promo.value}%`
                    ) : (
                      <Percent size={16} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground tracking-wide">
                        {promo.code}
                      </span>
                      {promo.active ? (
                        <Badge variant="success">En cours</Badge>
                      ) : (
                        <Badge variant="neutral">Désactivé</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      {promo.discountType === "percent"
                        ? `Remise de ${promo.value}%`
                        : `Remise de ${formatMGA(promo.value)}`}{" "}
                      dès {formatMGA(promo.minSpend)} d'achat · Utilisé {promo.usageCount} fois
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(promo.code)
                      showToast(`Code ${promo.code} copié !`)
                    }}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                    title="Copier le code"
                  >
                    <Copy size={13} />
                  </button>
                  <Button
                    variant={promo.active ? "outline" : "primary"}
                    size="sm"
                    disabled
                    title="Le contrat PromotionInput ne permet pas de modifier le statut."
                  >
                    {promo.active ? "Désactivation indisponible" : "Activation indisponible"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => void handleDeletePromo(promo.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
