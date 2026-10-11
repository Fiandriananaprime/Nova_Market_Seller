import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Store as StoreIcon,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Edit2,
  Camera,
  Link,
  Sparkles,
  Save,
} from "lucide-react"
import { storeInfo } from "@/hook/mock"
import {
  PageHeader,
  Button,
  Badge,
  Toast,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "@/components/ui"

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
]

const defaultHours: Record<string, { open: string; close: string; closed: boolean }> = {
  Lundi: { open: "08:00", close: "18:00", closed: false },
  Mardi: { open: "08:00", close: "18:00", closed: false },
  Mercredi: { open: "08:00", close: "18:00", closed: false },
  Jeudi: { open: "08:00", close: "18:00", closed: false },
  Vendredi: { open: "08:00", close: "18:00", closed: false },
  Samedi: { open: "09:00", close: "16:00", closed: false },
  Dimanche: { open: "", close: "", closed: true },
}

export default function Store() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<"profile" | "hours" | "policies">("profile")
  const [vacationMode, setVacationMode] = useState(storeInfo.vacationMode)
  const [hours, setHours] = useState(defaultHours)
  const [toast, setToast] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: storeInfo.name ?? "",
    description: storeInfo.description ?? "",
    location: storeInfo.location ?? "",
    phone: storeInfo.phone ?? "",
    email: storeInfo.email ?? "",
    facebook: storeInfo.socialLinks?.facebook ?? "",
    instagram: storeInfo.socialLinks?.instagram ?? "",
    website: storeInfo.socialLinks?.website ?? "",
  })

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={t("store.title")}
        subtitle={storeInfo.name}
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => showToast("Modifications de la boutique enregistrées !")}
          >
            <Save size={14} />
            {t("store.saveChanges")}
          </Button>
        }
      />

      {/* Cover & Brand Hero Banner */}
      <Card data-tour="store-hero" className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary/30 to-blue-600/30">
          {storeInfo.coverUrl && (
            <img
              src={storeInfo.coverUrl}
              alt="Couverture"
              className="w-full h-full object-cover"
            />
          )}
          <button className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/90 backdrop-blur-xs text-foreground text-xs font-semibold hover:bg-card transition-colors cursor-pointer shadow-sm">
            <Camera size={13} />
            Modifier la couverture
          </button>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-10">
          <div className="flex items-end gap-4">
            <div className="relative">
              {storeInfo.logoUrl ? (
                <img
                  src={storeInfo.logoUrl}
                  alt="Logo"
                  className="w-20 h-20 rounded-2xl border-4 border-card object-cover bg-card shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-card bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md">
                  NM
                </div>
              )}
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer shadow-xs">
                <Camera size={12} />
              </button>
            </div>

            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-xl text-foreground">
                  {storeInfo.name}
                </h2>
                {storeInfo.verified && (
                  <CheckCircle2 size={18} className="text-primary fill-primary/10" />
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span>{storeInfo.productsCount} produits</span>
                <span>·</span>
                <span>{storeInfo.followersCount.toLocaleString()} abonnés</span>
                <span>·</span>
                <span className="text-amber-500 font-semibold">
                  ★ {storeInfo.rating} ({storeInfo.reviewsCount} avis)
                </span>
              </div>
            </div>
          </div>

          {/* Vacation Mode Toggle */}
          <div data-tour="store-vacation" className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/60 border border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                {t("store.vacationMode")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setVacationMode(!vacationMode)
                  showToast(
                    vacationMode
                      ? "Mode vacances désactivé"
                      : "Mode vacances activé"
                  )
                }}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                  vacationMode ? "bg-amber-500" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    vacationMode ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <Badge variant={storeInfo.isOpen && !vacationMode ? "success" : "warning"}>
              {vacationMode ? "En pause" : storeInfo.isOpen ? "Ouverte" : "Fermée"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Tabs Menu */}
      <div data-tour="store-tabs" className="flex items-center gap-2 border-b border-border/80 pb-2">
        {(
          [
            { id: "profile", label: "Informations Générales" },
            { id: "hours", label: "Horaires d'Ouverture" },
            { id: "policies", label: "Politiques & Livraison" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === t.id
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Profile & Contact */}
      {tab === "profile" && (
        <div data-tour="store-profile-form" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Identité & Description</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Nom de l'enseigne
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Présentation de la boutique
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Localisation physique
                </label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Antananarivo, Madagascar"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Canaux de Contact & Réseaux</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Téléphone professionnel
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+261 34 00 000 00"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Email de contact clients
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@boutique.mg"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Lien Facebook / Page
                </label>
                <input
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="https://facebook.com/maboutique"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 2: Operating Hours */}
      {tab === "hours" && (
        <Card>
          <CardHeader>
            <CardTitle>Plages Horaires d'Ouverture</CardTitle>
          </CardHeader>
          <CardBody className="divide-y divide-border/60 p-0">
            {DAYS.map((day) => {
              const h = hours[day] || { open: "08:00", close: "18:00", closed: false }
              return (
                <div
                  key={day}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 text-xs"
                >
                  <span className="font-bold text-foreground w-28">{day}</span>

                  <div className="flex items-center gap-3">
                    {h.closed ? (
                      <span className="text-muted-foreground italic">Fermé</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={h.open}
                          onChange={(e) =>
                            setHours({
                              ...hours,
                              [day]: { ...h, open: e.target.value },
                            })
                          }
                          className="px-2.5 py-1 rounded-lg border border-border bg-card text-foreground"
                        />
                        <span className="text-muted-foreground">à</span>
                        <input
                          type="time"
                          value={h.close}
                          onChange={(e) =>
                            setHours({
                              ...hours,
                              [day]: { ...h, close: e.target.value },
                            })
                          }
                          className="px-2.5 py-1 rounded-lg border border-border bg-card text-foreground"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setHours({
                          ...hours,
                          [day]: { ...h, closed: !h.closed },
                        })
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        h.closed
                          ? "bg-primary text-white"
                          : "border border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {h.closed ? "Ouvrir" : "Fermer"}
                    </button>
                  </div>
                </div>
              )
            })}
          </CardBody>
        </Card>
      )}

      {/* TAB 3: Policies */}
      {tab === "policies" && (
        <Card>
          <CardHeader>
            <CardTitle>Conditions de Livraison et Retours</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Délai moyen d'expédition
              </label>
              <select className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none">
                <option>Expédition sous 24 heures ouvrées</option>
                <option>Expédition sous 48 heures ouvrées</option>
                <option>Expédition sous 3 à 5 jours ouvrés</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Politique de retour et réclamations
              </label>
              <textarea
                rows={3}
                defaultValue="Retours acceptés sous 7 jours après réception si l'emballage d'origine n'a pas été ouvert."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none resize-none"
              />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
