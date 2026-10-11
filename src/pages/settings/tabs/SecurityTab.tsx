import { useState } from "react"
import {
  Shield,
  Lock,
  Smartphone,
  Laptop,
  CheckCircle2,
  Download,
  KeyRound,
  FileText,
  AlertCircle,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Badge,
} from "@/components/ui"

export function SecurityTab({
  showToast,
}: {
  showToast: (msg: string) => void
}) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [analyticsConsent, setAnalyticsConsent] = useState(true)

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  })

  function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordForm.current || !passwordForm.next) {
      showToast("Veuillez renseigner les mots de passe")
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      showToast("La confirmation ne correspond pas au nouveau mot de passe")
      return
    }
    setPasswordForm({ current: "", next: "", confirm: "" })
    showToast("Mot de passe mis à jour avec succès")
  }

  function handleExportData() {
    const data = {
      account: "Andry Rakoto",
      email: "hei.fiandrianana@gmail.com",
      store: "Nova Market Official",
      exportDate: new Date().toISOString(),
      scope: "Full Merchant Profile & Audit Trail",
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `nova-seller-data-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a)
    showToast("Archive de vos données téléchargée avec succès")
  }

  return (
    <div className="space-y-6">
      {/* 2. Sécurité et Connexion */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            <div>
              <CardTitle>2 · Sécurité, Mot de Passe & Accès</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gérez vos informations de connexion et les exigences de sécurité
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Mot de passe actuel *
              </label>
              <input
                required
                type="password"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current: e.target.value })
                }
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Nouveau mot de passe *
                </label>
                <input
                  required
                  type="password"
                  value={passwordForm.next}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, next: e.target.value })
                  }
                  placeholder="Minimum 8 caractères"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Confirmer le nouveau mot de passe *
                </label>
                <input
                  required
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirm: e.target.value })
                  }
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" variant="primary" size="sm">
                Mettre à jour le mot de passe
              </Button>
            </div>
          </form>

          {/* 2FA Double Facteur */}
          <div className="pt-4 border-t border-border/60">
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Smartphone size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">
                      Double authentification (2FA par SMS / Authenticator)
                    </p>
                    {twoFactorEnabled ? (
                      <Badge variant="success">Activé</Badge>
                    ) : (
                      <Badge variant="warning">Inactif</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Envoie un code de vérification sur votre numéro Telma (+261 34 00 000 00) lors de chaque nouvelle connexion.
                  </p>
                </div>
              </div>

              <Button
                variant={twoFactorEnabled ? "outline" : "primary"}
                size="sm"
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled)
                  showToast(
                    !twoFactorEnabled
                      ? "Double authentification activée"
                      : "Double authentification désactivée"
                  )
                }}
              >
                {twoFactorEnabled ? "Désactiver" : "Activer"}
              </Button>
            </div>
          </div>

          {/* Sessions Actives */}
          <div className="pt-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sessions et appareils connectés
            </h4>

            <div className="divide-y divide-border/60 rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <Laptop size={16} className="text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Navigateur Web Chrome · Windows (Session actuelle)
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Antananarivo, Madagascar · Adresse IP : 154.120.x.x · En ligne maintenant
                    </p>
                  </div>
                </div>
                <Badge variant="success" dot>
                  Actif
                </Badge>
              </div>

              <div className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <Smartphone size={16} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Application Vendeur · iPhone 14
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Antananarivo · Dernière connexion il y a 3 heures
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showToast("Session mobile révoquée")}
                >
                  Déconnecter
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 3. Confidentialité et Données Personnelles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            <div>
              <CardTitle>3 · Confidentialité & Données Personnelles</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contrôle de vos données marchandes et conformité légale de protection des données
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Exporter une copie de toutes vos données
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Téléchargez un fichier complet au format JSON contenant vos informations, produits, et transactions.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download size={13} />
              Télécharger l'archive
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-border bg-muted/20">
            <div>
              <p className="text-xs font-semibold text-foreground">
                Consentement d'analyse et de télémétrie des performances
              </p>
              <p className="text-[11px] text-muted-foreground">
                Permet à Nova Market d'analyser de manière anonyme la vitesse du portail pour l'optimiser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAnalyticsConsent(!analyticsConsent)
                showToast(
                  !analyticsConsent
                    ? "Télémétrie acceptée"
                    : "Télémétrie désactivée"
                )
              }}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                analyticsConsent ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  analyticsConsent ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
