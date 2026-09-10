import { useState } from "react";
import { Store as StoreIcon, Globe, Phone, Mail, MapPin, Clock, CheckCircle2, Edit2, Camera, Link } from "lucide-react";
import { storeInfo } from "../data/mock";
import { PageHeader, Button, Badge, Toast, Card, CardHeader, CardTitle, CardBody } from "../components/ui";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const defaultHours = {
  Lundi:    { open: "08:00", close: "18:00", closed: false },
  Mardi:    { open: "08:00", close: "18:00", closed: false },
  Mercredi: { open: "08:00", close: "18:00", closed: false },
  Jeudi:    { open: "08:00", close: "18:00", closed: false },
  Vendredi: { open: "08:00", close: "18:00", closed: false },
  Samedi:   { open: "09:00", close: "16:00", closed: false },
  Dimanche: { open: "", close: "", closed: true },
};

export default function Store() {
  const [tab, setTab] = useState<"profile" | "hours" | "policies">("profile");
  const [vacationMode, setVacationMode] = useState(storeInfo.vacationMode);
  const [hours, setHours] = useState(defaultHours);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: storeInfo.name,
    description: storeInfo.description,
    location: storeInfo.location,
    phone: storeInfo.phone,
    email: storeInfo.email,
    facebook: storeInfo.socialLinks.facebook,
    instagram: storeInfo.socialLinks.instagram,
    website: storeInfo.socialLinks.website,
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Ma boutique"
        subtitle={storeInfo.name}
        actions={
          <Button variant="primary" onClick={() => showToast("Modifications enregistrées")}>
            Enregistrer les modifications
          </Button>
        }
      />

      {/* Cover + Logo */}
      <Card className="overflow-hidden">
        <div className="relative h-40 bg-secondary">
          <img src={storeInfo.coverUrl} alt="Couverture" className="w-full h-full object-cover" />
          <button className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground/60 text-white text-xs hover:bg-foreground/80 transition-colors cursor-pointer">
            <Camera size={12} />
            Modifier la couverture
          </button>
        </div>
        <div className="px-5 pb-5 flex items-end justify-between" style={{ marginTop: "-2.5rem" }}>
          <div className="flex items-end gap-4">
            <div className="relative">
              <img src={storeInfo.logoUrl} alt="Logo" className="w-20 h-20 rounded-xl border-4 border-card object-cover bg-muted" />
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer">
                <Camera size={11} />
              </button>
            </div>
            <div className="mb-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-700 text-lg text-foreground">{storeInfo.name}</h2>
                {storeInfo.verified && (
                  <CheckCircle2 size={16} className="text-primary" />
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{storeInfo.productsCount} produits</span>
                <span>·</span>
                <span>{storeInfo.followersCount.toLocaleString()} abonnés</span>
                <span>·</span>
                <span className="flex items-center gap-1">★ {storeInfo.rating} ({storeInfo.reviewsCount} avis)</span>
              </div>
            </div>
          </div>

          {/* Vacation mode toggle */}
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Mode vacances</span>
              <button
                onClick={() => { setVacationMode(!vacationMode); showToast(vacationMode ? "Mode vacances désactivé" : "Mode vacances activé"); }}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${vacationMode ? "bg-[var(--warning)]" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${vacationMode ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <Badge variant={storeInfo.isOpen && !vacationMode ? "success" : "warning"}>
              {vacationMode ? "Mode vacances" : storeInfo.isOpen ? "Ouverte" : "Fermée"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { id: "profile" as const, label: "Profil de la boutique" },
          { id: "hours" as const, label: "Horaires" },
          { id: "policies" as const, label: "Politiques" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Basic info */}
          <Card>
            <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Nom de la boutique</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5"><MapPin size={12} />Localisation</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </CardBody>
          </Card>

          {/* Contact + social */}
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5"><Phone size={12} />Téléphone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5"><Mail size={12} />Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>Réseaux sociaux</CardTitle></CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5"><Link size={12} />Facebook</label>
                  <input
                    value={form.facebook}
                    onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5"><Link size={12} />Instagram</label>
                  <input
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5"><Globe size={12} />Site web</label>
                  <input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Hours tab */}
      {tab === "hours" && (
        <Card>
          <CardHeader>
            <CardTitle>Horaires d'ouverture</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {DAYS.map((day) => {
              const h = hours[day as keyof typeof hours];
              return (
                <div key={day} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground w-24">{day}</span>
                  <button
                    onClick={() => setHours((prev) => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], closed: !h.closed } }))}
                    className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${!h.closed ? "bg-primary" : "bg-muted"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${!h.closed ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  {!h.closed ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={h.open}
                        onChange={(e) => setHours((prev) => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], open: e.target.value } }))}
                        className="px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                      <span className="text-muted-foreground text-xs">–</span>
                      <input
                        type="time"
                        value={h.close}
                        onChange={(e) => setHours((prev) => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], close: e.target.value } }))}
                        className="px-2 py-1.5 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Fermé</span>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}

      {/* Policies tab */}
      {tab === "policies" && (
        <div className="space-y-4">
          {[
            { label: "Politique de retour", key: "return", placeholder: "Décrivez votre politique de retour..." },
            { label: "Politique de remboursement", key: "refund", placeholder: "Décrivez votre politique de remboursement..." },
            { label: "Politique d'annulation", key: "cancel", placeholder: "Décrivez votre politique d'annulation..." },
            { label: "Politique de livraison", key: "shipping", placeholder: "Décrivez votre politique de livraison..." },
          ].map((p) => (
            <Card key={p.key}>
              <CardHeader><CardTitle>{p.label}</CardTitle></CardHeader>
              <CardBody>
                <textarea
                  rows={4}
                  placeholder={p.placeholder}
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                />
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {toast && <Toast message={toast} type="success" onDismiss={() => setToast(null)} />}
    </div>
  );
}
