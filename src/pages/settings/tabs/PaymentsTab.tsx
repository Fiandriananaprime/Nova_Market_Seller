import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { CreditCard, Plus, Trash2, Sparkles } from "lucide-react"
import { Card, CardHeader, CardTitle, CardBody, Button, Badge } from "@/components/ui"
import {
  createPayoutMethod,
  deletePayoutMethod,
  getPayoutMethods,
  getSubscription,
} from "@/service/seller"
import type { PayoutMethod, PayoutMethodInput, Subscription } from "@/type/seller"

export const PaymentsTab = ({ showToast }: { showToast: (msg: string) => void }) => {
  const [methods, setMethods] = useState<PayoutMethod[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<PayoutMethodInput>({ type: "mvola", accountName: "", account: "", isDefault: false })
  const [payoutSchedule, setPayoutSchedule] = useState("weekly")
  const navigate = useNavigate()

  const loadSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const [payoutMethods, currentSubscription] = await Promise.all([getPayoutMethods(), getSubscription()])
      setMethods(payoutMethods)
      setSubscription(currentSubscription)
    } catch {
      setError("Impossible de charger les méthodes de versement et l'abonnement.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadSettings() }, [])

  const addMethod = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const added = await createPayoutMethod(form)
      setMethods((current) => [...current, added])
      setForm({ type: "mvola", accountName: "", account: "", isDefault: false })
      setShowAddForm(false)
      showToast("Méthode de versement ajoutée.")
    } catch {
      setError("Impossible d'ajouter cette méthode de versement.")
    } finally {
      setSaving(false)
    }
  }

  const removeMethod = async (method: PayoutMethod) => {
    try {
      await deletePayoutMethod(method.id)
      setMethods((current) => current.filter((item) => item.id !== method.id))
      showToast("Méthode de versement supprimée.")
    } catch {
      setError("Impossible de supprimer cette méthode de versement.")
    }
  }

  const planName = subscription?.plan ?? subscription?.planId

  return (
    <div className="space-y-6">
      {loading && <p role="status" className="text-xs text-muted-foreground">Chargement des paiements…</p>}
      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><CreditCard size={18} className="text-primary" /><div><CardTitle>13 · Comptes de Reversement Financier (Mobile Money & Banque)</CardTitle><p className="text-xs text-muted-foreground mt-0.5">Comptes destinataires pour le virement automatique de vos revenus de vente</p></div></div>
          <Button variant="outline" size="sm" onClick={() => setShowAddForm((shown) => !shown)}><Plus size={13} />Ajouter un compte</Button>
        </CardHeader>
        <CardBody className="space-y-3.5">
          {showAddForm && <form onSubmit={addMethod} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
            <label className="text-xs font-medium">Type de compte<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as PayoutMethodInput["type"] })} className="mt-1 w-full rounded-lg border border-border bg-background p-2"><option value="mvola">MVola</option><option value="orange_money">Orange Money</option><option value="bank_account">Compte bancaire</option></select></label>
            <label className="text-xs font-medium">Titulaire<input required value={form.accountName} onChange={(event) => setForm({ ...form, accountName: event.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label>
            <label className="text-xs font-medium sm:col-span-2">Numéro de compte / téléphone<input required value={form.account} onChange={(event) => setForm({ ...form, account: event.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label>
            <label className="flex items-center gap-2 text-xs sm:col-span-2"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} />Définir comme méthode par défaut</label>
            <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Annuler</Button><Button type="submit" variant="primary" size="sm" loading={saving}>Enregistrer</Button></div>
          </form>}
          {!loading && methods.length === 0 && <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Aucune méthode de versement enregistrée.</p>}
          {methods.map((method) => <div key={method.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{method.label ?? method.type} · {method.maskedAccount}</p>{method.isDefault && <Badge variant="success">Principal</Badge>}{!method.verified && <Badge variant="warning">Non vérifié</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">{method.accountName}</p></div>
            <Button variant="ghost" size="sm" onClick={() => void removeMethod(method)} aria-label="Supprimer la méthode"><Trash2 size={14} /></Button>
          </div>)}
          <div className="border-t border-border/60 pt-2"><label className="text-xs font-semibold text-foreground mb-1 block">Périodicité des reversements automatiques</label><select value={payoutSchedule} onChange={(event) => setPayoutSchedule(event.target.value)} className="w-full sm:w-80 px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground"><option value="weekly">Chaque lundi matin (Hebdomadaire)</option><option value="biweekly">Tous les 15 jours</option><option value="monthly">Le 1er de chaque mois</option><option value="daily">Quotidien (Automatique dès 50 000 Ar)</option></select><p className="mt-1 text-[11px] text-muted-foreground">Ce choix reste local : aucun endpoint de fréquence de versement n'est défini.</p></div>
        </CardBody>
      </Card>
      <Card className="border-purple-500/30">
        <CardHeader className="bg-purple-500/5"><div className="flex items-center gap-2"><Sparkles size={18} className="text-purple-600" /><div><CardTitle className="text-purple-600">22 · Abonnement & Services Nova Seller</CardTitle><p className="text-xs text-muted-foreground mt-0.5">Formule commerciale actuellement enregistrée sur votre compte</p></div></div>{planName != null && <Badge variant="purple">{String(planName)}</Badge>}</CardHeader>
        <CardBody><div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div><h3 className="font-display font-extrabold text-xl text-foreground">{planName ? `Plan ${String(planName)}` : "Aucun abonnement disponible"}</h3><p className="mt-1 text-xs text-muted-foreground">Les informations tarifaires et les factures ne sont pas fournies par l'API de cette page.</p></div><Button variant="primary" size="sm" onClick={() => navigate("/subscription")}>Changer de formule</Button></div></CardBody>
      </Card>
    </div>
  )
};
