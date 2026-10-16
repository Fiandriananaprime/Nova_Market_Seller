import { useEffect, useState } from "react"
import {
  Building2,
  Receipt,
  ShieldCheck,
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
import { getSellerBusiness, updateSellerBusiness } from "@/service/seller"
import type { SellerBusiness } from "@/type/seller"

export const BusinessTab = ({
  showToast,
}: {
  showToast: (msg: string) => void
}) => {
  const [legalForm, setLegalForm] = useState({
    companyName: "", legalStatus: "", nif: "", stat: "", rcs: "", address: "", city: "", region: "",
    vatSubject: false, vatNumber: "", invoicePrefix: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSellerBusiness()
      .then((business) => {
        const fields = business as SellerBusiness & Record<string, unknown>
        setLegalForm((current) => ({
          ...current,
          companyName: typeof fields.companyName === "string" ? fields.companyName : business.name ?? "",
          legalStatus: typeof fields.legalStatus === "string" ? fields.legalStatus : "",
          nif: typeof fields.nif === "string" ? fields.nif : "",
          stat: typeof fields.stat === "string" ? fields.stat : "",
          rcs: typeof fields.rcs === "string" ? fields.rcs : "",
          address: typeof fields.address === "string" ? fields.address : business.location ?? "",
          city: typeof fields.city === "string" ? fields.city : "",
          region: typeof fields.region === "string" ? fields.region : "",
          vatSubject: typeof fields.vatSubject === "boolean" ? fields.vatSubject : false,
          vatNumber: typeof fields.vatNumber === "string" ? fields.vatNumber : "",
          invoicePrefix: typeof fields.invoicePrefix === "string" ? fields.invoicePrefix : "",
        }))
      })
      .catch(() => setError("Impossible de charger les informations professionnelles."))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await updateSellerBusiness({
        name: legalForm.companyName,
        location: legalForm.address,
      })
      showToast("Nom commercial et adresse enregistrés.")
    } catch {
      setError("Impossible d'enregistrer les informations professionnelles.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            <div>
              <CardTitle>5 · Informations Professionnelles (Madagascar)</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Identifiants officiels de votre entreprise auprès des administrations malgaches
              </p>
            </div>
          </div>
          <Badge variant="success" dot>
            Registre Actif
          </Badge>
        </CardHeader>
        <CardBody>
          {loading && <p role="status" className="mb-3 text-xs text-muted-foreground">Chargement des informations…</p>}
          {error && <p role="alert" className="mb-3 text-xs text-destructive">{error}</p>}
          <p className="mb-3 text-[11px] text-muted-foreground">Le contrat entreprise ne définit que le nom commercial et l’adresse ; les champs juridiques/fiscaux restent locaux.</p>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Raison sociale / Nom commercial *
                </label>
                <input
                  required
                  value={legalForm.companyName}
                  onChange={(e) =>
                    setLegalForm({ ...legalForm, companyName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Forme juridique
                </label>
                <select
                  value={legalForm.legalStatus}
                  onChange={(e) =>
                    setLegalForm({ ...legalForm, legalStatus: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none cursor-pointer"
                >
                  <option>SARLU (Société à Responsabilité Limitée Unipersonnelle)</option>
                  <option>SARL (Société à Responsabilité Limitée)</option>
                  <option>Entreprise Individuelle (Personne physique)</option>
                  <option>Coopérative Artisanale / Agricole</option>
                  <option>SA (Société Anonyme)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Numéro NIF (Identification Fiscale) *
                </label>
                <input
                  required
                  value={legalForm.nif}
                  onChange={(e) =>
                    setLegalForm({ ...legalForm, nif: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Numéro STAT (Statistique) *
                </label>
                <input
                  required
                  value={legalForm.stat}
                  onChange={(e) =>
                    setLegalForm({ ...legalForm, stat: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Numéro RCS (Registre du Commerce)
                </label>
                <input
                  value={legalForm.rcs}
                  onChange={(e) =>
                    setLegalForm({ ...legalForm, rcs: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Siège social / Adresse légale
                </label>
                <input
                  value={legalForm.address}
                  onChange={(e) =>
                    setLegalForm({ ...legalForm, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm" loading={saving} disabled={loading}>
                Mettre à jour les informations légales
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <div>
              <CardTitle>6 · Vérification & Conformité KYC</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Authentification de votre entreprise pour sécuriser les transactions acheteurs
              </p>
            </div>
          </div>
          <Badge variant="neutral">Statut KYC non fourni par le profil entreprise</Badge>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Le statut de conformité et les documents KYC ne sont pas fournis par le contrat de profil entreprise actuel.
          </div>
        </CardBody>
      </Card>

      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            <div>
              <CardTitle>14 · Facturation & Fiscalité des Ventes</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Régime d'imposition et mentions légales appliquées sur les bordereaux et factures
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Régime TVA
              </label>
              <select
                value={legalForm.vatSubject ? "vat_20" : "exempt"}
                onChange={(e) =>
                  setLegalForm({
                    ...legalForm,
                    vatSubject: e.target.value === "vat_20",
                  })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none cursor-pointer"
              >
                <option value="vat_20">Assujetti à la TVA (20% à Madagascar)</option>
                <option value="exempt">Non assujetti (Franchise en base de TVA)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Préfixe de numérotation des factures
              </label>
              <input
                value={legalForm.invoicePrefix}
                onChange={(e) =>
                  setLegalForm({ ...legalForm, invoicePrefix: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-muted/30 text-xs space-y-1.5">
            <p className="font-semibold text-foreground">
              Mentions obligatoires sur les bordereaux de livraison :
            </p>
            <p className="text-muted-foreground">
              {legalForm.companyName} · NIF : {legalForm.nif} · STAT : {legalForm.stat} · {legalForm.address}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast("Modèle de facture type généré")}
            >
              <Download size={13} />
              Aperçu modèle de facture
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
