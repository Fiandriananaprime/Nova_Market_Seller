import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Sun,
  Moon,
  AlertTriangle,
  Eye,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Badge,
  ConfirmModal,
} from "@/components/ui"
import { getSellerProfile, getSellerSettings, updateSellerProfile, updateSellerSettings } from "@/service/seller"

export const AccountTab = ({
  showToast,
}: {
  showToast: (msg: string) => void
}) => {
  const { i18n } = useTranslation()
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  )
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    timezone: "Indian/Antananarivo (EAT UTC+3)",
    currency: "Ariary malgache (MGA)",
    dateFormat: "DD/MM/YYYY",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getSellerProfile(), getSellerSettings()])
      .then(([profile, settings]) => {
        setForm((current) => ({
          ...current,
          firstName: profile.firstName ?? "",
          lastName: profile.lastName ?? "",
          email: profile.email ?? "",
          phone: profile.phone ?? "",
        }))
        if (settings.theme === "light" || settings.theme === "dark") setTheme(settings.theme)
        if (settings.lang) void i18n.changeLanguage(settings.lang)
      })
      .catch(() => setError("Impossible de charger le profil et les préférences."))
      .finally(() => setLoading(false))
  }, [i18n])

  function toggleTheme(newTheme: "light" | "dark") {
    setTheme(newTheme)
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    showToast(`Mode ${newTheme === "dark" ? "Sombre" : "Clair"} activé`)
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await Promise.all([
        updateSellerProfile({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        }),
        updateSellerSettings({ theme, lang: i18n.language }),
      ])
      showToast("Profil et préférences enregistrés.")
    } catch {
      setError("Impossible d'enregistrer le profil et les préférences.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader>
          <div>
            <CardTitle>1 · Profil Marchand & Coordonnées</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Informations du titulaire principal du compte Nova Market
            </p>
          </div>
          <Badge variant="primary">Titulaire Compte</Badge>
        </CardHeader>
        <CardBody>
          {loading && <p role="status" className="mb-3 text-xs text-muted-foreground">Chargement du profil…</p>}
          {error && <p role="alert" className="mb-3 text-xs text-destructive">{error}</p>}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 pb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-white font-display font-extrabold text-xl flex items-center justify-center shadow-sm">
                {`${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}` || "—"}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {form.firstName} {form.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{form.email}</p>
                {form.phone && <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{form.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Prénom
                </label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Nom de famille
                </label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Email de connexion
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Téléphone mobile (SMS & Sécurité)
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+261 34 00 000 00"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm" loading={saving} disabled={loading}>
                Enregistrer les coordonnées
              </Button>
            </div>
          </form>
          <p className="mt-3 text-[11px] text-muted-foreground">Fuseau horaire, devise, format de date et préférences d’accessibilité restent locaux : aucun endpoint de sauvegarde n’est défini.</p>
        </CardBody>
      </Card>

      
      <Card>
        <CardHeader>
          <div>
            <CardTitle>23 & 24 · Préférences Générales, Langue & Région</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configuration de la devise, fuseau horaire et localisation de votre interface
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Devise d'affichage principale
              </label>
              <input
                disabled
                value={form.currency}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border/80 bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Standardisé pour la place de marché Madagascar
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Fuseau horaire (EAT)
              </label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none cursor-pointer"
              >
                <option value="Indian/Antananarivo (EAT UTC+3)">
                  Antananarivo (EAT UTC+3)
                </option>
                <option value="Indian/Reunion (RET UTC+4)">
                  La Réunion / Maurice (UTC+4)
                </option>
                <option value="Europe/Paris (CET UTC+1)">
                  Paris / France (CET/CEST)
                </option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Format de date
              </label>
              <select
                value={form.dateFormat}
                onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none cursor-pointer"
              >
                <option value="DD/MM/YYYY">JJ/MM/AAAA (ex: 09/10/2026)</option>
                <option value="YYYY-MM-DD">AAAA-MM-JJ (ISO standard)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60">
            <label className="text-xs font-semibold text-foreground mb-2 block">
              Langue active du portail vendeur
            </label>
            <div className="flex gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  i18n.changeLanguage("fr")
                  showToast("Langue basculée en Français")
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  i18n.language === "fr"
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                🇲🇬 Français (Madagascar)
              </button>

              <button
                type="button"
                onClick={() => {
                  i18n.changeLanguage("en")
                  showToast("Language changed to English")
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  i18n.language === "en"
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                🇬🇧 English (International)
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast("Version Malagasy en cours de synchronisation")
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-border text-muted-foreground hover:bg-muted cursor-pointer"
              >
                🇲🇬 Malagasy (Bientôt disponible)
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-primary" />
            <CardTitle>25 · Accessibilité & Ergonomie Visuelle</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">
              Palette et contraste
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => toggleTheme("light")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                  theme === "light"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Sun size={15} />
                Thème Clair
              </button>

              <button
                type="button"
                onClick={() => toggleTheme("dark")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                  theme === "dark"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Moon size={15} />
                Thème Sombre
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Mode Contraste Élevé
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Renforce les bordures et les séparateurs pour une lisibilité accrue
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHighContrast(!highContrast)
                  showToast(
                    !highContrast
                      ? "Contraste élevé activé"
                      : "Contraste standard restauré"
                  )
                }}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  highContrast ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    highContrast ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Réduction des animations (prefers-reduced-motion)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Désactive les transitions et mouvements rapides sur la carte et les graphiques
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReducedMotion(!reducedMotion)
                  showToast(
                    !reducedMotion
                      ? "Animations réduites activées"
                      : "Animations standard réactivées"
                  )
                }}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  reducedMotion ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    reducedMotion ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      
      <Card className="border-rose-500/30">
        <CardHeader className="bg-rose-500/5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-600" />
            <CardTitle className="text-rose-600">
              29 · Gestion & Fermeture du Compte Marchand
            </CardTitle>
          </div>
          <Badge variant="danger">Zone Sensible</Badge>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card">
            <div>
              <p className="text-xs font-semibold text-foreground">
                Mettre la boutique en pause prolongée
              </p>
              <p className="text-[11px] text-muted-foreground">
                Masque temporairement vos produits des résultats sans supprimer vos données
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast("Boutique mise en pause prolongée")}
            >
              Suspendre l'activité
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <div>
              <p className="text-xs font-semibold text-rose-600">
                Clôturer définitivement le compte vendeur
              </p>
              <p className="text-[11px] text-muted-foreground">
                Supprime votre catalogue, résilie vos abonnements et archive vos factures
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowCloseModal(true)}
            >
              Fermer le compte
            </Button>
          </div>
        </CardBody>
      </Card>

      {showCloseModal && (
        <ConfirmModal
          title="Confirmer la clôture de votre compte ?"
          message="Cette action est irréversible. Toutes vos annonces et avis seront archivés et vos reversements restants seront virés sous 14 jours ouvrés."
          danger
          confirmLabel="Oui, demander la clôture"
          onConfirm={() => {
            setShowCloseModal(false)
            showToast("Demande de fermeture transmise au service conformité")
          }}
          onCancel={() => setShowCloseModal(false)}
        />
      )}
    </div>
  )
}
