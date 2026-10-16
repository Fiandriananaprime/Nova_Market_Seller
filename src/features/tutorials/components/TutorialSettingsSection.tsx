import { useTranslation } from "react-i18next"
import {
  Sparkles,
  Play,
  RotateCcw,
  ShoppingBag,
  Package,
  Warehouse,
  BarChart3,
  Truck,
  Users,
  Star,
  Store,
  Settings,
  BookOpen,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardBody, Button, Badge } from "@/components/ui"
import { useTutorial } from "../hooks/useTutorial"
import type { TourId } from "../types"

interface TourCardItem {
  id: TourId
  titleKey: string
  descKey: string
  icon: typeof Sparkles
  color: string
  stepCount: number
  complexity: "débutant" | "intermédiaire" | "avancé"
}

const AVAILABLE_TOURS: TourCardItem[] = [
  {
    id: "orders",
    titleKey: "tutorials.settings.ordersTour.title",
    descKey: "tutorials.settings.ordersTour.desc",
    icon: ShoppingBag,
    color: "bg-primary/10 text-primary",
    stepCount: 4,
    complexity: "débutant",
  },
  {
    id: "products",
    titleKey: "tutorials.settings.productsTour.title",
    descKey: "tutorials.settings.productsTour.desc",
    icon: Package,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    stepCount: 4,
    complexity: "débutant",
  },
  {
    id: "inventory",
    titleKey: "tutorials.settings.inventoryTour.title",
    descKey: "tutorials.settings.inventoryTour.desc",
    icon: Warehouse,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    stepCount: 4,
    complexity: "intermédiaire",
  },
  {
    id: "deliveries",
    titleKey: "tutorials.settings.deliveriesTour.title",
    descKey: "tutorials.settings.deliveriesTour.desc",
    icon: Truck,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    stepCount: 5,
    complexity: "intermédiaire",
  },
  {
    id: "customers",
    titleKey: "tutorials.settings.customersTour.title",
    descKey: "tutorials.settings.customersTour.desc",
    icon: Users,
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    stepCount: 4,
    complexity: "intermédiaire",
  },
  {
    id: "reviews",
    titleKey: "tutorials.settings.reviewsTour.title",
    descKey: "tutorials.settings.reviewsTour.desc",
    icon: Star,
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    stepCount: 4,
    complexity: "débutant",
  },
  {
    id: "analytics",
    titleKey: "tutorials.settings.analyticsTour.title",
    descKey: "tutorials.settings.analyticsTour.desc",
    icon: BarChart3,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    stepCount: 4,
    complexity: "avancé",
  },
  {
    id: "store",
    titleKey: "tutorials.settings.storeTour.title",
    descKey: "tutorials.settings.storeTour.desc",
    icon: Store,
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    stepCount: 4,
    complexity: "débutant",
  },
  {
    id: "settings",
    titleKey: "tutorials.settings.settingsTour.title",
    descKey: "tutorials.settings.settingsTour.desc",
    icon: Settings,
    color: "bg-muted/80 text-foreground",
    stepCount: 4,
    complexity: "débutant",
  },
]

const COMPLEXITY_BADGE: Record<string, string> = {
  débutant: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  intermédiaire: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  avancé: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
}

export const TutorialSettingsSection = () => {
  const { t } = useTranslation()
  const { replayTour, isTourActive } = useTutorial()

  const totalTours = AVAILABLE_TOURS.length + 1                
  const totalSteps = AVAILABLE_TOURS.reduce((s, t) => s + t.stepCount, 0) + 9                      

  return (
    <Card className="border border-border/80 shadow-xs overflow-hidden">
      <CardHeader className="bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <BookOpen size={18} />
          </div>
          <div>
            <CardTitle>{t("tutorials.settings.title")}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("tutorials.settings.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary">{totalTours} visites</Badge>
          <Badge variant="neutral">{totalSteps} étapes</Badge>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        
        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-teal-500/10 to-card border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-sm text-foreground">
                {t("tutorials.settings.mainTour.title")}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400">
                Recommandé en premier
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                9 étapes
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-lg">
              {t("tutorials.settings.mainTour.desc")}
            </p>
          </div>

          <Button
            size="md"
            variant="primary"
            disabled={isTourActive}
            onClick={() => replayTour("onboarding")}
            className="shrink-0"
          >
            <Play size={14} className="fill-current" />
            {t("tutorials.settings.launchMainTour")}
          </Button>
        </div>

        
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={12} className="text-primary" />
            {t("tutorials.settings.sectionTours")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {AVAILABLE_TOURS.map((tour) => {
              const Icon = tour.icon

              return (
                <div
                  key={tour.id}
                  className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/30 hover:shadow-xs transition-all flex flex-col gap-3"
                >
                  
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tour.color}`}>
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-xs text-foreground leading-tight">
                          {t(tour.titleKey)}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${COMPLEXITY_BADGE[tour.complexity]}`}
                          >
                            {tour.complexity}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {tour.stepCount} étapes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {t(tour.descKey)}
                  </p>

                  
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isTourActive}
                    onClick={() => replayTour(tour.id)}
                    className="w-full mt-auto"
                  >
                    <RotateCcw size={12} />
                    {t("tutorials.settings.replay")}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

        
        <div className="rounded-xl bg-muted/50 border border-border/50 px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles size={13} className="text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Astuce :</strong> Vous pouvez relancer n'importe quelle visite à tout moment, même si vous avez déjà parcouru la section. Les tours ne modifient aucune donnée.
          </span>
        </div>
      </CardBody>
    </Card>
  )
};
