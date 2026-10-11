import { useState } from "react"
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

interface IntegrationsTabProps {
  showToast?: (msg: string) => void
  onShowToast?: (msg: string) => void
}

interface WebhookItem {
  id: string
  url: string
  events: string[]
  active: boolean
  lastTrigger?: string
}

export function IntegrationsTab({ showToast, onShowToast }: IntegrationsTabProps) {
  const triggerToast = showToast || onShowToast || (() => {})
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  const [apiKey] = useState({
    publicKey: "pk_live_nova_mkt_992a71bf4890c28e91",
    secretKey: "sk_live_nova_sec_8719fbc4102948bbca17304da0",
    createdDate: "01/10/2026",
  })

  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    {
      id: "wh_1",
      url: "https://api.mon-erp-madagascar.mg/webhooks/nova-orders",
      events: ["order.paid", "delivery.delivered"],
      active: true,
      lastTrigger: "Il y a 23 min (200 OK)",
    },
    {
      id: "wh_2",
      url: "https://stock.entrepot-tana.mg/sync/low-stock",
      events: ["inventory.low"],
      active: true,
      lastTrigger: "Hier 14:10 (200 OK)",
    },
  ])

  const [newWebhookUrl, setNewWebhookUrl] = useState("")
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false)

  // Channels sync
  const [channels, setChannels] = useState({
    whatsappCatalog: true,
    facebookShop: true,
    odooErp: false,
    wooCommerce: false,
  })

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(label)
    triggerToast(`${label} copiée dans le presse-papier`)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  const handleRegenerateKey = () => {
    if (confirm("Attention : Régénérer votre clé secrète invalidera immédiatement toutes les intégrations en cours. Continuer ?")) {
      triggerToast("Nouvelle clé d'API générée avec succès")
    }
  }

  const handleTestWebhook = (url: string) => {
    triggerToast(`Ping de test envoyé vers ${url} : Statut 200 OK`)
  }

  const handleAddWebhook = () => {
    if (!newWebhookUrl.trim()) return
    const newWh: WebhookItem = {
      id: `wh_${Date.now()}`,
      url: newWebhookUrl.trim(),
      events: ["order.paid"],
      active: true,
      lastTrigger: "Jamais déclenché",
    }
    setWebhooks([...webhooks, newWh])
    setNewWebhookUrl("")
    setShowNewWebhookModal(false)
    triggerToast("Endpoint de webhook ajouté")
  }

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id))
    triggerToast("Webhook supprimé")
  }

  return (
    <div className="space-y-6">
      {/* 21. Clés d'API Marchand */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key size={18} className="text-primary" />
            <CardTitle>21. Clés d'API Nova Market Développeur</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={handleRegenerateKey}>
            <RefreshCw size={13} className="mr-1" />
            Régénérer la clé secrète
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Utilisez ces identifiants pour connecter votre propre logiciel de caisse, CRM ou système ERP à Nova Market.
          </p>

          <div className="space-y-3">
            {/* Clé publique */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Clé Publique (Publishable Key)
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={apiKey.publicKey}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-border bg-muted/40 text-foreground focus:outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(apiKey.publicKey, "Clé Publique")}
                >
                  {copiedKey === "Clé Publique" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </Button>
              </div>
            </div>

            {/* Clé secrète */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Clé Secrète (Secret Key) - Ne jamais divulguer côté client
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  type={showSecretKey ? "text" : "password"}
                  value={apiKey.secretKey}
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
                  onClick={() => copyToClipboard(apiKey.secretKey, "Clé Secrète")}
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

      {/* Webhooks sortants */}
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
                  <Button variant="primary" size="sm" onClick={handleAddWebhook}>
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
                      • {wh.lastTrigger}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestWebhook(wh.url)}
                  >
                    <Send size={12} className="mr-1" />
                    Tester (Ping)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    onClick={() => handleDeleteWebhook(wh.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Connecteurs E-commerce & Canaux de vente */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-primary" />
            <CardTitle>Canaux de Vente & Connecteurs Externes</CardTitle>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onShowToast("Paramètres des canaux synchronisés")}
          >
            <Save size={14} className="mr-1" />
            Sauvegarder
          </Button>
        </CardHeader>
        <CardBody className="space-y-3.5">
          {/* WhatsApp Catalog */}
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

          {/* Facebook Shop / Instagram */}
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

          {/* Odoo / Sage ERP */}
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
}
