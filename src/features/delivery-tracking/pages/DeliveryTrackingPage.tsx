import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Info,
  MapPin,
  AlertCircle,
} from "lucide-react"

import { PageHeader, KpiCard, Button } from "@/components/ui"
import { useDeliveryTracking } from "../hooks/useDeliveryTracking"
import { DeliveryMap } from "../components/DeliveryMap"
import { DeliveryList } from "../components/DeliveryList"
import { DeliveryFilters } from "../components/DeliveryFilters"
import { DeliveryDetails } from "../components/DeliveryDetails"
import type { DeliveryRecord, Coordinates } from "../types/deliveryTracking.types"

export default function DeliveryTrackingPage() {
  const { t } = useTranslation()
  const {
    deliveries,
    stats,
    loading,
    error,
    selectedDelivery,
    selectedDeliveryId,
    selectDelivery,
    filters,
    setFilters,
    isSimulating,
    toggleSimulation,
    refresh,
  } = useDeliveryTracking()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showTrajectories, setShowTrajectories] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [focusRequest, setFocusRequest] = useState<{
    id: string
    coordinates: Coordinates
    timestamp: number
  } | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Selecting a delivery sets it as active and opens details drawer
  const handleSelectDelivery = (record: DeliveryRecord) => {
    selectDelivery(record.id)
    setIsDrawerOpen(true)
  }

  // Focusing on courier centers camera and minimizes drawer so seller sees map
  const handleFocusDelivery = (record: DeliveryRecord) => {
    selectDelivery(record.id)
    setFocusRequest({
      id: record.id,
      coordinates: record.coordinates,
      timestamp: Date.now(),
    })
    setIsDrawerOpen(false)

    const mapEl = document.getElementById("delivery-map-wrapper")
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }

  // Closing drawer only hides the side panel; tracking and map focus REMAIN active!
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
  }

  // Explicitly stopping tracking
  const handleStopTracking = () => {
    selectDelivery(null)
    setIsDrawerOpen(false)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ── */}
      <PageHeader
        title={t("deliveries.title", "Suivi des Livraisons")}
        subtitle={t(
          "deliveries.subtitle",
          "Visualisez et suivez en temps réel la progression de vos commandes sur la carte d'Antananarivo"
        )}
        badge={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {t("deliveries.simulatedData", "Données simulées")}
            </span>
            {isSimulating && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                <Sparkles size={11} className="text-teal-500 animate-spin" />
                {t("deliveries.telemetryActive", "Télémétrie active")}
              </span>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              loading={isRefreshing || loading}
              className="gap-1.5"
            >
              <RotateCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              {t("deliveries.refresh", "Actualiser")}
            </Button>
          </div>
        }
      />

      {/* ── Error Banner ── */}
      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-center gap-3 text-rose-700 dark:text-rose-400 text-xs sm:text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <p className="flex-1 font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            {t("deliveries.refresh", "Réessayer")}
          </Button>
        </div>
      )}

      {/* ── Context Alert Banner (Mock Explanation) ── */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
          <Info size={18} />
        </div>
        <div className="flex-1 text-xs sm:text-sm">
          <p className="font-semibold text-foreground">
            {t("deliveries.bannerTitle", "Mode Démonstration Logistique")}
          </p>
          <p className="text-muted-foreground mt-0.5 leading-relaxed">
            {t(
              "deliveries.bannerDesc",
              "Ce tableau de bord cartographique simule le suivi GPS des coursiers partenaires sur l'agglomération d'Antananarivo (Analakely, Ankorondrano, Ivato, Tanjombato). Activez le bouton « Simuler GPS » pour observer les mises à jour de position en direct."
            )}
          </p>
        </div>
      </div>

      {/* ── Summary Metrics Cards ── */}
      <div data-tour="deliveries-kpis" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t("deliveries.kpiInTransit", "En cours de livraison")}
          value={stats.inTransit.toString()}
          icon={<Truck size={20} className="text-teal-600 dark:text-teal-400" />}
          accent={true}
          subtitle={t("deliveries.kpiInTransitSub", "Coursiers en route")}
        />

        <KpiCard
          label={t("deliveries.kpiAwaiting", "En attente d'expédition")}
          value={stats.awaitingDispatch.toString()}
          icon={<Clock size={20} className="text-amber-600 dark:text-amber-400" />}
          subtitle={t("deliveries.kpiAwaitingSub", "Colis préparés")}
        />

        <KpiCard
          label={t("deliveries.kpiDelivered", "Livrées aujourd'hui")}
          value={stats.deliveredToday.toString()}
          icon={<CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />}
          subtitle={t("deliveries.kpiDeliveredSub", "Remises aux clients")}
        />

        <KpiCard
          label={t("deliveries.kpiDelayed", "Livraisons retardées")}
          value={stats.delayed.toString()}
          icon={<AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />}
          subtitle={t("deliveries.kpiDelayedSub", "Trafic ou reprogrammé")}
        />
      </div>

      {/* ── Interactive Filters & Telemetry Controls ── */}
      <div data-tour="deliveries-filters">
        <DeliveryFilters
          filters={filters}
          onChangeFilters={setFilters}
          stats={stats}
          isSimulating={isSimulating}
          onToggleSimulation={toggleSimulation}
        />
      </div>

      {/* ── Main Workspace: Interactive Map & Delivery List ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Map Container (7 columns on desktop) */}
        <div data-tour="deliveries-map" className="lg:col-span-7 xl:col-span-8 bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border/60 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <h2 className="text-xs sm:text-sm font-bold text-foreground">
                {t("deliveries.mapTitle", "Cartographie en Direct - Grand Antananarivo")}
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {deliveries.length} {t("deliveries.markersCount", "points affichés")}
            </span>
          </div>

          <div className="h-[460px] sm:h-[540px] lg:h-[620px] w-full relative">
            <DeliveryMap
              deliveries={deliveries}
              selectedDelivery={selectedDelivery}
              onSelectDelivery={handleSelectDelivery}
              onClearSelection={handleStopTracking}
              onOpenDetails={() => setIsDrawerOpen(true)}
              focusRequest={focusRequest}
              showTrajectories={showTrajectories}
              onToggleTrajectories={() => setShowTrajectories((prev) => !prev)}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
              filters={filters}
              onChangeFilters={setFilters}
              stats={stats}
              isSimulating={isSimulating}
              onToggleSimulation={toggleSimulation}
            />
          </div>
        </div>

        {/* Deliveries Synchronized List (5 columns on desktop) */}
        <div data-tour="deliveries-list" className="lg:col-span-5 xl:col-span-4 bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden flex flex-col h-[460px] sm:h-[540px] lg:h-[680px]">
          <DeliveryList
            deliveries={deliveries}
            selectedDeliveryId={selectedDeliveryId}
            onSelectDelivery={handleSelectDelivery}
          />
        </div>
      </div>

      {/* ── Slide-over Details Drawer ── */}
      <DeliveryDetails
        delivery={isDrawerOpen ? selectedDelivery : null}
        onClose={handleCloseDrawer}
        onFocusOnMap={handleFocusDelivery}
      />
    </div>
  )
}
