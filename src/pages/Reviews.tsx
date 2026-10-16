import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Star,
  MessageSquare,
  Send,
} from "lucide-react"
import { getStoreReviews, replyToReview } from "@/service/review"
import type { Review } from "@/type/review"
import { useStore } from "@/context/useStore"
import {
  PageHeader,
  Button,
  Stars,
  Badge,
  EmptyState,
  Card,
  Toast,
  Pagination,
} from "@/components/ui"

const QUICK_TEMPLATES = [
  {
    label: "Remerciement",
    text: "Merci beaucoup pour votre confiance et ce retour chaleureux ! Au plaisir de vous servir à nouveau sur Nova Market. 🙏",
  },
  {
    label: "Satisfaction",
    text: "Ravis que votre commande soit arrivée en parfait état et à votre entière satisfaction ! 📦",
  },
  {
    label: "Support & Écoute",
    text: "Merci pour votre avis. Nous prenons bien note de votre remarque afin de perfectionner notre qualité de service. 🤝",
  },
]

const Reviews = () => {
  const { t } = useTranslation()
  const { selectedStore, loading: storeLoading } = useStore()
  const [localReviews, setLocalReviews] = useState<Review[]>([])
  const [page, setPage] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  const [ratingBreakdown, setRatingBreakdown] = useState<Record<1 | 2 | 3 | 4 | 5, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  const [serverAverage, setServerAverage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [savingReply, setSavingReply] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [replyFilter, setReplyFilter] = useState<"all" | "unreplied" | "replied">("all")
  const [toast, setToast] = useState<string | null>(null)
  const [openReplyId, setOpenReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const PAGE_SIZE = 8
  const selectedStoreId = selectedStore?.id

  useEffect(() => {
    if (storeLoading) return
    if (!selectedStoreId) {
      setLoading(false)
      setError("Aucune boutique n’est sélectionnée.")
      return
    }
    let active = true
    setLoading(true)
    setError(null)
    getStoreReviews(selectedStoreId, page, PAGE_SIZE, ratingFilter ?? undefined, replyFilter === "all" ? undefined : replyFilter === "replied").then((response) => {
      if (!active) return
      setLocalReviews(response.data)
      setTotalReviews(response.meta.total)
      setRatingBreakdown(response.ratingBreakdown)
      setServerAverage(response.averageRating)
    }).catch(() => {
      if (active) setError("Les avis n’ont pas pu être chargés. Vérifiez votre connexion puis réessayez.")
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [selectedStoreId, storeLoading, ratingFilter, replyFilter, page])

  const showNotification = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

           
  const filtered = localReviews.filter((r) => {
    const matchRating = ratingFilter === null || r.rating === ratingFilter
    const matchReply =
      replyFilter === "all" ||
      (replyFilter === "unreplied" && !r.replied) ||
      (replyFilter === "replied" && r.replied)
    return matchRating && matchReply
  })

  const averageRating = serverAverage.toFixed(1)

  const ratingDist = [5, 4, 3, 2, 1].map((stars) => {
    const count = ratingBreakdown[stars as 1 | 2 | 3 | 4 | 5]
    const total = Object.values(ratingBreakdown).reduce((sum, value) => sum + value, 0)
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    return { stars, count, pct }
  })

  const totalRatingCount = Object.values(ratingBreakdown).reduce((sum, value) => sum + value, 0)
  const positiveReviewRate = totalRatingCount
    ? Math.round(((ratingBreakdown[4] + ratingBreakdown[5]) / totalRatingCount) * 100)
    : 0

  async function handleSendReply(reviewId: string) {
    if (!replyText.trim()) return
    setSavingReply(true)
    setReplyError(null)
    try {
      const updated = await replyToReview(reviewId, replyText.trim())
      setLocalReviews((prev) => prev.map((review) => review.id === reviewId ? updated : review))
      setOpenReplyId(null)
      setReplyText("")
      showNotification("Votre réponse a été publiée avec succès")
    } catch {
      setReplyError("Votre réponse n’a pas pu être publiée. Réessayez.")
    } finally {
      setSavingReply(false)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      <PageHeader
        title={t("reviews.title")}
        subtitle={t("reviews.subtitle")}
        badge={
          <Badge variant="primary" dot>
            {totalReviews} avis reçus
          </Badge>
        }
      />
      {error && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">{error}</div>}
      {loading && <div role="status" aria-live="polite" className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Chargement des avis…</div>}

      
      {replyError && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">{replyError}</div>}
      {!loading && !error && <><div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div data-tour="reviews-score" className="bg-card rounded-2xl border border-border/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t("reviews.satisfaction")}
            </p>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="font-display font-extrabold text-5xl text-foreground tabular-nums">
                {averageRating}
              </span>
              <span className="text-muted-foreground text-sm font-semibold">/ 5.0</span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Stars rating={Number(averageRating)} />
              <span className="text-xs text-muted-foreground font-medium">
                ({localReviews.length} avis)
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 mt-4 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Taux d'avis positifs</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {positiveReviewRate}% de satisfaction
            </span>
          </div>
        </div>

        
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/80 p-6 shadow-xs space-y-2.5 flex flex-col justify-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Répartition par note
          </p>

          {ratingDist.map((item) => (
            <button
              key={item.stars}
              type="button"
              onClick={() => {
                setRatingFilter(ratingFilter === item.stars ? null : item.stars)
                setPage(1)
              }}
              className={`w-full flex items-center gap-3 text-xs group transition-colors cursor-pointer p-1 rounded-lg ${
                ratingFilter === item.stars ? "bg-primary/10" : "hover:bg-muted/40"
              }`}
            >
              <span className="w-12 text-left font-bold text-foreground shrink-0 flex items-center gap-1">
                <span>{item.stars}</span>
                <Star size={11} className="fill-amber-400 text-amber-400" />
              </span>

              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${item.pct}%` }}
                />
              </div>

              <span className="w-16 text-right font-medium text-muted-foreground tabular-nums shrink-0">
                {item.count} ({item.pct}%)
              </span>
            </button>
          ))}
        </div>
      </div>

      
      <div data-tour="reviews-filters" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => { setRatingFilter(null); setReplyFilter("all"); setPage(1) }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              ratingFilter === null && replyFilter === "all"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Tous les avis ({totalReviews})
          </button>

          <button
            onClick={() => { setReplyFilter(replyFilter === "unreplied" ? "all" : "unreplied"); setPage(1) }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              replyFilter === "unreplied"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-600 hover:bg-amber-500/10"
            }`}
          >
            À répondre
          </button>

          <button
            onClick={() => { setReplyFilter(replyFilter === "replied" ? "all" : "replied"); setPage(1) }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              replyFilter === "replied"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Déjà répondu
          </button>

          {ratingFilter !== null && (
            <button
              onClick={() => { setRatingFilter(null); setPage(1) }}
              className="px-2.5 py-1 rounded-xl text-xs bg-muted text-foreground flex items-center gap-1 cursor-pointer"
            >
              Filtre: {ratingFilter}★ ✕
            </button>
          )}
        </div>
      </div>

      
      <div data-tour="reviews-list" className="space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Star size={22} />}
              title="Aucun avis correspondant"
              description="Aucun avis ne répond aux critères de filtrage sélectionnés."
            />
          </Card>
        ) : (
          filtered.map((review, idx) => {
            const isReplying = openReplyId === review.id

            return (
              <div
                key={review.id}
                data-tour={idx === 0 ? "reviews-reply" : undefined}
                className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs space-y-4 hover:border-border transition-colors"
              >
                
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-display font-bold text-xs shrink-0">
                      {review.customerName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-foreground">
                        {review.customerName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Produit : <span className="font-semibold text-foreground">{review.productName}</span> · {new Date(review.date).toLocaleDateString("fr-MG")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Stars rating={review.rating} />
                    {review.replied ? (
                      <Badge variant="success">Répondu</Badge>
                    ) : (
                      <Badge variant="warning">En attente</Badge>
                    )}
                  </div>
                </div>

                
                <p className="text-sm text-foreground leading-relaxed pl-13">
                  "{review.comment}"
                </p>

                
                {review.replied && review.reply && (
                  <div className="ml-13 p-4 rounded-xl bg-muted/50 border border-border/60 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <p className="text-xs font-bold text-foreground">
                        Réponse de votre boutique
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-4">
                      {review.reply}
                    </p>
                  </div>
                )}

                
                {!review.replied && (
                  <div className="pl-13 pt-1">
                    {isReplying ? (
                      <div className="p-4 rounded-2xl bg-muted/50 border border-border/80 space-y-3 animate-fade-in">
                        <label className="text-xs font-bold text-foreground block">
                          Votre réponse au client :
                        </label>

                        
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-muted-foreground font-medium">Modèles rapides :</span>
                          {QUICK_TEMPLATES.map((tmpl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setReplyText(tmpl.text)}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-card border border-border/80 text-foreground hover:bg-primary hover:text-white transition-colors cursor-pointer text-left font-medium"
                              title={tmpl.text}
                            >
                              {tmpl.label}
                            </button>
                          ))}
                        </div>

                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={t("reviews.replyPlaceholder")}
                          className="w-full p-3 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />

                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setOpenReplyId(null)
                              setReplyText("")
                            }}
                          >
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={!replyText.trim() || savingReply}
                            onClick={() => void handleSendReply(review.id)}
                          >
                            <Send size={13} />
                            {savingReply ? "Publication…" : t("reviews.sendReply")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setOpenReplyId(review.id)
                          setReplyText(QUICK_TEMPLATES[0].text)
                        }}
                      >
                        <MessageSquare size={13} />
                        Répondre à cet avis
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      <Pagination
        page={page}
        total={totalReviews}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />
      </>}

      
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
};
export default Reviews
