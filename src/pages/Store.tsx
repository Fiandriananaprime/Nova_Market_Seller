import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  CheckCircle2,
  Camera,
  Save,
} from "lucide-react"
import {
  getSellerBusiness,
  getStorePolicies,
  updateSellerBusiness,
  updateStorePolicies,
} from "@/service/seller"
import type { SellerBusiness, StorePolicies } from "@/type/seller"
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

const Store = () => {
  const { t } = useTranslation()
  const [tab, setTab] = useState<"profile" | "hours" | "policies">("profile")
  const [store, setStore] = useState<SellerBusiness>({})
  const [vacationMode, setVacationMode] = useState(false)
  const [hours, setHours] = useState(defaultHours)
  const [policies, setPolicies] = useState<StorePolicies>({})
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", description: "", location: "", phone: "", email: "", facebook: "", instagram: "", website: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getSellerBusiness(), getStorePolicies()])
      .then(([business, storePolicies]) => {
        setStore(business)
        setPolicies(storePolicies)
        setForm({
          name: business.name ?? "",
          description: business.description ?? "",
          location: business.location ?? "",
          phone: business.contact?.phone ?? "",
          email: business.contact?.email ?? "",
          facebook: "",
          instagram: "",
          website: business.contact?.website ?? "",
        })
      })
      .catch(() => setError("Impossible de charger les informations de la boutique."))
      .finally(() => setLoading(false))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function saveChanges() {
    setSaving(true)
    setError(null)
    try {
      if (tab === "profile") {
        const updated = await updateSellerBusiness({
          name: form.name,
          description: form.description,
          location: form.location,
          contact: { phone: form.phone, email: form.email, website: form.website },
        })
        setStore(updated)
        showToast("Profil de la boutique enregistré.")
      } else if (tab === "policies") {
        const updated = await updateStorePolicies(policies)
        setPolicies(updated)
        showToast("Politique de retour enregistrée.")
      } else {
        showToast("Les horaires et le mode vacances restent locaux : aucun endpoint de sauvegarde n'est disponible.")
      }
    } catch {
      setError("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <PageHeader
        title={t("store.title")}
        subtitle={store.name ?? ""}
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={saveChanges}
            loading={saving}
          >
            <Save size={14} />
            {t("store.saveChanges")}
          </Button>
        }
      />

      {loading && <p role="status" className="text-sm text-muted-foreground">Chargement des informations de la boutique…</p>}
      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}

      
      <Card data-tour="store-hero" className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary/30 to-blue-600/30">
          {store.coverUrl && (
            <img
              src={store.coverUrl}
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
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
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
                  {store.name}
                </h2>
                {store.verified && (
                  <CheckCircle2 size={18} className="text-primary fill-primary/10" />
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span>{store.productsCount ?? 0} produits</span>
                <span>·</span>
                <span>{(store.followersCount ?? 0).toLocaleString()} abonnés</span>
                <span>·</span>
                <span className="text-amber-500 font-semibold">
                  ★ {store.rating ?? 0} ({store.reviewsCount ?? 0} avis)
                </span>
              </div>
            </div>
          </div>

          
          <div data-tour="store-vacation" className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/60 border border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                {t("store.vacationMode")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setVacationMode(!vacationMode)
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

            <Badge variant={store.isOpen && !vacationMode ? "success" : "warning"}>
              {vacationMode ? "En pause (local)" : store.isOpen ? "Ouverte" : "Fermée"}
            </Badge>
          </div>
        </div>
      </Card>
      <p className="text-xs text-muted-foreground">Le mode vacances, les horaires, les réseaux sociaux et les images n'ont pas d'endpoint de sauvegarde disponible.</p>

      
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
                value={policies.returnPolicy ?? ""}
                onChange={(event) => setPolicies({ ...policies, returnPolicy: event.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none resize-none"
              />
            </div>
          </CardBody>
        </Card>
      )}

      
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
};
export default Store
