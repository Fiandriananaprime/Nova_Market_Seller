import { useState } from "react";
import { User, Bell, Shield, CreditCard, Globe, Moon, Sun, Monitor, Check } from "lucide-react";
import { PageHeader, Card, CardHeader, CardTitle, CardBody, Button, Toast } from "../components/ui";

type Tab = "account" | "notifications" | "security" | "payments";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "account", label: "Compte", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "payments", label: "Paiements & Virements", icon: CreditCard },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function NotifRow({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState<Tab>("account");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [lang, setLang] = useState("fr");
  const [toast, setToast] = useState<string | null>(null);

  const [notifs, setNotifs] = useState({
    newOrder: true,
    orderCancelled: true,
    lowStock: true,
    productApproved: true,
    productRejected: true,
    newReview: true,
    payout: true,
    announcements: true,
    email: true,
    push: true,
    sms: false,
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader title="Paramètres" subtitle="Gérez vos préférences et votre compte" />

      <div className="flex gap-5">
        {/* Sidebar nav */}
        <nav className="w-44 flex-shrink-0 hidden md:block">
          <div className="space-y-0.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-left ${tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <Icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-1 overflow-x-auto mb-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${tab === t.id ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground"}`}
              >
                <Icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Account */}
          {tab === "account" && (
            <>
              <Card>
                <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-700 text-xl">
                      MN
                    </div>
                    <Button variant="secondary" size="sm">Changer la photo</Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1.5 block">Prénom</label>
                      <input defaultValue="Miora" className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1.5 block">Nom</label>
                      <input defaultValue="Ndriana" className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Email</label>
                    <input type="email" defaultValue="m.ndriana@madagascar-nature.mg" className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Téléphone</label>
                    <input defaultValue="+261 34 12 345 67" className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <Button variant="primary" onClick={() => showToast("Profil mis à jour")}>Enregistrer</Button>
                </CardBody>
              </Card>

              <Card>
                <CardHeader><CardTitle>Préférences</CardTitle></CardHeader>
                <CardBody className="space-y-5">
                  {/* Theme */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Thème</p>
                    <div className="flex gap-2">
                      {[
                        { value: "light", label: "Clair", icon: Sun },
                        { value: "dark", label: "Sombre", icon: Moon },
                        { value: "system", label: "Système", icon: Monitor },
                      ].map((t) => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.value}
                            onClick={() => setTheme(t.value as any)}
                            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer ${theme === t.value ? "border-primary bg-primary/5" : "border-border hover:border-foreground"}`}
                          >
                            <Icon size={16} className={theme === t.value ? "text-primary" : "text-muted-foreground"} />
                            <span className={`text-xs font-medium ${theme === t.value ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Langue</p>
                    <div className="flex gap-2">
                      {[{ value: "mg", label: "Malagasy" }, { value: "fr", label: "Français" }, { value: "en", label: "English" }].map((l) => (
                        <button
                          key={l.value}
                          onClick={() => setLang(l.value)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-medium transition-colors cursor-pointer ${lang === l.value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-foreground"}`}
                        >
                          {lang === l.value && <Check size={11} />}
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <>
              <Card>
                <CardHeader><CardTitle>Notifications boutique</CardTitle></CardHeader>
                <CardBody className="p-0">
                  <div className="px-5">
                    <NotifRow label="Nouvelle commande" description="Recevez une notification pour chaque nouvelle commande" checked={notifs.newOrder} onChange={(v) => setNotifs({ ...notifs, newOrder: v })} />
                    <NotifRow label="Commande annulée" description="Lorsqu'un client annule une commande" checked={notifs.orderCancelled} onChange={(v) => setNotifs({ ...notifs, orderCancelled: v })} />
                    <NotifRow label="Stock bas" description="Quand un produit passe sous le seuil d'alerte" checked={notifs.lowStock} onChange={(v) => setNotifs({ ...notifs, lowStock: v })} />
                    <NotifRow label="Produit approuvé" description="Lorsqu'un produit est approuvé par l'équipe Nova Market" checked={notifs.productApproved} onChange={(v) => setNotifs({ ...notifs, productApproved: v })} />
                    <NotifRow label="Produit rejeté" description="Lorsqu'un produit est rejeté par l'équipe de modération" checked={notifs.productRejected} onChange={(v) => setNotifs({ ...notifs, productRejected: v })} />
                    <NotifRow label="Nouvel avis" description="Quand un client laisse un avis sur un de vos produits" checked={notifs.newReview} onChange={(v) => setNotifs({ ...notifs, newReview: v })} />
                    <NotifRow label="Virement effectué" description="Lors du traitement de vos virements" checked={notifs.payout} onChange={(v) => setNotifs({ ...notifs, payout: v })} />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader><CardTitle>Canaux de notification</CardTitle></CardHeader>
                <CardBody className="p-0">
                  <div className="px-5">
                    <NotifRow label="Notifications push" description="Notifications dans l'application" checked={notifs.push} onChange={(v) => setNotifs({ ...notifs, push: v })} />
                    <NotifRow label="Email" description="Notifications par email" checked={notifs.email} onChange={(v) => setNotifs({ ...notifs, email: v })} />
                    <NotifRow label="SMS" description="Notifications par SMS" checked={notifs.sms} onChange={(v) => setNotifs({ ...notifs, sms: v })} />
                  </div>
                </CardBody>
              </Card>

              <Button variant="primary" onClick={() => showToast("Préférences enregistrées")}>Enregistrer</Button>
            </>
          )}

          {/* Security */}
          {tab === "security" && (
            <>
              <Card>
                <CardHeader><CardTitle>Mot de passe</CardTitle></CardHeader>
                <CardBody className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Mot de passe actuel</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Nouveau mot de passe</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Confirmer le nouveau mot de passe</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <Button variant="primary" onClick={() => showToast("Mot de passe mis à jour")}>Changer le mot de passe</Button>
                </CardBody>
              </Card>

              <Card>
                <CardHeader><CardTitle>Authentification à deux facteurs</CardTitle></CardHeader>
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-foreground font-medium">2FA désactivé</p>
                      <p className="text-xs text-muted-foreground mt-1">Protégez votre compte avec une couche de sécurité supplémentaire.</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => showToast("Configuration 2FA — fonctionnalité à venir")}>
                      Activer
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader><CardTitle>Sessions actives</CardTitle></CardHeader>
                <CardBody className="space-y-3">
                  {[
                    { device: "Chrome · macOS", ip: "197.159.x.x", location: "Antananarivo, MG", current: true, lastActive: "Maintenant" },
                    { device: "Safari · iPhone", ip: "197.158.x.x", location: "Antananarivo, MG", current: false, lastActive: "hier à 14:32" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{s.device}</p>
                          {s.current && <span className="text-[10px] font-600 px-1.5 py-0.5 rounded-full bg-[var(--success)]/10 text-[var(--success)]">Session actuelle</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{s.location} · {s.lastActive}</p>
                      </div>
                      {!s.current && (
                        <Button size="sm" variant="ghost" onClick={() => showToast("Session révoquée")}>Révoquer</Button>
                      )}
                    </div>
                  ))}
                </CardBody>
              </Card>
            </>
          )}

          {/* Payments */}
          {tab === "payments" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Solde disponible</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-primary rounded-xl p-4 text-white">
                      <p className="text-xs opacity-80 mb-1">Disponible</p>
                      <p className="font-display font-700 text-2xl">8 450 000 Ar</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">En attente</p>
                      <p className="font-display font-700 text-2xl text-foreground">2 100 000 Ar</p>
                    </div>
                  </div>
                  <Button variant="primary" onClick={() => showToast("Demande de virement envoyée")}>
                    Demander un virement
                  </Button>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Méthodes de virement</CardTitle>
                  <Button size="sm" variant="secondary" onClick={() => showToast("Ajout de méthode — fonctionnalité à venir")}>
                    + Ajouter
                  </Button>
                </CardHeader>
                <CardBody className="space-y-3">
                  {[
                    { type: "MVola", account: "+261 34 *** **67", label: "Principal", isDefault: true, verified: true },
                    { type: "Orange Money", account: "+261 32 *** **20", label: "Secondaire", isDefault: false, verified: true },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-primary font-700 text-xs">
                          {m.type.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-600 text-foreground">{m.type}</p>
                            {m.isDefault && <span className="text-[10px] font-600 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">Par défaut</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{m.account}</p>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--success)] flex items-center gap-1">
                        <Check size={11} /> Vérifié
                      </span>
                    </div>
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader><CardTitle>Historique des virements</CardTitle></CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-5 py-3 text-muted-foreground font-medium">Date</th>
                        <th className="text-left px-3 py-3 text-muted-foreground font-medium">Méthode</th>
                        <th className="text-right px-3 py-3 text-muted-foreground font-medium">Montant</th>
                        <th className="text-left px-3 py-3 text-muted-foreground font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { date: "2026-08-31", method: "MVola", amount: 12_400_000, status: "completed" },
                        { date: "2026-07-31", method: "MVola", amount: 9_800_000, status: "completed" },
                        { date: "2026-06-30", method: "MVola", amount: 8_300_000, status: "completed" },
                      ].map((p, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3 text-muted-foreground">{new Date(p.date).toLocaleDateString("fr-MG")}</td>
                          <td className="px-3 py-3 text-foreground">{p.method}</td>
                          <td className="px-3 py-3 text-right font-600 text-foreground">{(p.amount / 1_000_000).toFixed(1)}M Ar</td>
                          <td className="px-3 py-3">
                            <span className="text-[11px] font-600 px-2 py-0.5 rounded-md bg-[var(--success)]/10 text-[var(--success)]">Complété</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} type="success" onDismiss={() => setToast(null)} />}
    </div>
  );
}
