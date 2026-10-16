import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Activity, ArrowRight, Bot, CircleAlert, Clock3, Expand, LockKeyhole, MessageSquarePlus, Minimize2, Search, Send, Sparkles, Workflow, X } from "lucide-react"
import { PageHeader } from "@/components/ui"
import CrystalizedBall from "@/components/CrystalizedBall.jsx"
import { PLAN_ENTITLEMENTS, canUseAutomationBuilder, type SellerPlan } from "@/features/ai-automation/entitlements"
import {
  createAutomation,
  deleteAutomation,
  getAutomations,
  getSubscription,
  sendSellerAiMessage,
  updateAutomation,
} from "@/service/seller"
import type { Automation } from "@/type/seller"

type Template = { id: string; title: string; detail: string; trigger: string; action: string; plan: "pro" | "max" }
type ChatMessage = { role: "user" | "assistant"; content: string }
type Translate = (key: string) => string

const templates: Template[] = [
  { id: "low-stock", title: "lowStock", detail: "lowStockDetail", trigger: "lowStock", action: "notify", plan: "pro" },
  { id: "new-order", title: "newOrder", detail: "newOrderDetail", trigger: "newOrder", action: "notify", plan: "pro" },
  { id: "unprocessed", title: "unprocessed", detail: "unprocessedDetail", trigger: "unprocessed", action: "notify", plan: "pro" },
  { id: "out-of-stock", title: "outOfStock", detail: "outOfStockDetail", trigger: "outOfStock", action: "restock", plan: "max" },
  { id: "report", title: "report", detail: "reportDetail", trigger: "schedule", action: "reportAction", plan: "max" },
  { id: "delivery", title: "delivery", detail: "deliveryDetail", trigger: "deliveryDelay", action: "notify", plan: "max" },
  { id: "optimize", title: "optimize", detail: "optimizeDetail", trigger: "manual", action: "suggest", plan: "max" },
  { id: "sales", title: "sales", detail: "salesDetail", trigger: "salesThreshold", action: "notify", plan: "pro" },
  { id: "promotion", title: "promotion", detail: "promotionDetail", trigger: "schedule", action: "promotionAction", plan: "max" },
  { id: "restock", title: "restockSuggestion", detail: "restockDetail", trigger: "stockSales", action: "suggest", plan: "max" },
]

const AiAutomation = () => {
  const { t } = useTranslation()
  const [tab, setTab] = useState<"assistant" | "automations">("assistant")
  const [sellerPlan, setSellerPlan] = useState<SellerPlan | null>(null)
  const [planLoading, setPlanLoading] = useState(true)
  const [planError, setPlanError] = useState<string | null>(null)

  useEffect(() => {
    getSubscription()
      .then((subscription) => {
        const plan = (subscription.plan ?? subscription.planId)?.toString().toLowerCase()
        if (plan === "free" || plan === "pro" || plan === "max") setSellerPlan(plan)
        else setPlanError("Votre offre actuelle n'est pas disponible.")
      })
      .catch(() => setPlanError("Impossible de charger votre offre."))
      .finally(() => setPlanLoading(false))
  }, [])

  return (
    <div className="p-6 md:p-8 flex h-full min-h-0 flex-col gap-5">
      <PageHeader
        title={t("aiAutomation.title")}
        subtitle={t("aiAutomation.subtitle")}
        badge={sellerPlan ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {t(`aiAutomation.plan.${sellerPlan}`)}
          </span>
        ) : undefined}
      />
      {planLoading && <p role="status" className="text-sm text-muted-foreground">{t("aiAutomation.loadingPlan", "Chargement de votre offreâ€¦")}</p>}
      {planError && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{planError}</p>}
      <div role="tablist" aria-label={t("aiAutomation.tabsLabel")} className="flex w-fit gap-1 rounded-xl border border-border bg-card p-1">
        {(["assistant", "automations"] as const).map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className={`min-h-10 rounded-lg px-4 text-sm font-medium ${tab === name ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
          >
            {t(`aiAutomation.tab.${name}`)}
          </button>
        ))}
      </div>
      {tab === "assistant" ? <Assistant planName={sellerPlan ? t(`aiAutomation.plan.${sellerPlan}`) : "â€”"} quota={sellerPlan ? PLAN_ENTITLEMENTS[sellerPlan].aiQuota : "unavailable"} /> : <AutomationCenter sellerPlan={sellerPlan} />}
    </div>
  )
};
export default AiAutomation;

const Assistant = ({ planName, quota }: { planName: string; quota: string }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [fullScreen, setFullScreen] = useState(false)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!fullScreen) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullScreen(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [fullScreen])

  const send = async () => {
    const message = input.trim()
    if (!message || isSending) return
    setMessages((items) => [...items, { role: "user", content: message }])
    setInput("")
    setSendError(null)
    setIsSending(true)
    try {
      const response = await sendSellerAiMessage(message)
      const answer = response.message ?? response.content
      if (!answer) throw new Error("AI response had no message")
      setMessages((items) => [...items, { role: "assistant", content: answer }])
    } catch {
      setSendError(t("aiAutomation.sendError", "Le message n'a pas pu Ãªtre envoyÃ©. RÃ©essayez."))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <div className="grid min-h-[560px] flex-1 gap-4 xl:grid-cols-[250px_minmax(0,1fr)]">
        <aside className={`${historyOpen ? "fixed inset-0 z-40 block bg-black/30 p-4" : "hidden"} xl:static xl:block xl:bg-transparent xl:p-0`}>
          <div className="flex h-full max-h-[calc(100vh-11rem)] flex-col rounded-2xl border border-border/80 bg-card">
            <div className="flex items-center justify-between border-b border-border/70 p-4">
              <h2 className="text-sm font-semibold">{t("aiAutomation.history")}</h2>
              <button aria-label={t("aiAutomation.newConversation")} onClick={() => setMessages([])} className="rounded-lg p-2 text-primary hover:bg-primary/10">
                <MessageSquarePlus size={17} />
              </button>
            </div>
            <label className="relative m-3">
              <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
              <input placeholder={t("aiAutomation.searchHistory")} className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs" />
            </label>
            <div className="flex-1 p-3">
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">{t("aiAutomation.recent")}</p>
              {messages.length ? (
                <p className="mt-2 w-full truncate rounded-lg bg-primary/5 p-2 text-left text-xs">{messages[0].content}</p>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">{t("aiAutomation.emptyHistory")}</p>
              )}
            </div>
            <div className="border-t border-border/60 p-3">
              <div className="rounded-xl bg-muted/60 p-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{t("aiAutomation.quota")}</span>
                  <span>{t(`aiAutomation.plan.${planName}`)}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t(`aiAutomation.quotaType.${quota}`)}</p>
                <div className="mt-3 h-1.5 rounded-full bg-border" />
                <p className="mt-2 text-[11px] text-muted-foreground">{t("aiAutomation.quotaUnavailable")}</p>
              </div>
              <button onClick={() => navigate("/subscription")} className="mt-2 flex min-h-10 w-full items-center justify-center gap-1 text-xs font-semibold text-primary">
                {t("aiAutomation.upgrade")} <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </aside>
        <section className="flex min-h-[560px] min-w-0 flex-col rounded-2xl border border-border/80 bg-card">
          <header className="flex items-center justify-between border-b border-border/70 p-4">
            <AssistantIdentity t={t} />
            <div className="flex items-center gap-2">
              <button onClick={() => setHistoryOpen(true)} className="min-h-10 px-3 text-xs text-muted-foreground xl:hidden">
                {t("aiAutomation.history")}
              </button>
              <button
                type="button"
                onClick={() => setFullScreen(true)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted"
              >
                <Expand size={15} />
                <span className="hidden sm:inline">{t("aiExperience.fullscreen")}</span>
              </button>
            </div>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            {messages.length ? (
              <MessageFeed messages={messages} />
            ) : (
              <AssistantWelcome t={t} onSelect={(key) => setInput(t(`aiAutomation.prompt.${key}`))} />
            )}
          </div>
          {sendError && <p role="alert" className="px-4 pt-3 text-xs text-destructive">{sendError}</p>}
          {isSending && <p role="status" className="px-4 pt-3 text-xs text-muted-foreground">{t("aiAutomation.thinking", "RÃ©ponse en coursâ€¦")}</p>}
          <AssistantComposer input={input} setInput={setInput} onSend={send} t={t} disabled={isSending} />
        </section>
      </div>
      {fullScreen && (
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="immersive-assistant-title"
          className={`fixed inset-0 z-[100] flex h-[100dvh] flex-col overflow-hidden ${isDark ? "bg-[#070B17] text-white" : "bg-slate-50 text-slate-900"}`}
        >
          <header className={`flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-8 ${isDark ? "border-white/10" : "border-slate-900/10"}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? "bg-blue-400/10 text-blue-300" : "bg-blue-500/10 text-blue-600"}`}>
                <Bot size={18} />
              </div>
              <div>
                <h2 id="immersive-assistant-title" className="text-sm font-semibold">{t("aiAutomation.assistant")}</h2>
                <p className={`flex items-center gap-1.5 text-[11px] ${isDark ? "text-white/55" : "text-slate-500"}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {t("aiExperience.ready")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFullScreen(false)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition ${isDark ? "border-white/15 text-white/80 hover:border-white/30 hover:bg-white/5" : "border-slate-900/15 text-slate-700 hover:border-slate-900/30 hover:bg-slate-900/5"}`}
            >
              <Minimize2 size={15} />
              <span className="hidden sm:inline">{t("aiExperience.exitFullscreen")}</span>
              <X size={15} className="sm:hidden" />
            </button>
          </header>
          <main className="relative flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_34%,rgba(37,99,235,0.13),transparent_55%)]" />
            {messages.length ? (
              <div className="relative flex w-full max-w-3xl flex-1 flex-col items-center py-3">
                <div className="h-40 w-40 shrink-0 sm:h-48 sm:w-48">
                  <CrystalizedBall preset="nebula" theme={isDark ? "dark" : "light"} color="#4F8CFF" size={0.82} particleCount={6000} />
                </div>
                <div className="mt-2 w-full flex-1 space-y-3 overflow-y-auto pb-4" aria-live="polite">
                  <MessageFeed messages={messages} />
                </div>
              </div>
            ) : (
              <div className="relative flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-4 text-center">
                <div className="h-[clamp(210px,42vh,390px)] w-[clamp(210px,42vh,390px)]">
                  <CrystalizedBall preset="nebula" theme={isDark ? "dark" : "light"} color="#4F8CFF" size={0.92} particleCount={10000} />
                </div>
                <div className="-mt-2">
                  <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-blue-200/75">
                    <Sparkles size={13} />
                    {t("aiExperience.ready")}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("aiAutomation.welcome")}</h3>
                  <p className={`mx-auto mt-2 max-w-lg text-sm leading-6 ${isDark ? "text-white/55" : "text-slate-600"}`}>{t("aiAutomation.welcomeDescription")}</p>
                </div>
                <div className="mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
                  {["sales", "stock", "bestSellers", "summary"].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setInput(t(`aiAutomation.prompt.${key}`))}
                      className={`rounded-full border px-3.5 py-2 text-left text-xs transition ${isDark ? "border-white/10 bg-white/[0.04] text-white/75 hover:border-blue-300/40 hover:bg-blue-400/10 hover:text-white" : "border-slate-900/10 bg-slate-900/[0.02] text-slate-700 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-slate-900"}`}
                    >
                      {t(`aiAutomation.prompt.${key}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>
          <footer className={`relative shrink-0 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-8 ${isDark ? "border-white/10 bg-[#070B17]/90" : "border-slate-900/10 bg-slate-50/90"}`}>
            {sendError && <p role="alert" className="mx-auto w-full max-w-3xl pt-2 text-xs text-red-500">{sendError}</p>}
            {isSending && <p role="status" className="mx-auto w-full max-w-3xl pt-2 text-xs text-muted-foreground">{t("aiAutomation.thinking", "RÃ©ponse en coursâ€¦")}</p>}
            <AssistantComposer input={input} setInput={setInput} onSend={send} t={t} immersive darkMode={isDark} disabled={isSending} />
          </footer>
        </section>
      )}
    </>
  )
};

const AssistantIdentity = ({ t }: { t: Translate }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2 text-primary"><Bot size={17} /></div>
      <div>
        <h2 className="text-sm font-semibold">{t("aiAutomation.assistant")}</h2>
        <p className="text-[11px] text-muted-foreground">{t("aiAutomation.assistantCaption")}</p>
      </div>
    </div>
  )
};

const AssistantWelcome = ({ t, onSelect }: { t: Translate; onSelect: (key: string) => void }) => {
  const prompts = ["sales", "stock", "description", "promote", "bestSellers", "cancelled", "promotion", "summary"]
  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary"><Sparkles size={22} /></div>
      <h3 className="mt-4 text-center text-lg font-semibold">{t("aiAutomation.welcome")}</h3>
      <p className="mx-auto mt-2 max-w-lg text-center text-sm leading-6 text-muted-foreground">{t("aiAutomation.welcomeDescription")}</p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {prompts.map((key) => (
          <button key={key} type="button" onClick={() => onSelect(key)} className="min-h-12 rounded-xl border border-border px-3 py-2.5 text-left text-xs hover:border-primary/40 hover:bg-primary/[0.03]">
            {t(`aiAutomation.prompt.${key}`)}
          </button>
        ))}
      </div>
      <p className="mt-5 text-center text-[11px] text-muted-foreground">{t("aiAutomation.backendUnavailable")}</p>
    </div>
  )
};

const MessageFeed = ({ messages }: { messages: ChatMessage[] }) => {
  return (
    <>
      {messages.map((message, index) => (
        <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-primary text-white" : "border border-border bg-background"}`}>
            {message.content}
          </p>
        </div>
      ))}
    </>
  )
};

const AssistantComposer = ({
  input,
  setInput,
  onSend,
  t,
  immersive = false,
  darkMode = false,
  disabled = false,
}: {
  input: string
  setInput: (value: string) => void
  onSend: () => void
  t: Translate
  immersive?: boolean
  darkMode?: boolean
  disabled?: boolean
}) => {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSend()
  }

  return (
    <form onSubmit={submit} className={immersive ? "mx-auto w-full max-w-3xl" : "border-t border-border/70 p-3 sm:p-4"}>
      <div className={`flex items-end gap-2 rounded-xl border p-2 ${immersive ? darkMode ? "border-white/15 bg-white/[0.05] focus-within:border-blue-300/50" : "border-slate-900/15 bg-white focus-within:border-blue-500/50" : "border-border bg-background focus-within:border-primary"}`}>
        <textarea
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              onSend()
            }
          }}
          placeholder={t("aiAutomation.composerPlaceholder")}
          className={`max-h-32 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm outline-none ${immersive ? darkMode ? "text-white placeholder:text-white/35" : "text-slate-900 placeholder:text-slate-400" : ""}`}
        />
        <button
          type="submit"
          aria-label={t("aiAutomation.send")}
          disabled={!input.trim() || disabled}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white disabled:opacity-40 ${immersive ? "bg-blue-500 hover:bg-blue-400" : "bg-primary"}`}
        >
          <Send size={16} />
        </button>
      </div>
      <p className={`mt-2 px-1 text-[10px] ${immersive ? darkMode ? "text-center text-white/35" : "text-center text-slate-500" : "text-muted-foreground"}`}>{t("aiAutomation.composerHint")}</p>
    </form>
  )
};

const AutomationCenter = ({ sellerPlan }: { sellerPlan: SellerPlan | null }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const allowed = sellerPlan !== null && canUseAutomationBuilder(sellerPlan)
  const selectedTemplate = templates.find((item) => item.id === selected)
  const visible = templates
    .filter((item) => filter === "all" || item.plan === filter)
    .filter((item) => t(`aiAutomation.template.${item.title}`).toLowerCase().includes(query.toLowerCase()))

  const loadAutomations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setAutomations(await getAutomations())
    } catch {
      setError(t("aiAutomation.automationLoadError", "Impossible de charger les automatisations."))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { void loadAutomations() }, [loadAutomations])

  const openBuilder = (templateId: string) => {
    setSelected(templateId)
    const template = templates.find((item) => item.id === templateId)
    setWorkflowName(template ? t(`aiAutomation.template.${template.title}`) : "")
    setWorkflowDescription(template ? t(`aiAutomation.template.${template.detail}`) : "")
  }

  const saveAutomation = async (enabled: boolean) => {
    if (!selectedTemplate || !workflowName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const automation = await createAutomation({
        name: workflowName.trim(),
        description: workflowDescription.trim(),
        trigger: selectedTemplate.trigger,
        action: selectedTemplate.action,
        enabled,
      })
      setAutomations((current) => [...current, automation])
      setSelected(null)
    } catch {
      setError(t("aiAutomation.automationSaveError", "Impossible d'enregistrer cette automatisation."))
    } finally {
      setSaving(false)
    }
  }

  const toggleAutomation = async (automation: Automation) => {
    const enabled = !(automation.enabled ?? automation.status === "active")
    try {
      const updated = await updateAutomation(automation.id, { enabled })
      setAutomations((current) => current.map((item) => item.id === automation.id ? updated : item))
    } catch {
      setError(t("aiAutomation.automationUpdateError", "Impossible de modifier cette automatisation."))
    }
  }

  const removeAutomation = async (automation: Automation) => {
    try {
      await deleteAutomation(automation.id)
      setAutomations((current) => current.filter((item) => item.id !== automation.id))
    } catch {
      setError(t("aiAutomation.automationDeleteError", "Impossible de supprimer cette automatisation."))
    }
  }

  const counts = {
    total: automations.length,
    active: automations.filter((item) => item.enabled ?? item.status === "active").length,
    paused: automations.filter((item) => !(item.enabled ?? item.status === "active")).length,
    failed: automations.filter((item) => item.status === "failed").length,
  }

  return (
    <div className="flex-1 space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {([[Workflow, "total"], [Activity, "active"], [Clock3, "paused"], [CircleAlert, "failed"]] as const).map(([Icon, label]) => (
          <div key={label} className="rounded-2xl border border-border/80 bg-card p-4">
            <div className="flex justify-between text-xs text-muted-foreground"><span>{t(`aiAutomation.stat.${label}`)}</span><Icon size={16} /></div>
            <p className="mt-3 text-2xl font-semibold">{counts[label]}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/[0.035] p-4 sm:flex-row sm:items-center">
        <div><h2 className="flex items-center gap-2 text-sm font-semibold"><Workflow size={16} className="text-primary" />{t("aiAutomation.automationIntro")}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">{t(allowed ? "aiAutomation.proIntro" : "aiAutomation.freeIntro")}</p></div>
        <button onClick={() => allowed ? openBuilder("new") : navigate("/subscription")} disabled={!sellerPlan} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-white disabled:opacity-50">{t(allowed ? "aiAutomation.create" : "aiAutomation.unlock")}<ArrowRight size={14} /></button>
      </div>
      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
      <section className="rounded-2xl border border-border/80 bg-card">
        <div className="border-b border-border/70 p-4"><h2 className="text-sm font-semibold">{t("aiAutomation.savedAutomations", "Vos automatisations")}</h2></div>
        {loading ? <p role="status" className="p-4 text-sm text-muted-foreground">{t("aiAutomation.loadingAutomations", "Chargement…")}</p> : automations.length === 0 ? <p className="p-4 text-sm text-muted-foreground">{t("aiAutomation.noAutomations", "Aucune automatisation créée.")}</p> : (
          <div className="divide-y divide-border/70">{automations.map((automation) => (
            <div key={automation.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div><p className="text-sm font-medium">{automation.name}</p><p className="text-xs text-muted-foreground">{automation.description}</p></div>
              <div className="flex items-center gap-2"><button type="button" onClick={() => void toggleAutomation(automation)} className="min-h-9 rounded-lg border border-border px-3 text-xs">{automation.enabled ?? automation.status === "active" ? t("aiAutomation.pause", "Mettre en pause") : t("aiAutomation.activate", "Activer")}</button><button type="button" onClick={() => void removeAutomation(automation)} className="min-h-9 rounded-lg border border-border px-3 text-xs text-destructive">{t("aiAutomation.delete", "Supprimer")}</button></div>
            </div>
          ))}</div>
        )}
      </section>
      <section className="rounded-2xl border border-border/80 bg-card">
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold">{t("aiAutomation.templatesTitle")}</h2><p className="mt-1 text-xs text-muted-foreground">{t("aiAutomation.templatesSubtitle")}</p></div><div className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("aiAutomation.searchTemplates")} className="min-h-9 min-w-0 rounded-lg border border-border bg-background px-3 text-xs sm:w-48" /><select aria-label={t("aiAutomation.filterLabel")} value={filter} onChange={(event) => setFilter(event.target.value)} className="min-h-9 rounded-lg border border-border bg-background px-3 text-xs"><option value="all">{t("aiAutomation.filterAll")}</option><option value="pro">Pro</option><option value="max">Max</option></select></div></div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((item) => <article key={item.id} className="flex min-h-48 flex-col rounded-xl border border-border/80 p-4"><div className="flex justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary"><Workflow size={17} /></span><span className="h-fit rounded-md bg-muted px-2 py-1 text-[10px] font-semibold">{t(`aiAutomation.plan.${item.plan}`)}</span></div><h3 className="mt-3 text-sm font-semibold">{t(`aiAutomation.template.${item.title}`)}</h3><p className="mt-1 flex-1 text-xs leading-5 text-muted-foreground">{t(`aiAutomation.template.${item.detail}`)}</p><div className="mt-3 space-y-1 border-t border-border/60 pt-3 text-[11px]"><p><b>{t("aiAutomation.trigger")}:</b> {t(`aiAutomation.trigger.${item.trigger}`)}</p><p><b>{t("aiAutomation.action")}:</b> {t(`aiAutomation.action.${item.action}`)}</p></div><button onClick={() => allowed ? openBuilder(item.id) : navigate("/subscription")} className="mt-3 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-border text-xs font-medium hover:border-primary/40">{allowed ? t("aiAutomation.configure") : t("aiAutomation.unlockTemplate")} {allowed ? <ArrowRight size={13} /> : <LockKeyhole size={13} />}</button></article>)}</div>
      </section>
      <section className="rounded-2xl border border-border/80 bg-card p-4"><h2 className="text-sm font-semibold">{t("aiAutomation.executionHistory")}</h2><div className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center"><Clock3 size={19} className="mx-auto text-muted-foreground" /><p className="mt-2 text-xs font-medium">{t("aiAutomation.noExecutions")}</p><p className="mt-1 text-[11px] text-muted-foreground">{t("aiAutomation.historyBackendRequired")}</p></div></section>
      {selected && <div role="dialog" aria-modal="true" aria-labelledby="builder-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl"><h2 id="builder-title" className="text-base font-semibold">{t("aiAutomation.builderTitle")}</h2><p className="mt-1 text-xs text-muted-foreground">{t("aiAutomation.configureTemplate", "Configurez le workflow puis enregistrez-le sur votre compte.")}</p><div className="mt-4 space-y-3"><label className="block text-xs font-medium">{t("aiAutomation.workflowName")}<input value={workflowName} onChange={(event) => setWorkflowName(event.target.value)} className="mt-1.5 min-h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" placeholder={t("aiAutomation.workflowNamePlaceholder")} /></label><label className="block text-xs font-medium">{t("aiAutomation.workflowDescription")}<textarea value={workflowDescription} onChange={(event) => setWorkflowDescription(event.target.value)} rows={2} className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-sm" /></label><p className="text-xs text-muted-foreground">{selectedTemplate && `${t("aiAutomation.trigger")}: ${t(`aiAutomation.trigger.${selectedTemplate.trigger}`)} · ${t("aiAutomation.action")}: ${t(`aiAutomation.action.${selectedTemplate.action}`)}`}</p></div><div className="mt-5 flex justify-end gap-2"><button onClick={() => setSelected(null)} className="min-h-10 rounded-lg border border-border px-4 text-xs font-medium">{t("aiAutomation.cancel")}</button><button onClick={() => void saveAutomation(false)} disabled={saving || !workflowName.trim()} className="min-h-10 rounded-lg bg-primary px-4 text-xs font-semibold text-white disabled:opacity-50">{t("aiAutomation.saveDraft")}</button><button onClick={() => void saveAutomation(true)} disabled={saving || !workflowName.trim()} className="min-h-10 rounded-lg border border-primary/20 px-4 text-xs font-semibold text-primary disabled:opacity-50">{saving ? t("aiAutomation.saving", "Enregistrement…") : t("aiAutomation.activate")}</button></div></div></div>}
    </div>
  )
};
