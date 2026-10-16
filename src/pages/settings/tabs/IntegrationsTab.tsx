import { useEffect, useState } from "react"
import {
  Webhook,
  Key,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Send,
  Share2,
  FileSpreadsheet,
  Globe,
  ExternalLink,
  Code2,
  Save,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardBody, Button, Badge } from "@/components/ui"
import {
  createSellerWebhook,
  deleteSellerWebhook,
  getSellerApiKeys,
  getSellerIntegrations,
  getSellerWebhooks,
  rotateSellerApiKey,
  testSellerWebhook,
  updateSellerIntegrations,
  updateSellerWebhook,
} from "@/service/seller"
import type { ApiKey, SellerWebhook } from "@/type/seller"

interface IntegrationsTabProps {
  showToast?: (msg: string) => void
  onShowToast?: (msg: string) => void
}

type WebhookItem = SellerWebhook & { active: boolean; events: NonNullable<SellerWebhook["events"]> }

export const IntegrationsTab = ({ showToast, onShowToast }: IntegrationsTabProps) => {
  const triggerToast = showToast || onShowToast || (() => {})
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<ApiKey>({})
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [newWebhookUrl, setNewWebhookUrl] = useState("")
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

                  
  const [channels, setChannels] = useState({
    whatsappCatalog: false,
    facebookShop: false,
    odooErp: false,
    wooCommerce: false,
  })

  useEffect(() => {
    Promise.all([getSellerApiKeys(), getSellerWebhooks(), getSellerIntegrations()])
      .then(([keys, hookList, integrationPrefs]) => {
        setApiKey(Array.isArray(keys) ? keys[0] ?? {} : keys)
        setWebhooks(hookList.map((webhook) => ({
          ...webhook,
          active: webhook.active ?? webhook.enabled ?? false,
          events: webhook.events ?? [],
        })))
        setChannels((current) => ({
          whatsappCatalog: typeof integrationPrefs.whatsappCatalog === "boolean" ? integrationPrefs.whatsappCatalog : current.whatsappCatalog,
          facebookShop: typeof integrationPrefs.facebookShop === "boolean" ? integrationPrefs.facebookShop : current.facebookShop,
          odooErp: typeof integrationPrefs.odooErp === "boolean" ? integrationPrefs.odooErp : current.odooErp,
          wooCommerce: typeof integrationPrefs.wooCommerce === "boolean" ? integrationPrefs.wooCommerce : current.wooCommerce,
        }))
      })
      .catch(() => setError("Impossible de charger les intégrations et les clés API."))
      .finally(() => setLoading(false))
  }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(label)
    triggerToast(`${label} copiée dans le presse-papier`)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  const handleRegenerateKey = async () => {
    if (confirm("Attention : Régénérer votre clé secrète invalidera immédiatement toutes les intégrations en cours. Continuer ?")) {
      setSaving(true)
      setError(null)
      try {
        setApiKey(await rotateSellerApiKey())
        triggerToast("Clé API régénérée.")
      } catch {
        setError("Impossible de régénérer la clé API.")
      } finally {
        setSaving(false)
      }
    }
  }

  const handleTestWebhook = async (webhook: WebhookItem) => {
    try {
      const result = await testSellerWebhook(webhook.id)
      triggerToast(result.message ?? `Test envoyé : ${result.status ?? "résultat reçu"}.`)
    } catch {
      setError(`Le test du webhook ${webhook.url} a échoué.`)
    }
  }

  const handleAddWebhook = async () => {
    if (!newWebhookUrl.trim()) return
    setSaving(true)
    setError(null)
    try {
      const webhook = await createSellerWebhook({ url: newWebhookUrl.trim(), events: ["order.paid"] })
      setWebhooks((current) => [...current, { ...webhook, active: webhook.active ?? webhook.enabled ?? true, events: webhook.events ?? [] }])
      setNewWebhookUrl("")
      setShowNewWebhookModal(false)
      triggerToast("Endpoint webhook ajouté.")
    } catch {
      setError("Impossible d'ajouter cet endpoint webhook.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteWebhook = async (id: string) => {
    try {
      await deleteSellerWebhook(id)
      setWebhooks((current) => current.filter((webhook) => webhook.id !== id))
      triggerToast("Webhook supprimé.")
    } catch {
      setError("Impossible de supprimer ce webhook.")
    }
  }

  const handleToggleWebhook = async (webhook: WebhookItem) => {
    try {
      const updated = await updateSellerWebhook(webhook.id, { active: !webhook.active })
      setWebhooks((current) => current.map((item) => item.id === webhook.id
        ? { ...updated, active: updated.active ?? updated.enabled ?? !webhook.active, events: updated.events ?? item.events }
        : item))
    } catch {
      setError("Impossible de modifier ce webhook.")
    }
  }

  const saveChannels = async () => {
    setSaving(true)
    setError(null)
    try {
      const updated = await updateSellerIntegrations(channels)
      setChannels((current) => ({
        whatsappCatalog: typeof updated.whatsappCatalog === "boolean" ? updated.whatsappCatalog : current.whatsappCatalog,
        facebookShop: typeof updated.facebookShop === "boolean" ? updated.facebookShop : current.facebookShop,
        odooErp: typeof updated.odooErp === "boolean" ? updated.odooErp : current.odooErp,
        wooCommerce: typeof updated.wooCommerce === "boolean" ? updated.wooCommerce : current.wooCommerce,
      }))
      triggerToast("Paramètres des intégrations enregistrés.")
    } catch {
      setError("Impossible d'enregistrer les intégrations.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {loading && <p role="status" className="text-xs text-muted-foreground">Chargement des intégrations…</p>}
      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key size={18} className="text-primary" />
            <CardTitle>21. Clés d'API Nova Market Développeur</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => void handleRegenerateKey()} loading={saving} disabled={loading || saving}>
            <RefreshCw size={13} className="mr-1" />
            Régénérer la clé secrète
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Utilisez ces identifiants pour connecter votre propre logiciel de caisse, CRM ou système ERP à Nova Market.
          </p>

          <div className="space-y-3">
            
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Clé Publique (Publishable Key)
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={apiKey.publicKey ?? ""}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-border bg-muted/40 text-foreground focus:outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(apiKey.publicKey ?? "", "Clé Publique")}
                >
                  {copiedKey === "Clé Publique" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </Button>
              </div>
            </div>

            
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Clé Secrète (Secret Key) - Ne jamais divulguer côté client
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  type={showSecretKey ? "text" : "password"}
                  value={apiKey.secretKey ?? ""}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-border bg-muted/40 text-foreground focus:outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  {showSecretKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(apiKey.secretKey ?? "", "Clé Secrète")}
                >
                  {copiedKey === "Clé Secrète" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <Code2 size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-foreground">
              <span className="font-semibold">Documentation API :</span> Authentifiez chaque requête avec{" "}
              <code className="font-mono text-[11px] bg-card px-1 py-0.5 rounded border border-border">
                Authorization: Bearer &lt;sk_live_...&gt;
              </code>
              . Consultez la documentation Swagger à <span className="underline cursor-pointer">/api/v2/docs</span>.
            </div>
          </div>
        </CardBody>
      </Card>

      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook size={18} className="text-primary" />
            <CardTitle>Webhooks Sortants (Notifications Machine-to-Machine)</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowNewWebhookModal(true)}>
            <Plus size={14} className="mr-1" />
            Ajouter un endpoint
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Nova Market envoie un payload HTTP POST avec signature HMAC SHA-256 lors de chaque évènement de commande.
          </p>

          {showNewWebhookModal && (
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-fade-in">
              <p className="text-xs font-bold text-foreground">Nouvel Endpoint Webhook</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://votre-serveur.mg/api/nova-webhook"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none"
                />
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => void handleAddWebhook()} loading={saving} disabled={saving}>
                    Ajouter
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewWebhookModal(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {!loading && webhooks.length === 0 && <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Aucun webhook configuré.</p>}
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="p-3.5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-foreground truncate">
                      {wh.url}
                    </span>
                    <Badge variant={wh.active ? "success" : "neutral"}>
                      {wh.active ? "Actif" : "En pause"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {wh.events.map((ev) => (
                      <span
                        key={ev}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-muted text-muted-foreground"
                      >
                        {ev}
                      </span>
                    ))}
                    <span className="text-[11px] text-muted-foreground">
                      • {wh.lastTrigger ?? "Aucun déclenchement"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleToggleWebhook(wh)}
                  >
                    {wh.active ? "Mettre en pause" : "Activer"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleTestWebhook(wh)}
                  >
                    <Send size={12} className="mr-1" />
                    Tester (Ping)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    onClick={() => void handleDeleteWebhook(wh.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-primary" />
            <CardTitle>Canaux de Vente & Connecteurs Externes</CardTitle>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => void saveChannels()}
            loading={saving}
            disabled={loading || saving}
          >
            <Save size={14} className="mr-1" />
            Sauvegarder
          </Button>
        </CardHeader>
        <CardBody className="space-y-3.5">
          
          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Globe size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">Catalogue WhatsApp Business</p>
                  <Badge variant="success">Connecté</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Synchronise automatiquement les prix en Ariary et le stock avec vos conversations WhatsApp
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={channels.whatsappCatalog}
              onChange={(e) => setChannels({ ...channels, whatsappCatalog: e.target.checked })}
              className="h-4 w-4 text-primary accent-primary cursor-pointer"
            />
          </div>

          
          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <ExternalLink size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">Facebook Shop & Meta Commerce</p>
                  <Badge variant="neutral">Prêt</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Flux XML de catalogue pour taguer vos produits dans vos posts et stories Facebook Madagascar
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={channels.facebookShop}
              onChange={(e) => setChannels({ ...channels, facebookShop: e.target.checked })}
              className="h-4 w-4 text-primary accent-primary cursor-pointer"
            />
          </div>

          
          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">Connecteur ERP (Odoo / Sage / Dolibarr)</p>
                  <Badge variant="neutral">Bêta</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Export journalier des écritures comptables et factures au format normalisé malagasy
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={channels.odooErp}
              onChange={(e) => setChannels({ ...channels, odooErp: e.target.checked })}
              className="h-4 w-4 text-primary accent-primary cursor-pointer"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  )
};
