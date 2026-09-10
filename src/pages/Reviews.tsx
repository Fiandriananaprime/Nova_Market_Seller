import { useState } from "react";
import { Star, MessageSquare, Filter } from "lucide-react";
import { reviews, type Review } from "../data/mock";
import { PageHeader, Stars, Badge, EmptyState, Card, Toast } from "../components/ui";

const RATING_DIST = [
  { stars: 5, count: 312, pct: 72 },
  { stars: 4, count: 87, pct: 20 },
  { stars: 3, count: 21, pct: 5 },
  { stars: 2, count: 7, pct: 2 },
  { stars: 1, count: 3, pct: 1 },
];

function ReviewCard({ review, onReply }: { review: Review; onReply: (id: string, text: string) => void }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState(review.reply ?? "");

  return (
    <div className="p-5 border-b border-border last:border-0">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-700 text-sm flex-shrink-0">
          {review.customerInitials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <p className="text-sm font-600 text-foreground">{review.customerName}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(review.date).toLocaleDateString("fr-MG", { year: "numeric", month: "long", day: "numeric" })}
                {" · "}
                <span className="text-foreground">{review.productName}</span>
              </p>
            </div>
            <Stars rating={review.rating} />
          </div>

          <p className="text-sm text-foreground leading-relaxed mb-3">{review.comment}</p>

          {/* Reply */}
          {review.replied && review.reply && (
            <div className="mt-3 pl-4 border-l-2 border-accent">
              <p className="text-xs font-600 text-accent mb-1">Votre réponse</p>
              <p className="text-xs text-muted-foreground">{review.reply}</p>
            </div>
          )}

          {!review.replied && (
            replyOpen ? (
              <div className="mt-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Répondre à cet avis..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setReplyOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => { onReply(review.id, replyText); setReplyOpen(false); }}
                    disabled={!replyText.trim()}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Publier la réponse
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setReplyOpen(true)}
                className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline mt-1 cursor-pointer"
              >
                <MessageSquare size={12} />
                Répondre à cet avis
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function Reviews() {
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [repliedFilter, setRepliedFilter] = useState<boolean | null>(null);
  const [localReviews, setLocalReviews] = useState(reviews);
  const [toast, setToast] = useState<string | null>(null);

  const avgRating = (localReviews.reduce((s, r) => s + r.rating, 0) / localReviews.length).toFixed(1);
  const unreplied = localReviews.filter((r) => !r.replied).length;

  const filtered = localReviews.filter((r) => {
    const matchRating = ratingFilter === null || r.rating === ratingFilter;
    const matchReplied = repliedFilter === null || r.replied === repliedFilter;
    return matchRating && matchReplied;
  });

  function handleReply(id: string, text: string) {
    setLocalReviews((prev) => prev.map((r) => r.id === id ? { ...r, replied: true, reply: text } : r));
    setToast("Réponse publiée avec succès");
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Avis clients"
        subtitle={`${localReviews.length} avis · Note moyenne ${avgRating}/5`}
      />

      {/* Overview */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Rating summary */}
        <Card className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <p className="font-display font-800 text-4xl text-foreground">{avgRating}</p>
              <Stars rating={Number(avgRating)} />
              <p className="text-[10px] text-muted-foreground mt-1">{localReviews.length} avis</p>
            </div>
          </div>
          <div className="space-y-2">
            {RATING_DIST.map((d) => (
              <button
                key={d.stars}
                onClick={() => setRatingFilter(ratingFilter === d.stars ? null : d.stars)}
                className={`w-full flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 transition-colors ${ratingFilter === d.stars ? "bg-primary/5" : "hover:bg-muted"}`}
              >
                <span className="text-xs font-medium text-muted-foreground w-8 text-right">{d.stars}★</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground w-8">{d.count}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Quick stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3 content-start">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Note moyenne</p>
            <p className="font-display font-700 text-2xl text-foreground">{avgRating} <span className="text-lg text-amber-400">★</span></p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Sans réponse</p>
            <p className={`font-display font-700 text-2xl ${unreplied > 0 ? "text-[var(--warning)]" : "text-foreground"}`}>{unreplied}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Avis 5 étoiles</p>
            <p className="font-display font-700 text-2xl text-foreground">{RATING_DIST[0].count}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Taux de réponse</p>
            <p className="font-display font-700 text-2xl text-[var(--success)]">
              {Math.round((localReviews.filter((r) => r.replied).length / localReviews.length) * 100)}%
            </p>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1">
          <button
            onClick={() => setRepliedFilter(null)}
            className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${repliedFilter === null ? "bg-primary border-primary text-white" : "border-border bg-card text-muted-foreground"}`}
          >
            Tous
          </button>
          <button
            onClick={() => setRepliedFilter(false)}
            className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${repliedFilter === false ? "bg-primary border-primary text-white" : "border-border bg-card text-muted-foreground"}`}
          >
            Sans réponse
          </button>
          <button
            onClick={() => setRepliedFilter(true)}
            className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${repliedFilter === true ? "bg-primary border-primary text-white" : "border-border bg-card text-muted-foreground"}`}
          >
            Avec réponse
          </button>
        </div>
        {ratingFilter !== null && (
          <button
            onClick={() => setRatingFilter(null)}
            className="px-3 py-2 text-xs font-medium rounded-md border border-primary/30 bg-primary/5 text-primary"
          >
            Note: {ratingFilter}★ ✕
          </button>
        )}
      </div>

      {/* Reviews list */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={<Star size={20} />} title="Aucun avis" description="Les avis de vos clients apparaîtront ici." />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((r) => (
              <ReviewCard key={r.id} review={r} onReply={handleReply} />
            ))}
          </div>
        )}
      </Card>

      {toast && <Toast message={toast} type="success" onDismiss={() => setToast(null)} />}
    </div>
  );
}
