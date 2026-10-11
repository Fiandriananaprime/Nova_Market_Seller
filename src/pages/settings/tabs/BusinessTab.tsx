import { useState } from "react"
import {
  Building2,
  FileCheck2,
  Receipt,
  Upload,
  CheckCircle2,
  Clock,
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

export function BusinessTab({
  showToast,
}: {
  showToast: (msg: string) => void
}) {
  const [legalForm, setLegalForm] = useState({
    companyName: "Nova Distribution Madagascar SARLU",
    legalStatus: "SARLU (Société à Responsabilité Limitée Unipersonnelle)",
    nif: "4001928374",
    stat: "47910 11 2026 0 10452",
    rcs: "RCS Antananarivo 2026 B 00812",
    address: "Lot IV B 25 Analakely, Antananarivo Renivohitra",
    city: "Antananarivo",
    region: "Analamanga",
    vatSubject: true,
    vatNumber: "MG4001928374",
    invoicePrefix: "INV-2026-",
  })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    showToast("Informations juridiques et fiscales enregistrées")
  }

  return (
    <div className="space-y-6">
      {/* 5. Informations Professionnelles & Registre Malagasy */}
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
              <Button type="submit" variant="primary" size="sm">
                Mettre à jour les informations légales
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* 6. Vérification et Conformité KYC */}
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
          <Badge variant="success">Vendeur Vérifié ✓</Badge>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Statut de conformité : Validé
                </p>
                <p className="text-xs text-muted-foreground">
                  Votre badge de confiance est actif et visible sur l'ensemble de vos fiches produits.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast("Attestation de conformité téléchargée")}
            >
              <Download size={13} />
              Attestation PDF
            </Button>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pièces justificatives déposées
            </h4>

            <div className="divide-y divide-border/60 rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <FileCheck2 size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Carte d'Identité Nationale (CIN) / Passeport du gérant
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      CIN-Rakoto-Andry-2026.pdf · Validé le 12/01/2026
                    </p>
                  </div>
                </div>
                <Badge variant="success">Vérifié</Badge>
              </div>

              <div className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <FileCheck2 size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Carte Fiscale NIF / Attestation STAT
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      NIF-STAT-Nova-Distribution.pdf · Validé le 12/01/2026
                    </p>
                  </div>
                </div>
                <Badge variant="success">Vérifié</Badge>
              </div>

              <div className="p-3.5 flex items-center justify-between gap-3 text-xs bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <Upload size={16} className="text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Mettre à jour un document justificatif
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      En cas de renouvellement de gérance ou changement d'adresse
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showToast("Téléversement de document disponible")}
                >
                  Téléverser
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 14. Facturation et Fiscalité */}
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
