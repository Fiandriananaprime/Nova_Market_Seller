import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { motion, useReducedMotion } from "motion/react"
import {
  Check,
  Minus,
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  Building2,
  Package,
  BarChart3,
  Users,
  Truck,
  Webhook,
  Star,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
} from "lucide-react"
import { PageHeader, Badge, Toast, Card, CardBody } from "@/components/ui"
import {
  cancelSubscription,
  checkoutSubscription,
  getSubscription,
  getSubscriptionPlans,
  updateSubscription,
} from "@/service/seller"
import type { SubscriptionPlan } from "@/type/seller"

                                                                                 

type PlanId = "free" | "pro" | "max"

interface Plan {
  id: PlanId
  name: string
  tagline: string
  price: number                         
  priceLabel: string
  description: string
  badge?: string
  badgeColor?: string
  icon: React.ElementType
  accentColor: string
  borderClass: string
  features: string[]
  cta: (current: PlanId) => { label: string; action: "current" | "upgrade" | "downgrade" | "contact"; disabled: boolean }
}

                                                                                 

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Pour démarrer",
    price: 0,
    priceLabel: "Gratuit",
    description: "L'essentiel pour lancer votre activité sur Nova Market sans engagement.",
    icon: Sparkles,
    accentColor: "text-muted-foreground",
    borderClass: "border-border",
    features: [
      "Jusqu'à 30 produits actifs",
      "Gestion standard de la boutique",
      "Gestion manuelle des stocks",
      "Visibilité organique standard",
      "Analytiques de base",
      "Quota IA de base",
      "Gestion manuelle des commandes",
      "Promotions basiques",
      "Notifications essentielles",
      "Support standard",
    ],
    cta: (current) => {
      if (current === "free") return { label: "Plan actuel", action: "current", disabled: true }
      return { label: "Passer au Free", action: "downgrade", disabled: false }
    },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Pour les boutiques en croissance",
    price: 100_000,
    priceLabel: "100 000 Ar",
    description: "Plus de capacité, d'insights et d'automatisation pour accélérer vos ventes.",
    badge: "Le plus populaire",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    icon: Zap,
    accentColor: "text-primary",
    borderClass: "border-primary/40",
    features: [
      "Tout du plan Free, plus :",
      "Produits actifs illimités",
      "Édition groupée & import/export CSV",
      "Gestion avancée de la boutique",
      "10% de priorité supplémentaire en visibilité",
      "Quota IA augmenté",
      "Analytiques avancées & rapports",
      "Alertes stock configurables",
      "Gestion avancée des commandes",
      "Promotions avancées & stats campagnes",
      "Règles d'automatisation simples",
      "Collaboration en équipe (rôles prédéfinis)",
      "Support prioritaire",
    ],
    cta: (current) => {
      if (current === "pro") return { label: "Plan actuel", action: "current", disabled: true }
      if (current === "free") return { label: "Passer au Pro", action: "upgrade", disabled: false }
      return { label: "Revenir au Pro", action: "downgrade", disabled: false }
    },
  },
  {
    id: "max",
    name: "Max",
    tagline: "Pour les opérations avancées",
    price: 1_000_000,
    priceLabel: "1 000 000 Ar",
    description: "Automatisation complète, IA avancée et visibilité maximale pour les leaders du marché.",
    badge: "Premium",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Crown,
    accentColor: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-400/40",
    features: [
      "Tout du plan Pro, plus :",
      "50% de priorité supplémentaire en visibilité",
      "Quota IA ×5 par rapport au Free",
      "Génération de contenu produit assistée par IA",
      "Analytiques prédictives & prévisions de demande",
      "Inventaire multi-dépôts centralisé",
      "Alertes & suggestions de réapprovisionnement automatisées",
      "Workflows commandes & livraisons automatisés",
      "Gestion & optimisation de campagnes publicitaires",
      "Automatisation avancée (déclencheurs, conditions, actions)",
      "Permissions équipe avancées & journaux d'activité",
      "Intégrations avancées & accès API",
      "Support prioritaire renforcé",
    ],
    cta: (current) => {
      if (current === "max") return { label: "Plan actuel", action: "current", disabled: true }
      return { label: "Passer au Max", action: "upgrade", disabled: false }
    },
  },
]

const mergePlans = (availablePlans: SubscriptionPlan[]):Plan[] => {
  return availablePlans.flatMap((available) => {
    const template = PLANS.find((plan) => plan.id === available.id.toLowerCase())
    if (!template) return []
    const price = available.price ?? template.price
    return [{
      ...template,
      name: available.name ?? template.name,
      price,
      priceLabel: price === 0 ? "Gratuit" : `${price.toLocaleString("fr-MG")} Ar`,
      description: typeof available.description === "string" ? available.description : template.description,
    }]
  })
};

// ─── Comparison table ─────────────────────────────────────────────────────────

interface FeatureRow {
  label: string
  free: string | boolean
  pro: string | boolean
  max: string | boolean
  tooltip?: string
}

interface FeatureGroup {
  title: string
  icon: React.ElementType
  rows: FeatureRow[]
}

const COMPARISON_GROUPS: FeatureGroup[] = [
  {
    title: "Catalogue produits",
    icon: Package,
    rows: [
      { label: "Produits actifs", free: "30 max", pro: "Illimités", max: "Illimités" },
      { label: "Import/export CSV", free: false, pro: true, max: true },
      { label: "Édition groupée", free: false, pro: true, max: true },
      { label: "Génération contenu IA", free: false, pro: false, max: true, tooltip: "Descriptions, titres et tags générés automatiquement" },
    ],
  },
  {
    title: "Boutique & Visibilité",
    icon: Star,
    rows: [
      { label: "Personnalisation boutique", free: "Basique", pro: "Avancée", max: "Avancée" },
      { label: "Visibilité organique", free: "Standard", pro: "+10% priorité", max: "+50% priorité", tooltip: "Éligibilité accrue aux mises en avant, sans garantie de placement" },
      { label: "Gestion campagnes publicitaires", free: false, pro: false, max: true },
    ],
  },
  {
    title: "IA & Automatisation",
    icon: Sparkles,
    rows: [
      { label: "Quota IA", free: "Basique", pro: "Augmenté", max: "×5 par rapport au Free" },
      { label: "Règles d'automatisation", free: false, pro: "Simples", max: "Avancées (déclencheurs)" },
      { label: "Prévisions de demande", free: false, pro: false, max: true },
    ],
  },
  {
    title: "Inventaire & Logistique",
    icon: Truck,
    rows: [
      { label: "Gestion des stocks", free: "Manuelle", pro: "Alertes configurables", max: "Multi-dépôts & auto" },
      { label: "Réapprovisionnement automatique", free: false, pro: false, max: "Suggestions IA" },
      { label: "Workflows livraison automatisés", free: false, pro: false, max: true },
    ],
  },
  {
    title: "Analytiques & Rapports",
    icon: BarChart3,
    rows: [
      { label: "Tableau de bord analytics", free: "Basique", pro: "Avancé", max: "Prédictif" },
      { label: "Rapports exportables", free: false, pro: true, max: true },
      { label: "Stats campagnes promotionnelles", free: false, pro: true, max: true },
    ],
  },
  {
    title: "Équipe & Permissions",
    icon: Users,
    rows: [
      { label: "Collaboration en équipe", free: false, pro: "Rôles prédéfinis", max: "Permissions avancées" },
      { label: "Journaux d'activité", free: false, pro: false, max: true },
    ],
  },
  {
    title: "Intégrations",
    icon: Webhook,
    rows: [
      { label: "Accès API & webhooks", free: false, pro: false, max: "Avancé" },
      { label: "Intégrations tierces", free: "Basiques", pro: "Standard", max: "Avancées" },
    ],
  },
  {
    title: "Support",
    icon: Shield,
    rows: [
      { label: "Canal de support", free: "Standard", pro: "Prioritaire", max: "Prioritaire renforcé" },
      { label: "Temps de réponse", free: "48–72h", pro: "< 24h", max: "< 4h" },
    ],
  },
]

// ─── Cell renderer ────────────────────────────────────────────────────────────

const FeatureCell = ({ value, planId }: { value: string | boolean; planId: PlanId }) => {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
          planId === "max" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
          planId === "pro" ? "bg-primary/10 text-primary" :
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        }`}>
          <Check size={11} strokeWidth={2.5} />
        </div>
      </div>
    )
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <Minus size={14} className="text-muted-foreground/40" />
      </div>
    )
  }
  return (
    <span className={`text-xs font-medium text-center block ${
      planId === "max" ? "text-amber-600 dark:text-amber-400" :
      planId === "pro" ? "text-primary" :
      "text-foreground"
    }`}>
      {value}
    </span>
  )
};

// ─── Plan Card ────────────────────────────────────────────────────────────────

const PlanCard = ({
  plan,
  currentPlan,
  onAction,
  index,
}: {
  plan: Plan
  currentPlan: PlanId | null
  onAction: (plan: Plan, action: string) => void
  index: number
}) => {
  const Icon = plan.icon
  const cta = currentPlan ? plan.cta(currentPlan) : { label: "Chargement…", action: "current" as const, disabled: true }
  const isCurrent = currentPlan === plan.id
  const isHighlighted = plan.id === "pro"
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : { y: -4, transition: { duration: 0.18, delay: 0 } }
      }
      transition={{ duration: 0.4, delay: index * 0.09, ease: "easeOut" }}
      className={`relative flex flex-col rounded-2xl border bg-card transition-all duration-200 ${plan.borderClass} ${
        isHighlighted
          ? "shadow-lg shadow-primary/8 ring-1 ring-primary/20 scale-[1.01]"
          : plan.id === "max"
          ? "shadow-md shadow-amber-500/8"
          : "shadow-xs"
      }`}
    >
      
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border ${plan.badgeColor}`}>
            {plan.id === "max" ? <Crown size={10} /> : <Zap size={10} />}
            {plan.badge}
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1 gap-5">
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              plan.id === "max" ? "bg-amber-500/10" :
              plan.id === "pro" ? "bg-primary/10" :
              "bg-muted"
            }`}>
              <Icon size={18} className={plan.accentColor} />
            </div>
            {isCurrent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Actuel
              </span>
            )}
          </div>

          <div>
            <h3 className="font-display font-extrabold text-lg text-foreground">{plan.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{plan.tagline}</p>
          </div>

          
          <div className="flex items-baseline gap-1.5">
            {plan.price === 0 ? (
              <span className="font-display font-extrabold text-3xl text-foreground">Gratuit</span>
            ) : (
              <>
                <span className={`font-display font-extrabold text-2xl ${plan.accentColor}`}>
                  {plan.price.toLocaleString("fr-MG")}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">Ar</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
        </div>

        
        <div className="h-px bg-border/60" />

        
        <ul className="space-y-2.5 flex-1">
          {plan.features.map((f, i) => {
            const isHeader = f.endsWith(", plus :")
            if (isHeader) {
              return (
                <li key={i} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pt-1">
                  {f}
                </li>
              )
            }
            return (
              <li key={i} className="flex items-start gap-2.5 text-xs text-foreground">
                <Check
                  size={13}
                  strokeWidth={2.5}
                  className={`shrink-0 mt-0.5 ${
                    plan.id === "max" ? "text-amber-500" :
                    plan.id === "pro" ? "text-primary" :
                    "text-emerald-500"
                  }`}
                />
                <span className="leading-relaxed">{f}</span>
              </li>
            )
          })}
        </ul>

        
        <button
          type="button"
          disabled={cta.disabled}
          onClick={() => onAction(plan, cta.action)}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40
            disabled:cursor-not-allowed disabled:opacity-60
            ${cta.action === "current"
              ? "bg-muted text-muted-foreground border border-border"
              : plan.id === "max"
              ? "bg-amber-500 hover:bg-amber-400 text-white shadow-sm shadow-amber-500/30 active:bg-amber-600"
              : plan.id === "pro"
              ? "bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/30 active:scale-[0.98]"
              : "bg-muted hover:bg-muted/80 text-foreground border border-border"
            }`}
        >
          <span className="flex items-center justify-center gap-2">
            {cta.action === "upgrade" && <ArrowRight size={14} />}
            {cta.label}
          </span>
        </button>
      </div>
    </motion.div>
  )
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const Subscription = () => {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [showFullTable, setShowFullTable] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<PlanId | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getSubscription(), getSubscriptionPlans()])
      .then(([subscription, availablePlans]) => {
        const selected = subscription.plan ?? subscription.planId
        setCurrentPlan(typeof selected === "string" && ["free", "pro", "max"].includes(selected.toLowerCase())
          ? selected.toLowerCase() as PlanId
          : null)
        setPlans(mergePlans(availablePlans))
      })
      .catch(() => setError("Impossible de charger l'abonnement et les offres."))
      .finally(() => setLoading(false))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  async function handlePlanAction(plan: Plan, action: string) {
    if (action === "current") return
    if (action === "contact") {
      showToast("Contactez le support Nova Market pour cette opération.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (action === "upgrade") {
        const checkout = await checkoutSubscription({ plan: plan.id })
        if (checkout.checkoutUrl) window.location.assign(checkout.checkoutUrl)
        else showToast("Votre demande de paiement a été créée.")
      } else {
        const updated = await updateSubscription({ plan: plan.id })
        const selected = updated.plan
        if (typeof selected === "string" && ["free", "pro", "max"].includes(selected.toLowerCase())) {
          setCurrentPlan(selected.toLowerCase() as PlanId)
        } else {
          setCurrentPlan(plan.id)
        }
        showToast(`Abonnement mis à jour vers ${plan.name}.`)
      }
    } catch {
      setError("Impossible de modifier l'abonnement. Réessayez.")
    } finally {
      setSaving(false)
    }
  }

  const currentPlanDef = plans.find((p) => p.id === currentPlan)

  const visibleGroups = showFullTable ? COMPARISON_GROUPS : COMPARISON_GROUPS.slice(0, 4)

  return (
    <div className="p-4 md:p-8 space-y-10 animate-fade-in max-w-screen-xl mx-auto pb-16">
      
      <PageHeader
        title="Plans & Abonnement"
        subtitle="Choisissez le plan adapté à la taille et aux ambitions de votre boutique"
        badge={currentPlanDef ? (
          <Badge variant="primary" dot>
            Plan actuel : {currentPlanDef.name}
          </Badge>
        ) : undefined}
        actions={
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
          >
            Facturation & paiements
            <ExternalLink size={12} />
          </button>
        }
      />

      
      {loading && <p role="status" className="text-sm text-muted-foreground">Chargement des offres…</p>}
      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
      {!loading && plans.length === 0 && !error && <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Aucune offre disponible.</p>}
      {currentPlanDef && currentPlan !== "free" && (
        <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          currentPlan === "max"
            ? "border-amber-400/30 bg-amber-500/5"
            : "border-primary/20 bg-primary/5"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              currentPlan === "max" ? "bg-amber-500/10" : "bg-primary/10"
            }`}>
              {currentPlan === "max" ? <Crown size={17} className="text-amber-500" /> : <Zap size={17} className="text-primary" />}
            </div>
            <div>
              <p className="font-display font-bold text-sm text-foreground">
                Vous êtes sur le plan {currentPlanDef.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Votre abonnement actif est géré par le service Nova Market.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Actif
            </span>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                if (!window.confirm("Annuler votre abonnement ?")) return
                setSaving(true)
                setError(null)
                try {
                  await cancelSubscription()
                  setCurrentPlan("free")
                  showToast("Abonnement annulé.")
                } catch {
                  setError("Impossible d'annuler l'abonnement. Réessayez.")
                } finally {
                  setSaving(false)
                }
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
            >
              Gérer l'abonnement
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              onAction={handlePlanAction}
              index={index}
            />
          ))}
        </div>

        
        <p className="text-center text-[11px] text-muted-foreground mt-5 flex items-center justify-center gap-1.5">
          <Info size={12} />
          Les prix sont en Ariary malgache (Ar). Paiement via Mobile Money (MVola, Orange Money, Airtel Money) ou BNI Madagascar. Les améliorations de visibilité augmentent l'éligibilité aux mises en avant sans garantie de placement.
        </p>
      </section>

      
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">Comparaison détaillée</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Tout ce que chaque plan inclut, fonctionnalité par fonctionnalité</p>
          </div>
        </div>

        <Card className="overflow-hidden border-border/80">
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[40%]">
                    Fonctionnalité
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="py-3.5 px-4 text-center w-[20%]">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-extrabold ${
                          plan.id === "max" ? "text-amber-600 dark:text-amber-400" :
                          plan.id === "pro" ? "text-primary" :
                          "text-foreground"
                        }`}>
                          {plan.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {plan.price === 0 ? "Gratuit" : `${plan.price.toLocaleString("fr-MG")} Ar`}
                        </span>
                        {currentPlan === plan.id && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Actuel
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleGroups.map((group) => {
                  const GroupIcon = group.icon
                  const isExpanded = expandedGroup === group.title
                  return (
                    <>
                      
                      <tr
                        key={`group-${group.title}`}
                        className="border-b border-border/40 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => setExpandedGroup(isExpanded ? null : group.title)}
                      >
                        <td colSpan={4} className="py-2.5 px-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GroupIcon size={13} className="text-primary shrink-0" />
                              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                                {group.title}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp size={13} className="text-muted-foreground" />
                            ) : (
                              <ChevronDown size={13} className="text-muted-foreground" />
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {group.rows.map((row, ri) => (
                        <tr
                          key={`row-${group.title}-${ri}`}
                          className={`border-b border-border/30 transition-colors hover:bg-muted/20 ${
                            !isExpanded ? "hidden md:table-row" : ""
                          }`}
                        >
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-foreground">{row.label}</span>
                              {row.tooltip && (
                                <div className="group relative">
                                  <Info size={11} className="text-muted-foreground/60 cursor-help" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 w-48 p-2 rounded-lg bg-popover border border-border shadow-lg text-[10px] text-muted-foreground leading-relaxed">
                                    {row.tooltip}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <FeatureCell value={row.free} planId="free" />
                          </td>
                          <td className="py-3 px-4 text-center bg-primary/[0.02]">
                            <FeatureCell value={row.pro} planId="pro" />
                          </td>
                          <td className="py-3 px-4 text-center bg-amber-500/[0.02]">
                            <FeatureCell value={row.max} planId="max" />
                          </td>
                        </tr>
                      ))}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>

          
          {COMPARISON_GROUPS.length > 4 && (
            <div className="border-t border-border/40 bg-muted/20 px-5 py-3 flex justify-center">
              <button
                type="button"
                onClick={() => setShowFullTable((v) => !v)}
                className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {showFullTable ? (
                  <>
                    <ChevronUp size={13} />
                    Réduire le tableau
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} />
                    Voir toutes les catégories ({COMPARISON_GROUPS.length - 4} de plus)
                  </>
                )}
              </button>
            </div>
          )}
        </Card>
      </section>

      
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <Card>
          <CardBody className="space-y-4">
            <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
              <Info size={15} className="text-primary" />
              Questions fréquentes
            </h3>
            <div className="space-y-4 text-xs">
              {[
                {
                  q: "Puis-je changer de plan à tout moment ?",
                  a: "Oui. Vous pouvez passer à un plan supérieur immédiatement ou rétrograder à la fin de la période en cours.",
                },
                {
                  q: "Comment fonctionne le paiement ?",
                  a: "Les paiements sont traités via Mobile Money (Telma MVola, Orange Money, Airtel Money) ou virement BNI Madagascar. Aucune carte bancaire internationale requise.",
                },
                {
                  q: "Que se passe-t-il si je dépasse la limite de 30 produits en Free ?",
                  a: "Vos produits existants restent actifs, mais vous ne pourrez pas en ajouter de nouveaux tant que vous n'avez pas mis à niveau votre plan ou supprimé des références.",
                },
                {
                  q: "Les améliorations de visibilité sont-elles garanties ?",
                  a: "Non. Elles augmentent votre éligibilité aux mises en avant sur la marketplace Nova Market, mais le placement final dépend de la performance globale de votre boutique.",
                },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <p className="font-semibold text-foreground">{item.q}</p>
                  <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        
        <div className="flex flex-col gap-4">
          {currentPlan === "free" && (
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 to-card p-6 space-y-4 flex flex-col justify-between flex-1">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap size={19} className="text-primary" />
                </div>
                <h3 className="font-display font-extrabold text-base text-foreground">
                  Passez au Pro dès maintenant
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Débloquez les produits illimités, les analytiques avancées, l'automatisation et le support prioritaire pour accélérer votre croissance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const proPlan = plans.find((plan) => plan.id === "pro")
                  if (proPlan) void handlePlanAction(proPlan, "upgrade")
                }}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <ArrowRight size={14} />
                Passer au Pro — 100 000 Ar
              </button>
            </div>
          )}

          
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-muted-foreground" />
              <span className="font-display font-bold text-sm text-foreground">Besoin d'un plan sur mesure ?</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pour les enseignes multi-boutiques, les marques établies ou les besoins spécifiques en intégration, contactez l'équipe commerciale Nova Market.
            </p>
            <button
              type="button"
              onClick={() => showToast("Demande commerciale — contactez support@novamarket.mg")}
              className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors cursor-pointer"
            >
              Contacter l'équipe commerciale
              <ExternalLink size={11} />
            </button>
          </div>
        </div>
      </section>

      
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
};
export default Subscription
