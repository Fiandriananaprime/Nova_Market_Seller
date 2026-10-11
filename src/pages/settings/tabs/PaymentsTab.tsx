import { useState } from "react"
import { useNavigate } from "react-router"
import {
  CreditCard,
  Building2,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  Zap,
  Download,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Badge,
} from "@/components/ui"

export function PaymentsTab({
  showToast,
}: {
  showToast: (msg: string) => void
}) {
  const [payoutSchedule, setPayoutSchedule] = useState("weekly")
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      {/* 13. Paiements et Versements Mobile Money & Banque */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-primary" />
            <div>
              <CardTitle>13 · Comptes de Reversement Financier (Mobile Money & Banque)</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Comptes destinataires pour le virement automatique de vos revenus de vente
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast("Formulaire de liaison ouvert")}
          >
            <Plus size={13} />
            Ajouter un compte
          </Button>
        </CardHeader>
        <CardBody className="space-y-3.5">
          {/* Telma Mvola */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                MVola
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">
                    Telma MVola (+261 34 00 000 00)
                  </p>
                  <Badge variant="success">Principal</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reversements directs sans frais de transfert inter-opérateurs
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast("Paramètres MVola modifiés")}
            >
              Modifier
            </Button>
          </div>

          {/* Orange Money */}
          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                OM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">
                    Orange Money (+261 32 11 222 33)
                  </p>
                  <Badge variant="neutral">Connecté</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Compte secondaire de secours
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast("Paramètres Orange Money modifiés")}
            >
              Modifier
            </Button>
          </div>

          {/* Airtel Money */}
          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                AM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">
                    Airtel Money (+261 33 44 555 66)
                  </p>
                  <Badge variant="neutral">Connecté</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Compte d'appoint disponible
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast("Paramètres Airtel Money modifiés")}
            >
              Modifier
            </Button>
          </div>

          {/* BNI Bank */}
          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Virement Bancaire (BNI Madagascar)
                </p>
                <p className="text-xs text-muted-foreground">
                  RIB : 00004 00210 12345678901 22 · Titulaire : Nova Distribution
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast("RIB BNI modifié")}
            >
              Modifier
            </Button>
          </div>

          <div className="pt-2 border-t border-border/60">
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Périodicité des reversements automatiques
            </label>
            <select
              value={payoutSchedule}
              onChange={(e) => {
                setPayoutSchedule(e.target.value)
                showToast("Fréquence de reversement enregistrée")
              }}
              className="w-full sm:w-80 px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none cursor-pointer"
            >
              <option value="weekly">Chaque lundi matin (Hebdomadaire)</option>
              <option value="biweekly">Tous les 15 jours</option>
              <option value="monthly">Le 1er de chaque mois</option>
              <option value="daily">Quotidien (Automatique dès 50 000 Ar)</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* 22. Abonnement et Services Nova Seller */}
      <Card className="border-purple-500/30">
        <CardHeader className="bg-purple-500/5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-600" />
            <div>
              <CardTitle className="text-purple-600">
                22 · Abonnement & Services Nova Seller
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Formule commerciale et conditions tarifaires de la place de marché
              </p>
            </div>
          </div>
          <Badge variant="purple">Nova Pro Actif</Badge>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-card via-purple-500/5 to-purple-500/10 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-xl text-foreground">
                  Plan Nova Pro Vendeur
                </h3>
                <span className="text-xs font-bold text-purple-600 bg-purple-500/15 px-2.5 py-0.5 rounded-full">
                  120 000 Ar / mois
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Commission réduite à <strong className="text-foreground">5.0%</strong> par vente validée (au lieu de 8.0% sur le forfait Starter).
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 flex-wrap">
                <span className="flex items-center gap-1 text-foreground">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Produits illimités
                </span>
                <span className="flex items-center gap-1 text-foreground">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Badge Vendeur Pro vérifié
                </span>
                <span className="flex items-center gap-1 text-foreground">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Support prioritaire WhatsApp
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast("Facture du mois précédent téléchargée")}
              >
                <Download size={13} />
                Dernière facture
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/subscription")}
              >
                Changer de formule
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
