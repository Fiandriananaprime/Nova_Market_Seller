import { useEffect, useState } from "react"
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Volume2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Save,
  Radio,
  ShoppingBag,
  DollarSign,
  Star,
  ShieldAlert,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardBody, Button, Badge } from "@/components/ui"
import { getNotificationPreferences, updateNotificationPreferences } from "@/service/seller"

interface NotificationsTabProps {
  showToast?: (msg: string) => void
  onShowToast?: (msg: string) => void
}

export const NotificationsTab = ({ showToast, onShowToast }: NotificationsTabProps) => {
  const triggerToast = showToast || onShowToast || (() => {})
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    webPush: true,
    sound: true,
  })

  const [events, setEvents] = useState({
    newOrders: true,
    orderCancellations: true,
    returnRequests: true,
    stockLow: true,
    stockOut: true,
    payouts: true,
    commissionInvoices: false,
    newReviews: true,
    customerMessages: true,
    securityAlerts: true,
  })

  const [alertPhone, setAlertPhone] = useState("+261 34 00 000 00")
  const [digestTime, setDigestTime] = useState("19:00")
  const [dndEnabled, setDndEnabled] = useState(false)
  const [dndStart, setDndStart] = useState("22:00")
  const [dndEnd, setDndEnd] = useState("07:00")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getNotificationPreferences()
      .then((preferences) => {
        setChannels((current) => ({
          ...current,
          email: preferences.email ?? current.email,
          sms: preferences.sms ?? current.sms,
          webPush: preferences.push ?? current.webPush,
        }))
        setEvents((current) => ({
          ...current,
          newOrders: preferences.newOrder ?? current.newOrders,
          orderCancellations: preferences.orderCancelled ?? current.orderCancellations,
          stockLow: preferences.lowStock ?? current.stockLow,
          newReviews: preferences.newReview ?? current.newReviews,
          payouts: preferences.payout ?? current.payouts,
        }))
      })
      .catch(() => setError("Impossible de charger les préférences de notifications."))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateNotificationPreferences({
        email: channels.email,
        sms: channels.sms,
        push: channels.webPush,
        newOrder: events.newOrders,
        orderCancelled: events.orderCancellations,
        lowStock: events.stockLow,
        newReview: events.newReviews,
        payout: events.payouts,
      })
      triggerToast("Préférences prises en charge enregistrées.")
    } catch {
      setError("Impossible d'enregistrer les préférences de notifications.")
    } finally {
      setSaving(false)
    }
  }

  const playTestSound = () => {
                                      
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime)      
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12)      
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.35)
      triggerToast("Test sonore joué avec succès")
    } catch {
      triggerToast("Aperçu sonore non supporté par ce navigateur")
    }
  }

  return (
    <div className="space-y-6">
      {loading && <p role="status" className="text-xs text-muted-foreground">Chargement des préférences…</p>}
      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-primary" />
            <CardTitle>17. Canaux de Réception des Alertes</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={playTestSound}>
            <Volume2 size={14} className="mr-1" />
            Tester le carillon
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Configurez les médias par lesquels vous et votre équipe recevez les alertes en temps réel à Madagascar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Courriel (Email)</p>
                  <p className="text-[11px] text-muted-foreground">hei.fiandrianana@gmail.com</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channels.email}
                onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                className="h-4 w-4 rounded text-primary accent-primary cursor-pointer"
              />
            </div>

            
            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground">WhatsApp Business Bot</p>
                    <Badge variant="success">Recommandé</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Alertes instantanées avec lien commande</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channels.whatsapp}
                onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                className="h-4 w-4 rounded text-primary accent-primary cursor-pointer"
              />
            </div>

            
            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Smartphone size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">SMS Telma / Orange / Airtel</p>
                  <p className="text-[11px] text-muted-foreground">Réservé aux urgences de livraison</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channels.sms}
                onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                className="h-4 w-4 rounded text-primary accent-primary cursor-pointer"
              />
            </div>

            
            <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Notifications Web Push</p>
                  <p className="text-[11px] text-muted-foreground">Bannière sur PC et mobile même minimisé</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channels.webPush}
                onChange={(e) => setChannels({ ...channels, webPush: e.target.checked })}
                className="h-4 w-4 rounded text-primary accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Numéro de téléphone destinataire des alertes WhatsApp / SMS
            </label>
            <input
              type="tel"
              value={alertPhone}
              onChange={(e) => setAlertPhone(e.target.value)}
              className="w-full max-w-sm px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">WhatsApp, numéro de destination, sonnerie, horaires silencieux et préférences d'événements supplémentaires restent locaux. Le contrat actuel ne permet de sauvegarder que les canaux Email/SMS/Push et commandes, annulations, stock faible, avis et versements.</p>
        </CardBody>
      </Card>

      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <CardTitle>Évènements & Alertes Spécifiques</CardTitle>
          </div>
          <Button variant="primary" size="sm" onClick={() => void handleSave()} loading={saving} disabled={loading}>
            <Save size={14} className="mr-1" />
            Enregistrer les alertes
          </Button>
        </CardHeader>
        <CardBody className="divide-y divide-border/60">
          
          <div className="py-3 first:pt-0 space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-primary" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Cycle des Commandes
              </span>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-foreground">Nouvelle commande validée</p>
                  <p className="text-[11px] text-muted-foreground">
                    Alerte immédiate avec montant et articles à préparer
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={events.newOrders}
                  onChange={(e) => setEvents({ ...events, newOrders: e.target.checked })}
                  className="h-4 w-4 text-primary accent-primary"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-foreground">Annulation de commande par le client</p>
                  <p className="text-[11px] text-muted-foreground">
                    Interrompt le colisage avant prise en charge par le livreur
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={events.orderCancellations}
                  onChange={(e) => setEvents({ ...events, orderCancellations: e.target.checked })}
                  className="h-4 w-4 text-primary accent-primary"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-foreground">Demande de retour ou litige sous 7j</p>
                  <p className="text-[11px] text-muted-foreground">
                    Notification d'ouverture de dossier de rétractation
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={events.returnRequests}
                  onChange={(e) => setEvents({ ...events, returnRequests: e.target.checked })}
                  className="h-4 w-4 text-primary accent-primary"
                />
              </label>
            </div>
          </div>

          
          <div className="py-3 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Inventaire & Stocks
              </span>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-foreground">Alerte stock faible (&le; 5 articles)</p>
                  <p className="text-[11px] text-muted-foreground">
                    Rappel de réapprovisionnement automatique
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={events.stockLow}
                  onChange={(e) => setEvents({ ...events, stockLow: e.target.checked })}
                  className="h-4 w-4 text-primary accent-primary"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-foreground">Rupture totale de stock (0 unité)</p>
                  <p className="text-[11px] text-muted-foreground">
                    Désactive temporairement le bouton d'achat côté Nova Market Client
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={events.stockOut}
                  onChange={(e) => setEvents({ ...events, stockOut: e.target.checked })}
                  className="h-4 w-4 text-primary accent-primary"
                />
              </label>
            </div>
          </div>

          
          <div className="py-3 space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Finances & Versements
              </span>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-foreground">Versement Mobile Money / Banque exécuté</p>
                  <p className="text-[11px] text-muted-foreground">
                    Bordereau de virement et référence de transaction Telma/Orange/Airtel/BNI
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={events.payouts}
                  onChange={(e) => setEvents({ ...events, payouts: e.target.checked })}
                  className="h-4 w-4 text-primary accent-primary"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-foreground">Émission facture mensuelle de commission</p>
                  <p className="text-[11px] text-muted-foreground">
                    Récapitulatif de TVA 20% et prélèvements de plateforme
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={events.commissionInvoices}
                  onChange={(e) => setEvents({ ...events, commissionInvoices: e.target.checked })}
                  className="h-4 w-4 text-primary accent-primary"
                />
              </label>
            </div>
          </div>

          
          <div className="py-3 space-y-3">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Avis & Expérience Client
              </span>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-foreground">Nouvelle évaluation ou commentaire client</p>
                  <p className="text-[11px] text-muted-foreground">
                    Permet de répondre sous 24h pour entretenir votre score de confiance
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={events.newReviews}
                  onChange={(e) => setEvents({ ...events, newReviews: e.target.checked })}
                  className="h-4 w-4 text-primary accent-primary"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-foreground">Nouveau message client pré-commande</p>
                  <p className="text-[11px] text-muted-foreground">
                    Questions de disponibilité et négociation tarifaire de gros
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={events.customerMessages}
                  onChange={(e) => setEvents({ ...events, customerMessages: e.target.checked })}
                  className="h-4 w-4 text-primary accent-primary"
                />
              </label>
            </div>
          </div>

          
          <div className="py-3 last:pb-0 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} className="text-rose-500" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Sécurité & Système
              </span>
            </div>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-foreground">Connexion suspecte ou tentative échouée</p>
                <p className="text-[11px] text-muted-foreground">
                  Alerte prioritaire envoyée immédiatement par SMS et Email
                </p>
              </div>
              <input
                type="checkbox"
                checked={events.securityAlerts}
                onChange={(e) => setEvents({ ...events, securityAlerts: e.target.checked })}
                className="h-4 w-4 text-primary accent-primary"
              />
            </label>
          </div>
        </CardBody>
      </Card>

      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <CardTitle>Plages Horaires & Récapitulatif Quotidien</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Heure du Digest quotidien (Madagascar - UTC+3)
              </label>
              <input
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Recevez le bilan de la journée (chiffre d'affaires, livraisons, commandes traitées).
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Mode Silencieux de nuit (Ne pas déranger)
                </label>
                <input
                  type="checkbox"
                  checked={dndEnabled}
                  onChange={(e) => setDndEnabled(e.target.checked)}
                  className="h-4 w-4 text-primary accent-primary cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-0.5">Début silence</span>
                  <input
                    type="time"
                    disabled={!dndEnabled}
                    value={dndStart}
                    onChange={(e) => setDndStart(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground disabled:opacity-50"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-0.5">Fin silence</span>
                  <input
                    type="time"
                    disabled={!dndEnabled}
                    value={dndEnd}
                    onChange={(e) => setDndEnd(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => void handleSave()} loading={saving} disabled={loading}>
              <CheckCircle2 size={14} className="mr-1" />
              Appliquer les réglages d'horaires
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
};
