import { useState } from "react"
import {
  Truck,
  RotateCcw,
  MapPin,
  Clock,
  ShieldAlert,
  Save,
  Check,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Badge,
} from "@/components/ui"

export function ShippingReturnsTab({
  showToast,
}: {
  showToast: (msg: string) => void
}) {
  const [rates, setRates] = useState({
    zone1: 4000,
    zone2: 7000,
    zone3: 15000,
    freeShippingThreshold: 150000,
    handlingTimeHours: 24,
    returnWindowDays: 7,
    returnShippingPayer: "seller_if_defective",
    disputePolicy: "Médiation Nova Market sous 48h ouvrées. Remboursement intégral si produit non conforme ou colis endommagé.",
  })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    showToast("Paramètres de livraison et politiques de retour enregistrés")
  }

  return (
    <div className="space-y-6">
      {/* 11. Livraison et Expédition par Zones */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-primary" />
            <div>
              <CardTitle>11 · Livraison, Expédition & Grille Tarifaire (Madagascar)</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configurez vos frais de port par zone géographique et délais moyens de dispatch
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Zone 1 : Tana intra-muros</span>
                  <Badge variant="success">Standard</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Analakely, Ankorondrano, Ivandry, Isoraka, Ambohijatovo
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={rates.zone1}
                    onChange={(e) =>
                      setRates({ ...rates, zone1: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-card text-foreground"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">Ar</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Délai estimé : 2 à 6 heures</span>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Zone 2 : Grand Tana / Périphérie</span>
                  <Badge variant="primary">Express</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Ivato, Ambohimanarina, Tanjombato, Talatamaty, By-Pass
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={rates.zone2}
                    onChange={(e) =>
                      setRates({ ...rates, zone2: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-card text-foreground"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">Ar</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Délai estimé : 24 heures (J+1)</span>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Zone 3 : Provinces & Régions</span>
                  <Badge variant="neutral">Expédition</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Tamatave, Majunga, Diego, Antsirabe, Tuléar (via coopératives)
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={rates.zone3}
                    onChange={(e) =>
                      setRates({ ...rates, zone3: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-card text-foreground"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">Ar</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Délai estimé : 2 à 4 jours ouvrés</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Seuil pour Livraison Offerte (Ar)
                </label>
                <input
                  type="number"
                  value={rates.freeShippingThreshold}
                  onChange={(e) =>
                    setRates({
                      ...rates,
                      freeShippingThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none"
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Offrir automatiquement les frais de port si le panier dépasse ce montant
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Délai moyen de préparation de commande
                </label>
                <select
                  value={rates.handlingTimeHours}
                  onChange={(e) =>
                    setRates({
                      ...rates,
                      handlingTimeHours: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none cursor-pointer"
                >
                  <option value={12}>Moins de 12 heures ouvrées (Ultra-rapide)</option>
                  <option value={24}>24 heures ouvrées (Recommandé)</option>
                  <option value={48}>48 heures ouvrées</option>
                  <option value={72}>3 jours ouvrés (Articles artisanaux sur commande)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm">
                Enregistrer la grille de livraison
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* 12. Retours et Remboursements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-amber-600" />
            <div>
              <CardTitle>12 · Retours, Rétractations & Remboursements</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Règles de prise en charge et de médiation lors de réclamations d'acheteurs
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Délai accordé pour une demande de retour
              </label>
              <select
                value={rates.returnWindowDays}
                onChange={(e) =>
                  setRates({
                    ...rates,
                    returnWindowDays: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none cursor-pointer"
              >
                <option value={7}>7 jours après réception du colis (Standard)</option>
                <option value={14}>14 jours après réception du colis</option>
                <option value={30}>30 jours (Engagement confiance)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Prise en charge des frais de retour
              </label>
              <select
                value={rates.returnShippingPayer}
                onChange={(e) =>
                  setRates({
                    ...rates,
                    returnShippingPayer: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none cursor-pointer"
              >
                <option value="seller_if_defective">
                  Vendeur si défectueux / Acheteur si changement d'avis
                </option>
                <option value="always_seller">Toujours pris en charge par le vendeur</option>
                <option value="always_buyer">Toujours à la charge de l'acheteur</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Protocole de médiation et de résolution des litiges
            </label>
            <textarea
              rows={3}
              value={rates.disputePolicy}
              onChange={(e) =>
                setRates({ ...rates, disputePolicy: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast("Politique de retour enregistrée")}
            >
              Sauvegarder les politiques de retour
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
